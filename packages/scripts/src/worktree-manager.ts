#!/usr/bin/env bun
/**
 * Worktree Manager for Claude Code
 *
 * Usage: bun worktree-manager.ts <command> [worker] [options]
 */

import { $ } from "bun";
import { resolve } from "path";

const WORKERS = ["worker-1", "worker-2", "worker-3"] as const;
type Worker = (typeof WORKERS)[number];

type Command =
  | "setup"
  | "open"
  | "merge"
  | "reset"
  | "status"
  | "remove"
  | "help";
const VALID_COMMANDS: Command[] = [
  "setup",
  "open",
  "merge",
  "reset",
  "status",
  "remove",
  "help",
];

// Commands that support --force flag
const FORCE_SUPPORTED_COMMANDS: Command[] = ["reset", "remove"];

// Commands that support --dry-run flag
const DRY_RUN_SUPPORTED_COMMANDS: Command[] = ["merge", "reset", "remove"];

// Normalize path separators for cross-platform comparison
function normalizePath(p: string): string {
  const normalized = p.replace(/\\/g, "/");
  // Only lowercase on Windows where filesystem is case-insensitive
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

async function getGitRoot(): Promise<string> {
  const result = await $`git rev-parse --show-toplevel`.nothrow();
  if (result.exitCode !== 0) {
    throw new Error(
      "Failed to determine git root: " + result.stderr.toString()
    );
  }
  return result.stdout.toString().trim();
}

/**
 * Check if we're in the main worktree (not a linked worktree)
 */
async function isMainWorktree(): Promise<boolean> {
  try {
    const gitDir = (await $`git rev-parse --git-dir`.text()).trim();
    // Linked worktrees have git dir containing .git/worktrees/ or .git\worktrees\
    // This pattern specifically matches the git internal structure, not arbitrary paths
    return !/\.git[\/\\]worktrees[\/\\]/.test(gitDir);
  } catch {
    return false;
  }
}

function getWorktreePath(mainRepo: string, worker: Worker): string {
  return resolve(mainRepo, "..", worker);
}

async function getCurrentBranch(): Promise<string | null> {
  try {
    const result = await $`git branch --show-current`.text();
    const branch = result.trim();
    return branch || null;
  } catch {
    return null;
  }
}

async function branchExists(branch: string): Promise<boolean> {
  try {
    await $`git rev-parse --verify refs/heads/${branch}`.quiet();
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
  try {
    const list = await $`git worktree list --porcelain`.text();
    const normalizedPath = normalizePath(path);
    // Parse porcelain output for exact path matching
    const worktreePaths = list
      .split("\n")
      .filter((line) => line.startsWith("worktree "))
      .map((line) => normalizePath(line.substring(9)));
    return worktreePaths.includes(normalizedPath);
  } catch {
    return false;
  }
}

/**
 * Check if a worktree has uncommitted changes (staged, unstaged, or untracked)
 */
async function hasUncommittedChanges(worktreePath: string): Promise<boolean> {
  try {
    const status = await $`git -C ${worktreePath} status --porcelain`.text();
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if main repo has uncommitted changes
 */
async function mainRepoHasChanges(): Promise<boolean> {
  try {
    const status = await $`git status --porcelain`.text();
    return status.trim().length > 0;
  } catch {
    return false;
  }
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
 * Get count of commits a branch is ahead of another
 */
async function getCommitCountAhead(
  branch: string,
  targetBranch: string
): Promise<number> {
  try {
    const commits =
      await $`git log ${targetBranch}..${branch} --oneline`.text();
    return commits.trim() ? commits.trim().split("\n").length : 0;
  } catch {
    return 0;
  }
}

/**
 * Get a summary of uncommitted changes for display
 */
async function getChangesSummary(worktreePath: string): Promise<string> {
  try {
    const status = await $`git -C ${worktreePath} status --short`.text();
    return status.trim();
  } catch {
    return "(Unable to retrieve status)";
  }
}

/**
 * Auto-commit all changes in a worktree
 */
async function autoCommitChanges(
  worktreePath: string,
  worker: Worker,
  dryRun: boolean
): Promise<{ success: boolean; error?: string }> {
  if (dryRun) {
    console.log(`   [DRY-RUN] Would auto-commit changes in ${worker}`);
    return { success: true };
  }

  try {
    await $`git -C ${worktreePath} add -A`;

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
  worker: Worker,
  mainBranch: string | null
): Promise<boolean> {
  const path = getWorktreePath(mainRepo, worker);

  if (await worktreeExists(mainRepo, worker)) {
    console.log(`⏭️  Worktree ${worker} already exists at ${path}`);
    return true;
  }

  console.log(`📁 Creating worktree ${worker} at ${path}...`);

  const branchAlreadyExists = await branchExists(worker);

  try {
    if (branchAlreadyExists) {
      // Warn about potential divergence if we can compare
      if (mainBranch) {
        const aheadCount = await getCommitCountAhead(worker, mainBranch);
        if (aheadCount > 0) {
          console.log(
            `   ⚠️  Existing branch '${worker}' is ${aheadCount} commit(s) ahead of ${mainBranch}`
          );
          console.log(`      Consider merging or resetting after creation.`);
        }
      }
      await $`git worktree add ${path} ${worker}`;
      console.log(`✅ Created ${worker} (using existing branch)`);
    } else {
      await $`git worktree add ${path} -b ${worker}`;
      console.log(`✅ Created ${worker}`);
    }
    return true;
  } catch (e: any) {
    console.log(`❌ Failed to create ${worker}: ${e.message}`);
    return false;
  }
}

async function openWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string | null
): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`📝 Worktree ${worker} doesn't exist, creating it first...`);
    const created = await createWorktree(mainRepo, worker, mainBranch);
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

interface MergeResult {
  success: boolean;
  merged: boolean;
  reset: boolean;
  error?: string;
}

async function mergeWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string,
  dryRun: boolean
): Promise<MergeResult> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist. Skipping.`);
    return {
      success: false,
      merged: false,
      reset: false,
      error: "Worktree does not exist",
    };
  }

  // Verify we're still on the expected branch before merging
  const currentBranch = await getCurrentBranch();
  if (currentBranch !== mainBranch) {
    console.log(`❌ Cannot merge ${worker}: branch changed during operation!`);
    console.log(
      `   Expected: ${mainBranch}, Current: ${currentBranch || "detached HEAD"}`
    );
    console.log(`   Please checkout ${mainBranch} and try again.`);
    return {
      success: false,
      merged: false,
      reset: false,
      error: "Branch changed unexpectedly",
    };
  }

  if (currentBranch === worker) {
    console.log(`❌ Cannot merge ${worker}: you are currently on this branch!`);
    console.log(
      `   Switch to your main development branch first (e.g., git checkout main)`
    );
    return {
      success: false,
      merged: false,
      reset: false,
      error: "Cannot merge branch into itself",
    };
  }

  if (await mainRepoHasChanges()) {
    console.log(`\n⚠️  Warning: Main repo has uncommitted changes.`);
    console.log(
      `   This might cause merge conflicts. Consider committing first.\n`
    );
  }

  console.log(`\n🔀 Processing ${worker}...`);

  const hasChanges = await hasUncommittedChanges(worktreePath);
  const hasCommits = await hasUnmergedCommits(worker, mainBranch);

  if (!hasChanges && !hasCommits) {
    console.log(`⏭️  No changes in ${worker}. Nothing to do.`);
    return { success: true, merged: false, reset: false };
  }

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
    const commitResult = await autoCommitChanges(worktreePath, worker, dryRun);

    if (!commitResult.success) {
      console.log(`❌ Failed to auto-commit changes in ${worker}.`);
      console.log(`   Reason: ${commitResult.error}`);
      console.log(`   Please commit manually and try again.`);
      return {
        success: false,
        merged: false,
        reset: false,
        error: commitResult.error,
      };
    }
    console.log(`   ✅ Changes committed`);
  }

  const commitsToMerge =
    await $`git log ${mainBranch}..${worker} --oneline`.text();
  let merged = false;

  if (commitsToMerge.trim()) {
    console.log(`\n📋 Commits to merge:`);
    console.log(
      commitsToMerge
        .split("\n")
        .map((l) => `   ${l}`)
        .join("\n")
    );

    if (dryRun) {
      console.log(`\n   [DRY-RUN] Would merge ${worker} into ${mainBranch}`);
      merged = true;
    } else {
      try {
        const commitMsg = `Merge ${worker} into ${mainBranch}`;
        await $`git merge ${worker} -m ${commitMsg}`;
        console.log(`\n   ✅ Merged ${worker} into ${mainBranch}`);
        merged = true;
      } catch {
        console.log(`\n⚠️  Merge conflict detected!`);
        console.log(`   Your changes are SAFE in the ${worker} branch.`);
        console.log(`\n   To resolve:`);
        console.log(`   1. Fix the conflicts in the marked files`);
        console.log(`   2. Run: git add . && git commit`);
        console.log(
          `   3. Then reset the worker: bun worktree-manager.ts reset ${worker}`
        );
        return {
          success: false,
          merged: false,
          reset: false,
          error: "Merge conflict",
        };
      }
    }
  }

  console.log(`\n🔄 Resetting ${worker} to ${mainBranch}...`);

  if (dryRun) {
    console.log(`   [DRY-RUN] Would reset ${worker} to ${mainBranch}`);
    return { success: true, merged, reset: true };
  }

  try {
    await $`git -C ${worktreePath} reset --hard ${mainBranch}`;
    console.log(`   ✅ ${worker} is ready for new tasks`);
    return { success: true, merged, reset: true };
  } catch (e: any) {
    console.log(`   ❌ Failed to reset ${worker}: ${e.message}`);
    console.log(`\n⚠️  IMPORTANT: Merge succeeded but reset failed!`);
    console.log(`   The ${worker} branch still has the old commits.`);
    console.log(
      `   To fix manually, run: git -C ${worktreePath} reset --hard ${mainBranch}`
    );
    return {
      success: false,
      merged,
      reset: false,
      error: `Reset failed: ${e.message}`,
    };
  }
}

async function resetWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string,
  dryRun: boolean
): Promise<void> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist.`);
    return;
  }

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

  if (dryRun) {
    console.log(`[DRY-RUN] Would reset ${worker} to ${mainBranch}`);
    return;
  }

  console.log(`🔄 Resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`;
  console.log(`✅ Reset ${worker}`);
}

async function forceResetWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string,
  dryRun: boolean
): Promise<void> {
  const worktreePath = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist.`);
    return;
  }

  if (dryRun) {
    console.log(
      `[DRY-RUN] Would force reset ${worker} to ${mainBranch} (discarding all changes)`
    );
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
    try {
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

      const hasChanges = await hasUncommittedChanges(path);

      let commitCount = 0;
      if (mainBranch) {
        commitCount = await getCommitCountAhead(worker, mainBranch);
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
    } catch (e: any) {
      console.log(`   ${worker}: ❓ Error checking status: ${e.message}`);
    }
  }
}

interface RemoveResult {
  success: boolean;
  worktreeRemoved: boolean;
  branchRemoved: boolean;
  error?: string;
}

async function removeWorker(
  mainRepo: string,
  worker: Worker,
  mainBranch: string | null,
  force: boolean,
  dryRun: boolean
): Promise<RemoveResult> {
  const path = getWorktreePath(mainRepo, worker);
  const worktreeIsPresent = await worktreeExists(mainRepo, worker);
  const branchIsPresent = await branchExists(worker);

  if (!worktreeIsPresent && !branchIsPresent) {
    console.log(`❌ Worker ${worker} does not exist (no worktree or branch).`);
    return {
      success: false,
      worktreeRemoved: false,
      branchRemoved: false,
      error: "Does not exist",
    };
  }

  if (worktreeIsPresent) {
    const hasChanges = await hasUncommittedChanges(path);

    // Check for unmerged commits - warn if we can't compare
    let hasCommits = false;
    let canCompareCommits = false;
    if (mainBranch) {
      canCompareCommits = true;
      hasCommits = await hasUnmergedCommits(worker, mainBranch);
    }

    if ((hasChanges || hasCommits || !canCompareCommits) && !force) {
      console.log(`\n⚠️  WARNING: ${worker} may have unsaved work:`);

      if (!canCompareCommits) {
        console.log(
          `\n   ⚠️  Cannot check for unmerged commits (detached HEAD state)`
        );
        console.log(`      Commits in ${worker} branch may be lost!`);
      }

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
      return {
        success: false,
        worktreeRemoved: false,
        branchRemoved: false,
        error: "Has unsaved work",
      };
    }
  }

  let worktreeRemoved = false;
  let branchRemoved = false;

  if (worktreeIsPresent) {
    if (dryRun) {
      console.log(`[DRY-RUN] Would remove worktree ${worker} at ${path}`);
      worktreeRemoved = true;
    } else {
      console.log(`🗑️  Removing worktree ${worker}...`);
      try {
        await $`git worktree remove ${path} --force`;
        console.log(`   ✅ Worktree removed`);
        worktreeRemoved = true;
      } catch (e: any) {
        console.log(`   ❌ Failed to remove worktree: ${e.message}`);
        return {
          success: false,
          worktreeRemoved: false,
          branchRemoved: false,
          error: `Failed to remove worktree: ${e.message}`,
        };
      }
    }
  }

  if (branchIsPresent) {
    if (dryRun) {
      console.log(`[DRY-RUN] Would remove branch ${worker}`);
      branchRemoved = true;
    } else {
      try {
        await $`git branch -D ${worker}`;
        console.log(`   ✅ Branch removed`);
        branchRemoved = true;
      } catch (e: any) {
        console.log(`   ⚠️  Could not remove branch: ${e.message}`);
        console.log(
          `      The worktree was removed but the branch '${worker}' still exists.`
        );
        console.log(
          `      You may need to remove it manually: git branch -D ${worker}`
        );
        return {
          success: false,
          worktreeRemoved,
          branchRemoved: false,
          error: `Branch removal failed: ${e.message}`,
        };
      }
    }
  }

  console.log(`✅ Removed ${worker}`);
  return { success: true, worktreeRemoved, branchRemoved };
}

function parseWorkerArg(arg: string | undefined): Worker[] {
  if (!arg || arg === "all") return [...WORKERS];

  const worker = arg as Worker;
  if (!WORKERS.includes(worker)) {
    console.error(`❌ Invalid worker: ${arg}`);
    console.error(`   Valid options: all, ${WORKERS.join(", ")}`);
    process.exit(1);
  }
  return [worker];
}

function parseCommand(arg: string | undefined): Command | null {
  if (!arg) return null;
  if (arg === "--help") return "help";
  if (VALID_COMMANDS.includes(arg as Command)) {
    return arg as Command;
  }
  return null;
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
  --dry-run         Show what would be done without making changes
                    (for merge/reset/remove only)

Safety features:
  • 'merge' auto-commits uncommitted changes before merging
  • 'reset' and 'remove' warn if there are unsaved changes
  • Use --force to override safety checks (data will be lost!)
  • Use --dry-run to preview operations before executing

Examples:
  bun worktree-manager.ts setup              # Create all worktrees
  bun worktree-manager.ts open               # Open all workers in VS Code
  bun worktree-manager.ts open worker-1      # Open just worker-1
  bun worktree-manager.ts merge              # Merge all workers
  bun worktree-manager.ts merge worker-2     # Merge just worker-2
  bun worktree-manager.ts merge --dry-run    # Preview merge without executing
  bun worktree-manager.ts status             # Check worker status
  bun worktree-manager.ts reset worker-1 --force  # Force reset (discard changes)
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = parseCommand(args[0]);

  // Find worker argument - must be a valid worker name or "all"
  const potentialWorkerArg = args.find(
    (a) => !a.startsWith("--") && a !== args[0]
  );

  // Validate worker argument if provided
  if (
    potentialWorkerArg &&
    potentialWorkerArg !== "all" &&
    !WORKERS.includes(potentialWorkerArg as Worker)
  ) {
    console.error(`❌ Invalid worker: ${potentialWorkerArg}`);
    console.error(`   Valid options: all, ${WORKERS.join(", ")}`);
    process.exit(1);
  }

  const workerArg = potentialWorkerArg;
  const forceFlag = args.includes("--force");
  const dryRunFlag = args.includes("--dry-run");

  if (!command || command === "help") {
    printHelp();
    process.exit(0);
  }

  // Warn if --force used with unsupported command
  if (forceFlag && !FORCE_SUPPORTED_COMMANDS.includes(command)) {
    console.log(
      `⚠️  Note: --force flag has no effect on '${command}' command.\n`
    );
  }

  // Warn if --dry-run used with unsupported command
  if (dryRunFlag && !DRY_RUN_SUPPORTED_COMMANDS.includes(command)) {
    console.log(
      `⚠️  Note: --dry-run flag has no effect on '${command}' command.\n`
    );
  }

  if (dryRunFlag) {
    console.log(`🔍 DRY-RUN MODE: No changes will be made.\n`);
  }

  // Verify we're in a git repo
  try {
    await $`git rev-parse --git-dir`.quiet();
  } catch {
    console.error("❌ Not in a git repository!");
    process.exit(1);
  }

  // Verify we're in the main worktree
  if (!(await isMainWorktree())) {
    console.error(
      "❌ This command must be run from the main repository, not a worktree."
    );
    console.error("   Please cd to your main project directory and try again.");
    process.exit(1);
  }

  const mainRepo = await getGitRoot();
  const mainBranch = await getCurrentBranch();

  // Block destructive operations in detached HEAD
  if (mainBranch === null && ["merge", "reset"].includes(command)) {
    console.error(
      "❌ Cannot run this command: You are in detached HEAD state."
    );
    console.error(
      "   Please checkout a branch first (e.g., git checkout main)"
    );
    process.exit(1);
  }

  // Warn if on a worker branch
  if (
    mainBranch &&
    WORKERS.includes(mainBranch as Worker) &&
    command !== "status"
  ) {
    console.log(`⚠️  Warning: You are currently on branch '${mainBranch}'`);
    console.log(
      `   Consider switching to your main development branch before running this command.\n`
    );
  }

  switch (command) {
    case "setup": {
      console.log("🏗️  Setting up worker worktrees...\n");
      let allSuccess = true;
      for (const worker of WORKERS) {
        const success = await createWorktree(mainRepo, worker, mainBranch);
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
        await openWorker(mainRepo, worker, mainBranch);
      }
      break;
    }

    case "merge": {
      if (!mainBranch) {
        console.error("❌ Unexpected: mainBranch is null in merge");
        process.exit(1);
      }
      const workers = parseWorkerArg(workerArg);
      console.log(
        `🔀 Merging ${workers.length} worker(s) into ${mainBranch}...`
      );

      let allSucceeded = true;
      for (const worker of workers) {
        // Re-verify branch before each merge to catch mid-operation changes
        const currentBranch = await getCurrentBranch();
        if (currentBranch !== mainBranch) {
          console.log(
            `\n❌ Branch changed from ${mainBranch} to ${currentBranch || "detached HEAD"}!`
          );
          console.log(`   Aborting remaining merges for safety.`);
          allSucceeded = false;
          break;
        }

        const result = await mergeWorker(
          mainRepo,
          worker,
          mainBranch,
          dryRunFlag
        );
        if (!result.success) {
          allSucceeded = false;
          if (result.error === "Merge conflict") {
            console.log(
              `\n⛔ Stopping: Please resolve the conflict before continuing.`
            );
            break;
          }
        }
      }

      if (allSucceeded) {
        if (dryRunFlag) {
          console.log("\n✅ Dry run complete. No changes were made.");
        } else {
          console.log(
            "\n✅ All done! Workers are reset and ready for new tasks."
          );
        }
      } else {
        console.log(
          "\n⚠️  Some operations had issues. Check the output above."
        );
      }
      break;
    }

    case "reset": {
      if (!mainBranch) {
        process.exit(1);
      }
      const workers = parseWorkerArg(workerArg);
      console.log(
        `🔄 Resetting ${workers.length} worker(s) to ${mainBranch}...`
      );
      for (const worker of workers) {
        if (forceFlag) {
          await forceResetWorker(mainRepo, worker, mainBranch, dryRunFlag);
        } else {
          await resetWorker(mainRepo, worker, mainBranch, dryRunFlag);
        }
      }
      if (dryRunFlag) {
        console.log("\n✅ Dry run complete. No changes were made.");
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
      let allSucceeded = true;
      for (const worker of workers) {
        const result = await removeWorker(
          mainRepo,
          worker,
          mainBranch,
          forceFlag,
          dryRunFlag
        );
        if (!result.success) allSucceeded = false;
      }
      if (dryRunFlag) {
        console.log("\n✅ Dry run complete. No changes were made.");
      } else if (!allSucceeded) {
        console.log(
          "\n⚠️  Some operations had issues. Check the output above."
        );
      }
      break;
    }

    default: {
      // This should never happen due to parseCommand validation
      const _exhaustive: never = command;
      console.error(`❌ Unknown command: ${_exhaustive}`);
      printHelp();
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
