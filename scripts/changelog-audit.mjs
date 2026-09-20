/**
 * Release-time changelog audit.
 *
 * `npm run validate` proves that a section for the new version EXISTS; nothing
 * proves that it COVERS the release. v1.6.0 shipped with two changes missing
 * because "summarize git log" invites sampling. This module derives the commit
 * range from the last tag and accounts for every commit in it.
 *
 * Judgment stays with the maintainer — no script can decide whether a given
 * commit deserves a note. What it can do is (a) print the range as a checklist
 * so the walk is concrete, and (b) fail on the one gap that is *provable*: a
 * pull request whose number the section never cites.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractChangelogSection } from "./frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Unit/record separators: git never emits them, and neither does any commit
// message we could plausibly receive, so they survive multi-line bodies that
// a newline-delimited format would split apart.
const FIELD = "\x1f";
const RECORD = "\x1e";

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/** git's output, or null when the command failed — "no such ref" is an answer. */
function gitOrNull(args, cwd) {
  try {
    return git(args, cwd).trim();
  } catch {
    return null;
  }
}

/**
 * The most recent RELEASE tag reachable from HEAD, or null when there is none —
 * a fresh repo or a shallow CI clone fetched without tags. Callers report the
 * skip rather than failing, because an unknowable range is not a gap.
 *
 * Matched against `v*` because that is the shape the release process creates
 * (`gh release create v<version>`). Without the filter any other tag — a
 * `nightly-*`, an experiment — would win `describe` and silently collapse the
 * range to nothing, turning this whole gate into a vacuous pass.
 */
export function lastTag(cwd) {
  return gitOrNull(["describe", "--tags", "--abbrev=0", "--match", "v*"], cwd);
}

/** True when `v<version>` exists, i.e. the version has already been released. */
export function isTagged(version, cwd) {
  return gitOrNull(["rev-parse", "--verify", `refs/tags/v${version}`], cwd) !== null;
}

const LOG_FORMAT = ["%H", "%an", "%P", "%s", "%b"].join(FIELD) + RECORD;

/** Parse `git log --format=LOG_FORMAT` output into commit records. */
export function parseCommitLog(stdout) {
  return stdout
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash, author, parents, subject, body] = record.split(FIELD);
      return { hash, author, parents: parents.split(" ").filter(Boolean), subject, body };
    });
}

/** Every commit in `<ref>..HEAD`, oldest first. */
export function commitsSince(ref, cwd) {
  return parseCommitLog(git(["log", `${ref}..HEAD`, `--format=${LOG_FORMAT}`, "--reverse"], cwd));
}

/**
 * Why a commit needs no changelog entry, or null when it needs one.
 *
 * These three are the only exemptions the release process recognizes. Internal
 * hardening with no user-visible change is NOT exempt, and neither is an
 * outside contributor's maintainer-facing fix.
 */
export function exemption(commit) {
  if (commit.parents.length > 1) return "merge — its branch commits are listed separately";
  if (/^chore\(release\): bump version to /.test(commit.subject)) return "release bump";
  if (/\[bot\]$/.test(commit.author) && /^chore(\([^)]*\))?: /.test(commit.subject)) return "bot chore";
  return null;
}

/**
 * The pull request a commit *is*, by GitHub's own merge subject conventions —
 * a squash merge's trailing `(#N)` or a merge commit's `Merge pull request #N`.
 * A `#N` anywhere else in the message is a reference to some other issue, not
 * this commit's identity, so it does not count.
 */
export function pullRequestOf(subject) {
  const match = subject.match(/^Merge pull request #(\d+)\b/) ?? subject.match(/\(#(\d+)\)$/);
  return match ? Number(match[1]) : null;
}

/**
 * The `Changelog:` trailer a commit carries, or null. A commit that lands
 * without a version bump declares its unwritten entry this way:
 *
 *   Changelog: added — platform docs and installer mappings are cross-checked
 *
 * A trailer rather than a prose phrase, because prose cannot tell a commit
 * deferring its own entry from one quoting another commit that did — a1036cc
 * quotes d4b5c40's wording and matched the phrase regex this replaced.
 */
export function changelogTrailer(body) {
  return body.match(/^Changelog:[ \t]*(.+?)[ \t]*$/m)?.[1] ?? null;
}

/** Every `#N` the section cites, as numbers. */
function citedPullRequests(section) {
  return new Set([...section.matchAll(/#(\d+)/g)].map((match) => Number(match[1])));
}

/**
 * Account for each commit: exempt, or a line the maintainer must walk. `gap`
 * marks the provable failure — a pull request the section never cites.
 */
export function auditRange(commits, section) {
  const cited = citedPullRequests(section);
  return commits.map((commit) => {
    const pr = pullRequestOf(commit.subject);
    return {
      ...commit,
      exempt: exemption(commit),
      pr,
      gap: pr !== null && !cited.has(pr),
      trailer: changelogTrailer(commit.body),
    };
  });
}

// ── CLI ────────────────────────────────────────────────────────────────────

function truncate(text, width) {
  return text.length <= width ? text : `${text.slice(0, width - 1)}…`;
}

/** Render the audit as a walkable checklist. Returns the lines to print. */
export function report(range, entries, sectionHeading) {
  const lines = [`Changelog audit — ${entries.length} commits in ${range}, against CHANGELOG.md § ${sectionHeading}`];
  const exempt = entries.filter((entry) => entry.exempt);
  const walk = entries.filter((entry) => !entry.exempt);

  if (exempt.length > 0) {
    lines.push("", `  no entry needed (${exempt.length})`);
    for (const entry of exempt) {
      lines.push(`    ${entry.hash.slice(0, 7)}  ${truncate(entry.subject, 52).padEnd(52)}  ${entry.exempt}`);
    }
  }

  if (walk.length > 0) {
    lines.push("", `  account for each of these (${walk.length}) — an entry in § ${sectionHeading}, or a reason it needs none:`);
    for (const entry of walk) {
      lines.push(`    [ ] ${entry.hash.slice(0, 7)}  ${truncate(entry.author, 14).padEnd(14)}  ${truncate(entry.subject, 56)}`);
      if (entry.trailer) lines.push(`        ⚠ Changelog: ${entry.trailer}`);
      if (entry.gap) lines.push(`        ⚠ PR #${entry.pr} is never cited in the section`);
    }
  }

  const gaps = entries.filter((entry) => entry.gap);
  lines.push("");
  lines.push(
    gaps.length === 0
      ? `  Every pull request in the range is cited. The ${walk.length} lines above still need your eyes.`
      : `  FAIL: ${gaps.length} pull request(s) merged in this range are never cited in § ${sectionHeading}:`,
  );
  for (const gap of gaps) lines.push(`    #${gap.pr}  ${gap.hash.slice(0, 7)}  ${truncate(gap.subject, 60)}`);
  return lines;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tag = lastTag(root);
  if (tag === null) {
    console.log("No tag is reachable from HEAD — nothing to audit against. (Shallow clone? `git fetch --tags`.)");
    process.exit(0);
  }
  const section = extractChangelogSection(readFileSync(path.join(root, "CHANGELOG.md"), "utf8"));
  if (section === "") {
    console.error("CHANGELOG.md has no `## [version] - date` heading to audit against.");
    process.exit(1);
  }
  const heading = section.split("\n")[0].replace(/^## /, "").trim();
  const entries = auditRange(commitsSince(tag, root), section);
  console.log(report(`${tag}..HEAD`, entries, heading).join("\n"));
  process.exit(entries.some((entry) => entry.gap) ? 1 : 0);
}
