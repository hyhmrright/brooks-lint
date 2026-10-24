import { readFile } from 'node:fs/promises';

// The shell installer owns the platform inventory and destination templates.
// Parse its restricted printf cases as data; never execute shell source.
export async function readPlatforms(installer) {
  const source = await readFile(installer, 'utf8');
  const names = source.match(/^PLATFORMS="([a-z ]+)"$/m)?.[1].split(' ');
  if (!names?.length) throw new Error('Cannot read installer platform inventory');
  const mappings = {};
  for (const scope of ['global', 'project']) {
    const body = source.match(new RegExp(`${scope}_dir\\(\\) \\{([\\s\\S]*?)\\n\\}`))?.[1];
    mappings[scope] = {};
    for (const match of (body ?? '').matchAll(/^\s*([a-z]+)\)\s+printf '%s' "([^"]+)" ;;/gm)) {
      const [, name, template] = match;
      if (!/^(?:\$(?:HOME|PWD)|\$\{DSH_HOME:-\$HOME\/\.dsh\})\/[a-zA-Z0-9_./-]+$/.test(template)) {
        throw new Error(`Unsupported installer destination template: ${name}`);
      }
      mappings[scope][name] = template;
    }
    if (names.some(name => !mappings[scope][name])) throw new Error(`Incomplete ${scope} platform mappings`);
  }
  return { names, mappings };
}

export function destination(template, { home, cwd, dshHome }) {
  return template.replace('${DSH_HOME:-$HOME/.dsh}', dshHome || `${home}/.dsh`)
    .replace(/^\$HOME/, home).replace(/^\$PWD/, cwd);
}
