#!/usr/bin/env bun
/**
 * Worktree Manager for Claude Code
 *
 * Usage: bun worktree-manager.ts <command> [worker]
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

async function getCurrentBranch(): Promise<string> {
  const result = await $`git branch --show-current`.text();
  return result.trim();
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

async function createWorktree(mainRepo: string, worker: Worker): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);

  if (await worktreeExists(mainRepo, worker)) {
    console.log(`⏭️  Worktree ${worker} already exists at ${path}`);
    return;
  }

  console.log(`📁 Creating worktree ${worker} at ${path}...`);
  await $`git worktree add ${path} -b ${worker}`.quiet();
  console.log(`✅ Created ${worker}`);
}

async function openWorker(mainRepo: string, worker: Worker): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    await createWorktree(mainRepo, worker);
  }

  console.log(`🚀 Opening VS Code terminal for ${worker}...`);
  await $`code --new-window ${path}`.quiet();
  console.log(`✅ Opened ${worker} in VS Code`);
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

  console.log(`\n🔀 Merging ${worker} into ${mainBranch}...`);

  // Check if there are any commits to merge
  const diffResult = await $`git log ${mainBranch}..${worker} --oneline`.text();

  if (!diffResult.trim()) {
    console.log(`⏭️  No new commits in ${worker}. Skipping merge.`);
  } else {
    console.log(`📋 Commits to merge:\n${diffResult}`);

    try {
      const commitMsg = `Merge ${worker} into ${mainBranch}`;
      await $`git merge ${worker} -m ${commitMsg}`;
      console.log(`✅ Merged ${worker}`);
    } catch (e) {
      console.log(`⚠️  Merge conflict detected. Please resolve manually.`);
      console.log(
        `   After resolving, run: bun worktree-manager.ts reset ${worker}`
      );
      return false;
    }
  }

  // Reset the worker branch to main (from inside the worktree)
  console.log(`🔄 Resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`.quiet();
  console.log(`✅ Reset ${worker} to ${mainBranch}`);

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

  console.log(`🔄 Resetting ${worker} to ${mainBranch}...`);
  await $`git -C ${worktreePath} reset --hard ${mainBranch}`.quiet();
  console.log(`✅ Reset ${worker}`);
}

async function statusWorkers(mainRepo: string): Promise<void> {
  const currentBranch = await getCurrentBranch();
  console.log(`📍 Main repo branch: ${currentBranch}\n`);

  console.log("📊 Worktree status:\n");

  for (const worker of WORKERS) {
    const exists = await worktreeExists(mainRepo, worker);
    const path = getWorktreePath(mainRepo, worker);

    if (!exists) {
      console.log(`   ${worker}: ❌ Not created`);
      continue;
    }

    try {
      const commits =
        await $`git log ${currentBranch}..${worker} --oneline`.text();
      const commitCount = commits.trim()
        ? commits.trim().split("\n").length
        : 0;

      console.log(`   ${worker}: ✅ Active at ${path}`);
      console.log(
        `            ${commitCount} commit(s) ahead of ${currentBranch}`
      );
    } catch {
      console.log(`   ${worker}: ✅ Active at ${path}`);
      console.log(`            Unable to count commits`);
    }
  }
}

async function removeWorker(mainRepo: string, worker: Worker): Promise<void> {
  const path = getWorktreePath(mainRepo, worker);

  if (!(await worktreeExists(mainRepo, worker))) {
    console.log(`❌ Worktree ${worker} does not exist.`);
    return;
  }

  console.log(`🗑️  Removing worktree ${worker}...`);
  await $`git worktree remove ${path} --force`.quiet();

  try {
    await $`git branch -D ${worker}`.quiet();
    console.log(`✅ Removed ${worker} worktree and branch`);
  } catch {
    console.log(`✅ Removed ${worker} worktree (branch may still exist)`);
  }
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

Usage: bun worktree-manager.ts <command> [worker]

Commands:
  open [worker]     Open VS Code window(s) for worker(s)
  merge [worker]    Merge worker(s) into main and reset them
  reset [worker]    Reset worker(s) to main branch (no merge)
  status            Show status of all workers
  remove [worker]   Remove worker worktree(s) and branch(es)
  setup             Create all worker worktrees

Worker argument:
  all               All workers (default)
  worker-1          Specific worker
  worker-2          Specific worker
  worker-3          Specific worker

Examples:
  bun worktree-manager.ts setup           # Create all worktrees
  bun worktree-manager.ts open            # Open all workers in VS Code
  bun worktree-manager.ts open worker-1   # Open just worker-1
  bun worktree-manager.ts merge           # Merge all workers
  bun worktree-manager.ts merge worker-2  # Merge just worker-2
  bun worktree-manager.ts status          # Check worker status
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const workerArg = args[1];

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

  switch (command) {
    case "setup": {
      console.log("🏗️  Setting up worker worktrees...\n");
      for (const worker of WORKERS) {
        await createWorktree(mainRepo, worker);
      }
      console.log("\n✅ All worktrees ready!");
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
          "\n✅ All merges complete! Workers reset and ready for new tasks."
        );
      } else {
        console.log("\n⚠️  Some merges had issues. Check the output above.");
      }
      break;
    }

    case "reset": {
      const workers = parseWorkerArg(workerArg);
      console.log(
        `🔄 Resetting ${workers.length} worker(s) to ${mainBranch}...`
      );
      for (const worker of workers) {
        await resetWorker(mainRepo, worker, mainBranch);
      }
      console.log("\n✅ Workers reset!");
      break;
    }

    case "status": {
      await statusWorkers(mainRepo);
      break;
    }

    case "remove": {
      const workers = parseWorkerArg(workerArg);
      console.log(`🗑️  Removing ${workers.length} worker(s)...`);
      for (const worker of workers) {
        await removeWorker(mainRepo, worker);
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
