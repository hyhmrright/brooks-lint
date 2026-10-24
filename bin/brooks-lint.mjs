#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { destination, readPlatforms } from '../scripts/npm-platforms.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'skills');
const help = `Usage: brooks-lint install <platform> [--project] [--dir PATH]
       brooks-lint install --dir PATH
       brooks-lint list | --list
       brooks-lint --version

Install the bundled skills into your coding agent's skills folder.
--project  Use the current project's skills folder
--dir PATH Use an explicit destination folder
--help     Show this help
`;

async function resolvedLocation(location) {
  try { return await realpath(location); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const parent = path.dirname(location);
    if (parent === location) throw error;
    return path.join(await resolvedLocation(parent), path.basename(location));
  }
}
function contains(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 2 && args[0] === 'install' && ['--list', '--help', '-h'].includes(args[1])) args.shift();
  if (!args.length || (args.length === 1 && ['--help', '-h'].includes(args[0]))) {
    process.stdout.write(help); return;
  }
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    console.log(JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version); return;
  }
  const { names, mappings } = await readPlatforms(path.join(root, 'scripts/install.sh'));
  if (args.length === 1 && ['list', '--list'].includes(args[0])) {
    console.log(`Supported platforms: ${names.join(' ')}`); return;
  }
  if (args.shift() !== 'install') throw new Error('Expected install, list, --help or --version');
  let platform, explicit, project = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project' && !project) project = true;
    else if (arg === '--dir' && explicit === undefined) {
      explicit = args[++i];
      if (!explicit || explicit.startsWith('-')) throw new Error('--dir requires a path');
    } else if (!arg.startsWith('-') && !platform) platform = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (platform && !names.includes(platform)) throw new Error(`Unknown platform: ${platform}`);
  if (!platform && !explicit) throw new Error('Provide a platform or --dir PATH');
  const target = path.resolve(explicit ?? destination(mappings[project ? 'project' : 'global'][platform], {
    home: process.env.HOME || process.env.USERPROFILE || homedir(), cwd: process.cwd(), dshHome: process.env.DSH_HOME,
  }));
  const resolvedSource = await realpath(source);
  const resolvedTarget = await resolvedLocation(target);
  // Also reject ancestors: copying into the package root could replace its source.
  if (contains(resolvedSource, resolvedTarget) || contains(resolvedTarget, resolvedSource)) {
    throw new Error('Destination must not overlap the bundled skills directory');
  }
  const entries = await readdir(source, { withFileTypes: true });
  // Check existing per-skill symlinks before making any writes.
  for (const entry of entries) {
    const resolved = await resolvedLocation(path.join(target, entry.name));
    if (contains(resolvedSource, resolved) || contains(resolved, resolvedSource)) {
      throw new Error('Destination entry overlaps the bundled skills directory');
    }
  }
  await mkdir(target, { recursive: true });
  for (const entry of entries) {
    await cp(path.join(source, entry.name), path.join(target, entry.name), { recursive: true, force: true });
  }
  console.log(`Installed brooks-lint skills (+ _shared/) into ${target}`);
}
main().catch(error => { console.error(`error: ${error.message}`); process.exitCode = 1; });
