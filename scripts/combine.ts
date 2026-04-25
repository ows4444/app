import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const OUTPUT_PREFIX = "combine-part";
const MAX_CHARS = 100_000; // Adjust as needed
const INCLUDE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".json",
  ".gitkeep",
  ".mjs",
  ".md",
  ".nvmrc",
  ".mjs",
  ".prettierrc",
]);
const IGNORE_NAMES = new Set([
  "scripts",
  ".next",

  "dist",
  "build",
  "node_modules",
  "package-lock.json",
  ".claude",
  ".git",
  ".vscode",
  "yarn.lock",
]);

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    if (IGNORE_NAMES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else {
      const ext = path.extname(entry.name);

      if (INCLUDE_EXTENSIONS.has(ext) || INCLUDE_EXTENSIONS.has(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

const files = walk(ROOT_DIR).sort();
let part = 1;
let currentChars = 0;
let buffer = "";

function flushPart() {
  if (!buffer.trim()) return;

  const outFile = `${OUTPUT_PREFIX}-${part}.md`;

  fs.writeFileSync(outFile, buffer.trimEnd() + "\n", "utf8");
  console.log(`✔ written ${outFile}`);
  buffer = "";
  currentChars = 0;
  part++;
}

for (const file of files) {
  const rel = path.relative(ROOT_DIR, file);
  if (rel.startsWith(OUTPUT_PREFIX)) continue;

  const content = fs.readFileSync(file, "utf8").trimEnd();
  const section = `## ${rel}\n\n${content}\n\n---\n\n`;
  const sectionChars = section.length;

  if (sectionChars > MAX_CHARS) {
    console.warn(`⚠ skipped ${rel} (${sectionChars} chars exceeds ${MAX_CHARS})`);
    continue;
  }

  if (currentChars + sectionChars > MAX_CHARS) {
    flushPart();
  }

  buffer += section;
  currentChars += sectionChars;
}

flushPart();
console.log(`✔ done. Total parts created: ${part - 1}`);
