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
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractChangelogSection } from "./frontmatter.mjs";
import { STAR_HISTORY_FILES } from "./gen-star-history.mjs";

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
 * Matched against `v[0-9]*` because that is the shape the release process creates
 * (`gh release create v<version>`). Without the filter any other tag — a
 * `nightly-*`, an experiment — would win `describe` and silently collapse the
 * range to nothing, turning this whole gate into a vacuous pass.
 */
/**
 * True when `cwd` is itself a git work tree root. git discovery walks upwards,
 * so a de-gitted copy of this repo sitting inside another one would otherwise
 * derive its range from the OUTER repo's tags — a nonsense range reported as
 * fact. An explicit skip beats a confident wrong answer.
 */
export function isRepoRoot(cwd) {
  const toplevel = gitOrNull(["rev-parse", "--show-toplevel"], cwd);
  // Both sides go through realpath: git always reports a resolved path, while
  // the caller's may cross a symlink (every macOS /var/folders temp dir does).
  // Comparing them raw would skip the audit on a path that is in fact the root.
  return toplevel !== null && realpathSync(toplevel) === realpathSync(cwd);
}

export function lastTag(cwd) {
  return gitOrNull(["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"], cwd);
}

/** True when `v<version>` exists, i.e. the version has already been released. */
export function isTagged(version, cwd) {
  return gitOrNull(["rev-parse", "--verify", `refs/tags/v${version}`], cwd) !== null;
}

// RECORD leads each commit and a trailing FIELD closes the body, so that
// `--name-only`'s file list — which git appends after the format — arrives as
// a field of its own instead of running into the next commit.
const LOG_FORMAT = RECORD + ["%H", "%an", "%P", "%s", "%b", ""].join(FIELD);

/** Parse `git log --format=LOG_FORMAT --name-only` output into commit records. */
export function parseCommitLog(stdout) {
  return stdout
    .split(RECORD)
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash, author, parents, subject, body, files = ""] = record.split(FIELD);
      return {
        hash,
        author,
        parents: parents.split(" ").filter(Boolean),
        subject,
        body,
        files: files.split("\n").filter(Boolean),
      };
    });
}

/** Every commit in `<ref>..HEAD`, oldest first, with the files each touched. */
export function commitsSince(ref, cwd) {
  return parseCommitLog(
    git(["log", `${ref}..HEAD`, `--format=${LOG_FORMAT}`, "--name-only", "--reverse"], cwd),
  );
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
  if (isStarHistoryRefresh(commit)) return "star history refresh";
  return null;
}

/**
 * The weekly chart refresh: a bot commit touching the two files the chart owns
 * and nothing else.
 *
 * Judged by what it changed, not by how it is titled. `[bot]` + `chore:` was a
 * proxy wide enough to swallow a `dependabot[bot]` `chore(deps): bump …`, and
 * a dependency bump is a change this repo's changelog records.
 */
function isStarHistoryRefresh(commit) {
  return (
    /\[bot\]$/.test(commit.author) &&
    commit.files.length > 0 &&
    commit.files.every((file) => STAR_HISTORY_FILES.includes(file))
  );
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
  const matches = [...(body ?? "").matchAll(/^Changelog:[ \t]*(.+?)[ \t]*$/gm)];
  return matches.at(-1)?.[1] ?? null;
}

/**
 * Every pull request the section cites, as numbers — written bare (`#25`, the
 * repo's convention) or linked by URL, since a `.../pull/25` link names it just
 * as plainly and failing on one would block a legitimate release.
 */
function citedPullRequests(section) {
  const matches = [...section.matchAll(/#(\d+)|\/pull\/(\d+)/g)];
  return new Set(matches.map((match) => Number(match[1] ?? match[2])));
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

/**
 * The release-time coverage verdict for a repository, as `{ skipped, errors }`,
 * plus `{ range, commitCount }` on the one path that actually audits.
 *
 * Lives here rather than inside validate-repo.mjs so it can be pointed at a
 * throwaway repository and tested: validate-repo.mjs resolves its root from
 * `__dirname` and can only ever audit brooks-lint itself, which is tagged, so
 * a test there would exercise nothing but the skip.
 *
 * `skipped` names why the audit did not run, and is null when it did. Callers
 * must say so out loud — a gate whose off-state looks exactly like its pass
 * is the silence this whole check exists to remove. `range` and `commitCount`
 * are the facts that announcement needs, and are present only when `skipped`
 * is null. `commitCount` counts the whole range, exemptions included, so it
 * matches the count `report()` heads its checklist with.
 */
export function coverageVerdict({ version, cwd, changelog }) {
  if (!isRepoRoot(cwd)) return { skipped: `${cwd} is not a git work tree root`, errors: [] };
  if (isTagged(version, cwd)) return { skipped: `v${version} is already tagged`, errors: [] };

  const section = extractChangelogSection(changelog);
  const heading = section.split("\n")[0].replace(/^## /, "").trim();
  // The section still describes the previous release, which checkChangelog()
  // already reports. Auditing against it would name a section that does not
  // exist yet and tell the maintainer to add an entry to it.
  if (!heading.startsWith(`[${version}]`)) {
    return { skipped: `CHANGELOG.md has no [${version}] section yet`, errors: [] };
  }

  const tag = lastTag(cwd);
  if (tag === null) return { skipped: "no release tag is reachable from HEAD", errors: [] };

  const commits = commitsSince(tag, cwd);
  return {
    skipped: null,
    range: `${tag}..HEAD`,
    commitCount: commits.length,
    errors: auditRange(commits, section)
      .filter((entry) => entry.gap)
      .map(
        (entry) =>
          `CHANGELOG.md ${heading} never cites #${entry.pr}, merged into ${tag}..HEAD as ` +
          `${entry.hash.slice(0, 7)} — add it to the section or record why it needs no entry ` +
          `(see npm run changelog:audit)`,
      ),
  };
}

// ── CLI ────────────────────────────────────────────────────────────────────

function truncate(text, width) {
  return text.length <= width ? text : `${text.slice(0, width - 1)}…`;
}

/** `1 commit` / `2 commits` — a count that reads as English at either end. */
export function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * Render the audit as a walkable checklist. Returns the lines to print.
 *
 * `enforce: false` drops the pass/fail verdict, for the between-releases view
 * where an uncited pull request describes a backlog rather than a defect.
 */
export function report(range, entries, sectionHeading, { enforce = true } = {}) {
  // Handled here rather than in the CLI so the wording right after a release —
  // the most common moment to run this — is reachable from a test.
  if (entries.length === 0) return [`Nothing to audit — ${range} is empty.`];

  const target = enforce ? `CHANGELOG.md § ${sectionHeading}` : "the next release's section";
  const lines = [`Changelog audit — ${plural(entries.length, "commit")} in ${range}, against ${target}`];
  const exempt = entries.filter((entry) => entry.exempt);
  const walk = entries.filter((entry) => !entry.exempt);

  if (exempt.length > 0) {
    lines.push("", `  no entry needed (${exempt.length})`);
    for (const entry of exempt) {
      lines.push(`    ${entry.hash.slice(0, 7)}  ${truncate(entry.subject, 52).padEnd(52)}  ${entry.exempt}`);
    }
  }

  if (walk.length > 0) {
    lines.push("", `  account for each of these (${walk.length}) — an entry in ${target}, or a reason it needs none:`);
    for (const entry of walk) {
      lines.push(`    [ ] ${entry.hash.slice(0, 7)}  ${truncate(entry.author, 14).padEnd(14)}  ${truncate(entry.subject, 56)}`);
      if (entry.trailer) lines.push(`        ⚠ Changelog: ${entry.trailer}`);
      if (entry.gap && enforce) lines.push(`        ⚠ PR #${entry.pr} is never cited in the section`);
    }
  }

  if (!enforce) return lines;

  const gaps = entries.filter((entry) => entry.gap);
  lines.push("");
  if (gaps.length > 0) {
    lines.push(`  FAIL: § ${sectionHeading} never cites ${plural(gaps.length, "pull request")} merged in this range:`);
    for (const gap of gaps) lines.push(`    #${gap.pr}  ${gap.hash.slice(0, 7)}  ${truncate(gap.subject, 60)}`);
  } else if (walk.length === 0) {
    lines.push("  Every commit in the range is exempt — nothing to walk.");
  } else {
    lines.push("  Every pull request in the range is cited. The checklist above still needs your eyes.");
  }
  return lines;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const tag = isRepoRoot(root) ? lastTag(root) : null;
  if (tag === null) {
    console.log("No release tag is reachable from HEAD — nothing to audit against. (Shallow clone? `git fetch --tags`.)");
    process.exit(0);
  }
  const section = extractChangelogSection(readFileSync(path.join(root, "CHANGELOG.md"), "utf8"));
  if (section === "") {
    console.error("CHANGELOG.md has no `## [version] - date` heading to audit against.");
    process.exit(1);
  }
  const heading = section.split("\n")[0].replace(/^## /, "").trim();
  const entries = auditRange(commitsSince(tag, root), section);

  // Between releases the newest section is already published, so an uncited
  // pull request is not a gap anyone can close — nobody edits a shipped
  // section. Show the same range as the next release's backlog and exit 0, so
  // the steady state of a documented command is not a standing failure.
  const enforce = !isTagged(version, root);
  if (!enforce) {
    console.log(`No release in progress (v${version} is tagged) — this is the next release's backlog:\n`);
  }
  console.log(report(`${tag}..HEAD`, entries, heading, { enforce }).join("\n"));
  process.exit(enforce && entries.some((entry) => entry.gap) ? 1 : 0);
}
