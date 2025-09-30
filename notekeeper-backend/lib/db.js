import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  renameSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root data directory
const DB_DIR = join(__dirname, "..", "db");

// Ensure db directory exists (create, don't throw)
function ensureDir() {
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }
}

// Return canonical paths for a logical file ("notes" | "users")
function paths(name) {
  return {
    main: join(DB_DIR, `${name}.json`),
    temp: join(DB_DIR, `${name}.json.tmp`),
    backup: join(DB_DIR, `${name}.backup.json`),
  };
}

// Create file if missing (prefer restore from backup if available)
function ensureFile(name) {
  ensureDir();
  const { main, backup } = paths(name);
  if (!existsSync(main)) {
    if (existsSync(backup)) {
      console.log(`[db] Restoring ${name}.json from backup...`);
      copyFileSync(backup, main);
    } else {
      writeFileSync(main, "[]");
    }
  }
}

// Safe read: [] if file missing or invalid, tries backup recovery
function readArray(name) {
  ensureFile(name);
  const { main, backup } = paths(name);
  try {
    const raw = readFileSync(main, "utf8");
    if (!raw || raw.trim() === "") return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[db] Failed reading ${name}.json:`, err);
    // attempt recovery from backup
    if (existsSync(backup)) {
      try {
        const rawB = readFileSync(backup, "utf8");
        const parsedB = JSON.parse(rawB);
        if (Array.isArray(parsedB)) {
          console.log(`[db] Recovered ${name}.json from backup`);
          writeFileSync(main, JSON.stringify(parsedB, null, 2));
          return parsedB;
        }
      } catch (errB) {
        console.error(`[db] Backup recovery failed for ${name}.json:`, errB);
      }
    }
    return [];
  }
}

// Safe write with backup and atomic rename
function writeArray(name, rows) {
  ensureFile(name);
  if (!Array.isArray(rows)) throw new Error(`${name} must be an array`);
  const { main, backup, temp } = paths(name);

  // Try to create/update backup, but don't fail the write if backup fails
  try {
    if (existsSync(main)) copyFileSync(main, backup);
  } catch (bErr) {
    console.warn(`[db] Failed to create backup for ${name}.json:`, bErr);
  }

  // Atomic write: temp -> rename
  writeFileSync(temp, JSON.stringify(rows, null, 2));
  renameSync(temp, main);
}

/** Public API expected by server.js */
export const db = {
  users: {
    all: () => readArray("users"),
    save: (rows) => writeArray("users", rows),
  },
  notes: {
    all: () => readArray("notes"),
    save: (rows) => writeArray("notes", rows),
  },
};

// Optional internals if you ever need them
export const _internal = {
  DB_DIR,
  paths,
  ensureDir,
  ensureFile,
  readArray,
  writeArray,
};
