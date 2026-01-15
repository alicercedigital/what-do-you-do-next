#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const status = process.argv[2];
if (!status) process.exit(0);

try {
  const cwd = process.cwd();

  // Find the main repo's .claude directory
  // Use git-common-dir to find main repo even from worktrees
  let mainRepoRoot;
  try {
    const gitCommonDir = execSync('git rev-parse --git-common-dir', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    // gitCommonDir points to .git in main repo (or .git/worktrees/xxx for worktrees)
    if (gitCommonDir.includes('worktrees')) {
      // It's a worktree, find main repo
      mainRepoRoot = path.resolve(gitCommonDir, '..', '..');
    } else if (gitCommonDir === '.git') {
      // Relative path, use cwd
      mainRepoRoot = cwd;
    } else {
      // Absolute path to .git
      mainRepoRoot = path.dirname(gitCommonDir);
    }
  } catch {
    process.exit(0); // Not in a git repo
  }

  const storagePath = path.join(mainRepoRoot, '.claude', 'worktrees.json');

  if (!fs.existsSync(storagePath)) process.exit(0);

  const storage = JSON.parse(fs.readFileSync(storagePath, 'utf8'));

  // Find entry by path (normalize paths for comparison)
  const normalizedCwd = path.normalize(cwd);
  for (const [branch, data] of Object.entries(storage.worktrees || {})) {
    if (path.normalize(data.path) === normalizedCwd) {
      data.claudeSession = {
        ...(data.claudeSession || {}),
        id: data.claudeSession?.id || 'default',
        lastActive: new Date().toISOString(),
        status: status
      };
      break;
    }
  }

  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
} catch (e) {
  // Silently fail - don't disrupt Claude
}
