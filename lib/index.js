/**
 * DSH bundle plugin: publishes the brooks-lint Agent Skills to the harness skill
 * registry, so installing this package is enough to get `/brooks-review` and the
 * other five modes — no manual copy into ~/.dsh/skills.
 *
 * Same shape as @deepseek-ai/dsh-skill-office: a bundled provider at
 * BUNDLED_SKILL_RANK (600) whose resource base is the skill directory itself, so
 * `../_shared/*.md` resolves exactly as it does on every other platform.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Provider id reported to the skill catalog. */
const PROVIDER = "brooks-lint";
/** Rank of a package-provided skill root (BUNDLED_SKILL_RANK). */
const RANK = 600;

/** Cordis plugin identity. */
const name = "brooks-lint-skills";
/** The skill registry this plugin contributes to. */
const inject = ["skills"];

/** Strip one layer of matching quotes from a YAML scalar. */
function unquote(text) {
	const quote = text[0];
	if ((quote === "\"" || quote === "'") && text.endsWith(quote) && text.length > 1) return text.slice(1, -1);
	return text;
}

/**
 * Read the `description` field out of a frontmatter block. Covers what these
 * skills use — plain scalars and `>` / `|` blocks — without a YAML dependency.
 * @param yaml - frontmatter text, without the `---` fences.
 * @param path - file the block came from, for diagnostics.
 * @returns the description as one line.
 */
function readDescription(yaml, path) {
	const lines = yaml.split(/\r?\n/u);
	const start = lines.findIndex((line) => /^description:\s*(.*)$/u.test(line));
	if (start < 0) throw new Error(`${PROVIDER}: ${path} has no description`);
	const inline = /^description:\s*(.*)$/u.exec(lines[start])[1].trim();
	if (inline !== "" && !inline.startsWith(">") && !inline.startsWith("|")) return unquote(inline);
	const folded = inline.startsWith(">");
	const block = [];
	for (const line of lines.slice(start + 1)) {
		if (line.trim() !== "" && !/^\s/u.test(line)) break;
		block.push(line.trim());
	}
	const text = folded ? block.join(" ") : block.join("\n");
	const description = text.replace(/\s+/gu, " ").trim();
	if (description === "") throw new Error(`${PROVIDER}: ${path} has an empty description`);
	return description;
}

/**
 * Split a SKILL.md into frontmatter-derived metadata and body.
 * @param raw - file contents.
 * @param path - file the contents came from, for diagnostics.
 * @returns the description and the body without frontmatter.
 */
function parseSkill(raw, path) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(raw);
	if (match === null) throw new Error(`${PROVIDER}: ${path} has no YAML frontmatter`);
	return {
		description: readDescription(match[1], path),
		content: raw.slice(match[0].length).trim()
	};
}

/**
 * Catalog every `<assetRoot>/<name>/SKILL.md`; the shared folder has no
 * SKILL.md and is intentionally not a skill.
 * @param assetRoot - absolute directory holding the skill bundles.
 * @returns catalog candidates, sorted by name.
 */
async function scan(assetRoot) {
	const entries = await readdir(assetRoot, { withFileTypes: true });
	const found = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const directory = join(assetRoot, entry.name);
		const locator = join(directory, "SKILL.md");
		let raw;
		try {
			raw = await readFile(locator, "utf8");
		} catch (error) {
			if (error.code === "ENOENT") continue;
			throw new Error(`${PROVIDER}: failed to read ${locator}`, { cause: error });
		}
		const { description } = parseSkill(raw, locator);
		found.push({
			name: entry.name,
			description,
			invocation: {
				modelInvocable: true,
				userInvocable: true
			},
			provider: PROVIDER,
			source: "bundled",
			rank: RANK,
			resourceBase: {
				kind: "directory",
				path: directory.split(sep).join("/")
			},
			locator
		});
	}
	return found.sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Register the provider with the skill registry.
 * @param ctx - context carrying `skills`.
 * @param config - optional absolute `assetRoot` for packaged applications.
 */
function apply(ctx, config = {}) {
	const assetRoot = config.assetRoot ?? fileURLToPath(new URL("../skills/", import.meta.url));
	const provider = {
		name: PROVIDER,
		list: () => scan(assetRoot),
		async get(candidate) {
			const { rank: _rank, locator, ...summary } = candidate;
			const { content } = parseSkill(await readFile(locator, "utf8"), locator);
			return {
				...summary,
				content
			};
		}
	};
	ctx.skills.registerProvider(() => provider);
}

export { apply, inject, name };
