#!/usr/bin/env bun
/**
 * Worktree Manager for Claude Code
 *
 * Usage: bun worktree-manager.ts <command> [worker] [options]
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { resolve } from "path";

const WORKERS = ["worker-1", "worker-2", "worker-3"] as const;
type Worker = (typeof WORKERS)[number];

// Normalize path separators for cross-platform comparison
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").toLowerCase();
}

async function getGitRoot(): Promise<string> {
  try {
    const result = await $`git rev-parse --show-toplevel`.text();
    return result.trim();
  } catch {
    return process.cwd();
  }
}

function getWorktreePath(mainRepo: string, worker: Worker): string {
  return resolve(mainRepo, "..", worker);
}

async function getCurrentBranch(): Promise<string | null> {
  try {
    const result = await $`git branch --show-current`.text();
    const branch = result.trim();
    // Empty string means detached HEAD
    return branch || null;
  } catch {
    return null;
  }
}

async function branchExists(branch: string): Promise<boolean> {
  try {
    await $`git rev-parse --verify ${branch}`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function worktreeExists(
  mainRepo: string,
  worker: Worker
): Promise<boolean> {
  const path = getWorktreePath(mainRepo, worker);
  if (!existsSync(path)) return false;

  const list = await $`git worktree list`.text();
  const normalizedPath = normalizePath(path);
  const normalizedList = normalizePath(list);
  return normalizedList.includes(normalizedPath);
}

/**
 * Check if a worktree has uncommitted changes (staged, unstaged, or untracked)
 */
async function hasUncommittedChanges(worktreePath: string): Promise<boolean> {
  const status = await $`git -C ${worktreePath} status --porcelain`.text();
  return status.trim().length > 0;
}

/**
 * Check if main repo has uncommitted changes
 */
async function mainRepoHasChanges(): Promise<boolean> {
  const status = await $`git status --porcelain`.text();
  return status.trim().length > 0;
}

/**
 * Check if a worker branch has commits not yet merged into target branch
 */
async function hasUnmergedCommits(
  worker: Worker,
  targetBranch: string
): Promise<boolean> {
  try {
    const commits =
      await $`git log ${targetBranch}..${worker} --oneline`.text();
    return commits.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Get a summary of uncommitted changes for display
 */
async function getChangesSummary(worktreePath: string): Promise<string> {
  const status = await $`git -C ${worktreePath} status --short`.text();
  return status.trim();
}

/**
 * Auto-commit all changes in a worktree
 * Returns { success: boolean, error?: string }
 */
async function autoCommitChanges(
  worktreePath: string,
  worker: Worker
): Promise<{ success: boolean; error?: string }> {
  try {
    await $`git -C ${worktreePath} add -A`;

    // Check if there's actually something to commit after staging
    const staged =
      await $`git -C ${worktreePath} diff --cached --quiet`.nothrow();
    if (staged.exitCode === 0) {
      return {
        success: false,
        error: "No changes to commit after staging (files may be gitignored)",
      };
    }

    const result =
      await $`git -C ${worktreePath} commit -m ${"Auto-commit from " + worker}`.nothrow();
    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr.toString() || "Commit failed (check git hooks?)",
      };
    }

    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || "Unknown error during commit",
    };
  }
}

async function createWorktree(
  mainRepo: string,
  worker: Worker
): Promise<boolean> {
  const path = getWorktreePath(mainRepo, worker);

  if (await worktreeExists(mainRepo, worker)) {
    console.log(`⏭️  Worktree ${worker} already exists at ${path}`);
    return true;
  }

  console.log(`📁 Creating worktree ${worker} at ${path}...`);

  // Check if branch already exists (from a previous removed worktree)
  const branchAlreadyExists = await branchExists(worker);

  try {
    if (branchAlreadyExists) {
      // Branch exists, create worktree using existing branch
      await $`git worktree add ${path} ${worker}`;
      console.log(`✅ Created ${worker} (using existing branch)`);
    } else {
      // Create new branch with worktree
      await $`git worktree add ${path} -b ${worker}`;
      console.log(`✅ Created ${worker}`);
    }
    return true;
  } catch (e: any) {
    console.log(`❌ Failed to create ${worker}: ${e.message}`);
    return false;
  }
}

async function openWorker(mainRepo: string, worker: Worker): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    const created = await createWorktree(mainRepo, worker);
    if (!created) {
      console.log(`❌ Cannot open ${worker} - worktree creation failed`);
      return;
    }
  }

  console.log(`🚀 Opening VS Code for ${worker}...`);

  try {
    const result = await $`code --new-window ${path}`.nothrow();
    if (result.exitCode !== 0) {
      console.log(`❌ Failed to open VS Code. Is 'code' command available?`);
      console.log(`   You can manually open: ${path}`);
      return;
    }
    console.log(`✅ Opened ${worker} in VS Code`);
  } catch (e: any) {
    console.log(`❌ Failed to open VS Code: ${e.message}`);
    console.log(`   You can manually open: ${path}`);
  }
}

async function mergeWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string
): Promise<boolean> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist. Skipping.`);
    return false;
  }

  // Safety check: make sure we're not on the worker branch
  const currentBranch = await getCurrentBranch();
  if (currentBranch === worker) {
    console.log(`❌ Cannot merge ${worker}: you are currently on this branch!`);
    console.log(
      `   Switch to your main branch first: git checkout ${mainBranch}`
    );
    return false;
  }

  // Safety check: warn if main repo has uncommitted changes
  if (await mainRepoHasChanges()) {
    console.log(`\n⚠️  Warning: Main repo has uncommitted changes.`);
    console.log(
      `   This might cause merge conflicts. Consider committing first.\n`
    );
  }

  console.log(`\n🔀 Processing ${worker}...`);

  // Step 1: Check for uncommitted changes
  const hasChanges = await hasUncommittedChanges(worktreePath);
  const hasCommits = await hasUnmergedCommits(worker, mainBranch);

  if (!hasChanges && !hasCommits) {
    console.log(`⏭️  No changes in ${worker}. Nothing to do.`);
    return true; // Success - nothing to lose
  }

  // Step 2: Auto-commit uncommitted changes
  if (hasChanges) {
    console.log(`📝 Found uncommitted changes in ${worker}:`);
    const summary = await getChangesSummary(worktreePath);
    console.log(
      summary
        .split("\n")
        .map((l) => `   ${l}`)
        .join("\n")
    );

    console.log(`\n   Auto-committing...`);
    const commitResult = await autoCommitChanges(worktreePath, worker);

    if (!commitResult.success) {
      console.log(`❌ Failed to auto-commit changes in ${worker}.`);
      console.log(`   Reason: ${commitResult.error}`);
      console.log(`   Please commit manually and try again.`);
      return false;
    }
    console.log(`   ✅ Changes committed`);
  }

  // Step 3: Merge the worker branch
  // Re-check for commits (including the one we just made)
  const commitsToMerge =
    await $`git log ${mainBranch}..${worker} --oneline`.text();

  if (commitsToMerge.trim()) {
    console.log(`\n📋 Commits to merge:`);
    console.log(
      commitsToMerge
        .split("\n")
        .map((l) => `   ${l}`)
        .join("\n")
    );

    try {
      const commitMsg = `Merge ${worker} into ${mainBranch}`;
      await $`git merge ${worker} -m ${commitMsg}`;
      console.log(`\n   ✅ Merged ${worker} into ${mainBranch}`);
    } catch (e) {
      console.log(`\n⚠️  Merge conflict detected!`);
      console.log(`   Your changes are SAFE in the ${worker} branch.`);
      console.log(`   Resolve conflicts manually, then run:`);
      console.log(`   bun worktree-manager.ts reset ${worker}`);
      return false;
    }
  }

  // Step 4: Reset the worker to main (only after successful merge)
  console.log(`\n🔄 Resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`;
  console.log(`   ✅ ${worker} is ready for new tasks`);

  return true;
}

async function resetWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string
): Promise<void> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist.`);
    return;
  }

  // SAFETY: Check for uncommitted changes
  const hasChanges = await hasUncommittedChanges(worktreePath);
  if (hasChanges) {
    console.log(
      `\n⚠️  WARNING: ${worker} has uncommitted changes that will be LOST:`
    );
    const summary = await getChangesSummary(worktreePath);
    console.log(
      summary
        .split("\n")
        .map((l) => `   ${l}`)
        .join("\n")
    );
    console.log(
      `\n   Use 'merge' instead to save changes, or add --force to discard.`
    );
    console.log(`   Example: bun worktree-manager.ts reset ${worker} --force`);
    return;
  }

  // SAFETY: Check for unmerged commits
  const hasCommits = await hasUnmergedCommits(worker, mainBranch);
  if (hasCommits) {
    const commits = await $`git log ${mainBranch}..${worker} --oneline`.text();
    console.log(
      `\n⚠️  WARNING: ${worker} has commits not merged into ${mainBranch}:`
    );
    console.log(
      commits
        .split("\n")
        .map((l) => `   ${l}`)
        .join("\n")
    );
    console.log(
      `\n   Use 'merge' instead to save changes, or add --force to discard.`
    );
    console.log(`   Example: bun worktree-manager.ts reset ${worker} --force`);
    return;
  }

  console.log(`🔄 Resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`;
  console.log(`✅ Reset ${worker}`);
}

async function forceResetWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string
): Promise<void> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist.`);
    return;
  }

  console.log(`⚠️  Force resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`;
  console.log(`✅ Reset ${worker} (changes discarded)`);
}

async function statusWorkers(
  mainRepo: string,
  mainBranch: string | null
): Promise<void> {
  if (mainBranch) {
    console.log(`📍 Main repo branch: ${mainBranch}\n`);
  } else {
    console.log(`📍 Main repo: DETACHED HEAD (not on a branch)\n`);
  }

  console.log("📊 Worker status:\n");

  for (const worker of WORKERS) {
    const exists = await worktreeExists(mainRepo, worker);
    const path = getWorktreePath(mainRepo, worker);

    if (!exists) {
      const branchOnly = await branchExists(worker);
      if (branchOnly) {
        console.log(`   ${worker}: ⚠️  Branch exists but no worktree`);
        console.log(`            Run 'setup' to recreate worktree`);
      } else {
        console.log(`   ${worker}: ❌ Not created`);
      }
      continue;
    }

    // Check for uncommitted changes
    const hasChanges = await hasUncommittedChanges(path);

    // Check for unmerged commits
    let commitCount = 0;
    if (mainBranch) {
      try {
        const commits =
          await $`git log ${mainBranch}..${worker} --oneline`.text();
        commitCount = commits.trim() ? commits.trim().split("\n").length : 0;
      } catch {}
    }

    console.log(`   ${worker}: ✅ Active`);
    console.log(`            📁 ${path}`);
    if (mainBranch) {
      console.log(
        `            📝 ${commitCount} commit(s) ahead of ${mainBranch}`
      );
    } else {
      console.log(`            📝 Cannot compare (main is in detached HEAD)`);
    }
    if (hasChanges) {
      console.log(`            ⚠️  Has uncommitted changes!`);
    }
  }
}

async function removeWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string | null,
  force: boolean
): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);
  const worktreeIsPresent = await worktreeExists(mainRepo, worker);
  const branchIsPresent = await branchExists(worker);

  if (!worktreeIsPresent && !branchIsPresent) {
    console.log(`❌ Worker ${worker} does not exist (no worktree or branch).`);
    return;
  }

  // SAFETY: Check for uncommitted changes (only if worktree exists)
  if (worktreeIsPresent) {
    const hasChanges = await hasUncommittedChanges(path);

    // SAFETY: Check for unmerged commits
    let hasCommits = false;
    if (mainBranch) {
      hasCommits = await hasUnmergedCommits(worker, mainBranch);
    }

    if ((hasChanges || hasCommits) && !force) {
      console.log(`\n⚠️  WARNING: ${worker} has unsaved work:`);

      if (hasChanges) {
        console.log(`\n   Uncommitted changes:`);
        const summary = await getChangesSummary(path);
        console.log(
          summary
            .split("\n")
            .map((l) => `      ${l}`)
            .join("\n")
        );
      }

      if (hasCommits && mainBranch) {
        const commits =
          await $`git log ${mainBranch}..${worker} --oneline`.text();
        console.log(`\n   Unmerged commits:`);
        console.log(
          commits
            .split("\n")
            .map((l) => `      ${l}`)
            .join("\n")
        );
      }

      console.log(
        `\n   Use 'merge' first to save changes, or add --force to discard.`
      );
      console.log(
        `   Example: bun worktree-manager.ts remove ${worker} --force`
      );
      return;
    }
  }

  // Remove worktree if it exists
  if (worktreeIsPresent) {
    console.log(`🗑️  Removing worktree ${worker}...`);
    try {
      await $`git worktree remove ${path} --force`;
      console.log(`   ✅ Worktree removed`);
    } catch (e: any) {
      console.log(`   ❌ Failed to remove worktree: ${e.message}`);
      return;
    }
  }

  // Remove branch if it exists
  if (branchIsPresent) {
    try {
      await $`git branch -D ${worker}`;
      console.log(`   ✅ Branch removed`);
    } catch {
      console.log(
        `   ⚠️  Could not remove branch (may be checked out elsewhere)`
      );
    }
  }

  console.log(`✅ Removed ${worker}`);
}

function parseWorkerArg(arg: string | undefined): Worker[] {
  if (!arg || arg === "all") return [...WORKERS];

  const worker = arg as Worker;
  if (!WORKERS.includes(worker)) {
    console.error(`❌ Invalid worker: ${arg}`);
    console.error(`   Valid workers: ${WORKERS.join(", ")}`);
    process.exit(1);
  }
  return [worker];
}

function printHelp(): void {
  console.log(`
🛠️  Worktree Manager for Claude Code

Usage: bun worktree-manager.ts <command> [worker] [options]

Commands:
  setup             Create all worker worktrees
  open [worker]     Open VS Code window(s) for worker(s)
  merge [worker]    Merge worker(s) into current branch and reset them
  reset [worker]    Reset worker(s) to current branch (no merge)
  status            Show status of all workers
  remove [worker]   Remove worker worktree(s) and branch(es)

Worker argument:
  all               All workers (default)
  worker-1          Specific worker
  worker-2          Specific worker
  worker-3          Specific worker

Options:
  --force           Skip safety checks (for reset/remove only)

Safety features:
  • 'merge' auto-commits uncommitted changes before merging
  • 'reset' and 'remove' warn if there are unsaved changes
  • Use --force to override safety checks (data will be lost!)

Examples:
  bun worktree-manager.ts setup              # Create all worktrees
  bun worktree-manager.ts open               # Open all workers in VS Code
  bun worktree-manager.ts open worker-1      # Open just worker-1
  bun worktree-manager.ts merge              # Merge all workers
  bun worktree-manager.ts merge worker-2     # Merge just worker-2
  bun worktree-manager.ts status             # Check worker status
  bun worktree-manager.ts reset worker-1 --force  # Force reset (discard changes)
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const workerArg = args.find((a) => a.startsWith("worker-") || a === "all");
  const forceFlag = args.includes("--force");

  if (!command || command === "help" || command === "--help") {
    printHelp();
    process.exit(0);
  }

  // Verify we're in a git repo
  try {
    await $`git rev-parse --git-dir`.quiet();
  } catch {
    console.error("❌ Not in a git repository!");
    process.exit(1);
  }

  const mainRepo = await getGitRoot();
  const mainBranch = await getCurrentBranch();

  // Safety: Block destructive operations in detached HEAD
  if (mainBranch === null && ["merge", "reset"].includes(command)) {
    console.error(
      "❌ Cannot run this command: You are in detached HEAD state."
    );
    console.error("   Please checkout a branch first: git checkout main");
    process.exit(1);
  }

  // Safety: warn if on a worker branch
  if (
    mainBranch &&
    WORKERS.includes(mainBranch as Worker) &&
    command !== "status"
  ) {
    console.log(`⚠️  Warning: You are currently on branch '${mainBranch}'`);
    console.log(
      `   Consider switching to 'main' before running this command.\n`
    );
  }

  switch (command) {
    case "setup": {
      console.log("🏗️  Setting up worker worktrees...\n");
      let allSuccess = true;
      for (const worker of WORKERS) {
        const success = await createWorktree(mainRepo, worker);
        if (!success) allSuccess = false;
      }
      if (allSuccess) {
        console.log("\n✅ All worktrees ready!");
      } else {
        console.log(
          "\n⚠️  Some worktrees failed to create. Check output above."
        );
      }
      break;
    }

    case "open": {
      const workers = parseWorkerArg(workerArg);
      console.log(`🚀 Opening ${workers.length} worker(s)...\n`);
      for (const worker of workers) {
        await openWorker(mainRepo, worker);
      }
      break;
    }

    case "merge": {
      if (!mainBranch) {
        // Already blocked above, but TypeScript doesn't know
        process.exit(1);
      }
      const workers = parseWorkerArg(workerArg);
      console.log(
        `🔀 Merging ${workers.length} worker(s) into ${mainBranch}...`
      );

      let allSucceeded = true;
      for (const worker of workers) {
        const success = await mergeWorker(mainRepo, worker, mainBranch);
        if (!success) allSucceeded = false;
      }

      if (allSucceeded) {
        console.log(
          "\n✅ All done! Workers are reset and ready for new tasks."
        );
      } else {
        console.log(
          "\n⚠️  Some operations had issues. Check the output above."
        );
      }
      break;
    }

    case "reset": {
      if (!mainBranch) {
        // Already blocked above, but TypeScript doesn't know
        process.exit(1);
      }
      const workers = parseWorkerArg(workerArg);
      console.log(
        `🔄 Resetting ${workers.length} worker(s) to ${mainBranch}...`
      );
      for (const worker of workers) {
        if (forceFlag) {
          await forceResetWorker(mainRepo, worker, mainBranch);
        } else {
          await resetWorker(mainRepo, worker, mainBranch);
        }
      }
      break;
    }

    case "status": {
      await statusWorkers(mainRepo, mainBranch);
      break;
    }

    case "remove": {
      const workers = parseWorkerArg(workerArg);
      console.log(`🗑️  Removing ${workers.length} worker(s)...`);
      for (const worker of workers) {
        await removeWorker(mainRepo, worker, mainBranch, forceFlag);
      }
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
