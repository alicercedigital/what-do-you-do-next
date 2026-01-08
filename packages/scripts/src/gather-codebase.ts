import * as fs from "node:fs";
import * as path from "node:path";
import ignore, { type Ignore } from "ignore";

// Additional ignore patterns (gitignore-style)
const ADDITIONAL_IGNORE_PATTERNS = [
  ".claude",
  "bun.lock",
  "*.lock",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.svg",
  "*.ico",
  "*.woff",
  "*.woff2",
  "*.ttf",
  "*.eot",
  "ui/",
  "packages/scripts",
];

interface FileEntry {
  relativePath: string;
  content: string;
}

function findProjectRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dir, "package.json"), "utf-8")
      );
      if (pkg.workspaces) {
        return dir;
      }
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

function loadGitignore(projectRoot: string): string[] {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }
  return [];
}

function createIgnoreFilter(projectRoot: string): Ignore {
  const ig = ignore();

  // Add .gitignore patterns
  const gitignorePatterns = loadGitignore(projectRoot);
  ig.add(gitignorePatterns);

  // Add additional ignore patterns
  ig.add(ADDITIONAL_IGNORE_PATTERNS);

  // Always ignore .git directory
  ig.add(".git");

  return ig;
}

function getAllFiles(
  dir: string,
  projectRoot: string,
  ig: Ignore,
  files: FileEntry[] = []
): FileEntry[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(projectRoot, fullPath);

    // Normalize path separators for ignore matching
    const normalizedPath = relativePath.replace(/\\/g, "/");

    if (ig.ignores(normalizedPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      // Check if directory itself should be ignored
      if (!ig.ignores(normalizedPath + "/")) {
        getAllFiles(fullPath, projectRoot, ig, files);
      }
    } else if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        files.push({
          relativePath: normalizedPath,
          content,
        });
      } catch {
        // Skip binary files or files that can't be read as utf-8
      }
    }
  }

  return files;
}

function buildDirectoryTree(files: FileEntry[]): string {
  const tree: Record<string, unknown> = {};

  for (const file of files) {
    const parts = file.relativePath.split("/");
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (i === parts.length - 1) {
        // It's a file
        current[part] = null;
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    }
  }

  function renderTree(
    node: Record<string, unknown>,
    prefix: string = ""
  ): string {
    const entries = Object.entries(node).sort(([a], [b]) => {
      // Directories first, then files
      const aIsDir = node[a] !== null;
      const bIsDir = node[b] !== null;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    let result = "";
    for (let i = 0; i < entries.length; i++) {
      const [name, value] = entries[i]!;
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      result += `${prefix}${connector}${name}\n`;

      if (value !== null) {
        result += renderTree(
          value as Record<string, unknown>,
          prefix + childPrefix
        );
      }
    }

    return result;
  }

  return renderTree(tree);
}

function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const extMap: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "tsx",
    ".js": "javascript",
    ".jsx": "jsx",
    ".json": "json",
    ".md": "markdown",
    ".css": "css",
    ".html": "html",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".sh": "bash",
    ".bash": "bash",
    ".mjs": "javascript",
    ".cjs": "javascript",
  };
  return extMap[ext] || "";
}

function generateCodebaseMarkdown(
  projectRoot: string,
  files: FileEntry[]
): string {
  let output = "# Codebase\n\n";
  output += `Generated on: ${new Date().toISOString()}\n\n`;

  // Directory structure
  output += "## Structure\n\n";
  output += "```\n";
  output += buildDirectoryTree(files);
  output += "```\n\n";

  // Files
  output += "## Files\n\n";

  for (const file of files.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath)
  )) {
    const lang = getFileExtension(file.relativePath);
    output += `### ${file.relativePath}\n\n`;
    output += `\`\`\`${lang}\n`;
    output += file.content;
    if (!file.content.endsWith("\n")) {
      output += "\n";
    }
    output += "```\n\n";
  }

  return output;
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());
  console.log(`Project root: ${projectRoot}`);

  const ig = createIgnoreFilter(projectRoot);
  const files = getAllFiles(projectRoot, projectRoot, ig);

  console.log(`Found ${files.length} files`);

  const markdown = generateCodebaseMarkdown(projectRoot, files);

  // Ensure .claude directory exists
  const outputDir = path.join(projectRoot, ".claude");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "codebase.md");
  fs.writeFileSync(outputPath, markdown);

  console.log(`Codebase written to: ${outputPath}`);
  console.log(`Total size: ${(markdown.length / 1024).toFixed(2)} KB`);
}

main();
