#!/usr/bin/env node
'use strict';

// Symlinks every skill in this repo into one or more coding agents' personal
// skills directories, per the Agent Skills open standard (agentskills.io):
// each agent just needs <its-skills-dir>/<skill-name>/SKILL.md to exist.
//
// This repo is the single source of truth. Agents see a skill's content via
// a symlink, so editing a skill here and `git pull`-ing updates every agent
// at once - nothing to copy or keep in sync by hand.
//
// Usage:
//   node scripts/link-skills.js                  # link the default agents from agents.json
//   node scripts/link-skills.js --agents=claude,codex
//   node scripts/link-skills.js --list-agents
//   node scripts/link-skills.js --dry-run

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');

function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function loadAgentRegistry() {
  const raw = fs.readFileSync(path.join(REPO_ROOT, 'agents.json'), 'utf8');
  return JSON.parse(raw);
}

function discoverSkills() {
  return fs
    .readdirSync(REPO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'scripts' && entry.name !== 'node_modules')
    .filter((entry) => fs.existsSync(path.join(REPO_ROOT, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

function parseArgs(argv) {
  const args = { agents: null, dryRun: false, listAgents: false };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--list-agents') args.listAgents = true;
    else if (arg.startsWith('--agents=')) args.agents = arg.slice('--agents='.length).split(',').map((s) => s.trim()).filter(Boolean);
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  return args;
}

// Copies anything under src that doesn't already exist at the same relative
// path under dest - used to rescue locally-generated files (e.g. a skill's
// runtime state/) before an existing real directory gets replaced by a symlink.
function mergeMissingInto(src, dest, { dryRun }) {
  const moved = [];
  function walk(relDir) {
    const srcDir = path.join(src, relDir);
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      const rel = path.join(relDir, entry.name);
      const srcPath = path.join(src, rel);
      const destPath = path.join(dest, rel);
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          if (!dryRun) fs.mkdirSync(destPath, { recursive: true });
        }
        walk(rel);
      } else if (!fs.existsSync(destPath)) {
        if (!dryRun) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(srcPath, destPath);
        }
        moved.push(rel);
      }
    }
  }
  walk('.');
  return moved;
}

function linkOneSkill(skillName, agentName, agentDir, { dryRun }) {
  const sourcePath = path.join(REPO_ROOT, skillName);
  const targetPath = path.join(agentDir, skillName);

  if (!fs.existsSync(agentDir)) {
    if (!dryRun) fs.mkdirSync(agentDir, { recursive: true });
  }

  let stat;
  try {
    stat = fs.lstatSync(targetPath);
  } catch {
    stat = null;
  }

  if (!stat) {
    if (!dryRun) fs.symlinkSync(sourcePath, targetPath, 'dir');
    return { status: 'linked' };
  }

  if (stat.isSymbolicLink()) {
    const existingTarget = fs.realpathSync(targetPath).replace(/\/$/, '');
    if (existingTarget === fs.realpathSync(sourcePath).replace(/\/$/, '')) {
      return { status: 'up-to-date' };
    }
    return { status: 'skipped-wrong-symlink', detail: existingTarget };
  }

  if (stat.isDirectory()) {
    const rescued = mergeMissingInto(targetPath, sourcePath, { dryRun });
    if (!dryRun) {
      fs.rmSync(targetPath, { recursive: true, force: true });
      fs.symlinkSync(sourcePath, targetPath, 'dir');
    }
    return { status: 'replaced-real-dir', detail: rescued };
  }

  return { status: 'skipped-unexpected-file' };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const registry = loadAgentRegistry();

  if (args.listAgents) {
    console.log('Known agents (edit agents.json to add more):');
    for (const [name, dir] of Object.entries(registry.agents)) {
      const marker = registry.defaultAgents.includes(name) ? '(default)' : '';
      console.log(`  ${name.padEnd(10)} ${dir} ${marker}`);
    }
    return;
  }

  const requestedAgents = args.agents || registry.defaultAgents;
  for (const name of requestedAgents) {
    if (!(name in registry.agents)) {
      console.error(`Unknown agent "${name}". Known agents: ${Object.keys(registry.agents).join(', ')}`);
      console.error('Add it to agents.json to support a new coding agent.');
      process.exit(1);
    }
  }

  const skills = discoverSkills();
  if (skills.length === 0) {
    console.error('No skills found (no top-level directory with a SKILL.md).');
    process.exit(1);
  }

  console.log(`${args.dryRun ? '[dry run] ' : ''}Linking ${skills.length} skill(s) into ${requestedAgents.length} agent(s): ${requestedAgents.join(', ')}\n`);

  for (const agentName of requestedAgents) {
    const agentDir = expandHome(registry.agents[agentName]);
    console.log(`${agentName} -> ${agentDir}`);
    for (const skillName of skills) {
      const result = linkOneSkill(skillName, agentName, agentDir, { dryRun: args.dryRun });
      let line = `  ${skillName.padEnd(20)} ${result.status}`;
      if (result.status === 'replaced-real-dir' && result.detail.length > 0) {
        line += ` (rescued into repo: ${result.detail.join(', ')})`;
      }
      if (result.status === 'skipped-wrong-symlink') {
        line += ` -> currently points to ${result.detail}, not touching it (pass --agents and fix manually if this is stale)`;
      }
      console.log(line);
    }
  }
}

main();
