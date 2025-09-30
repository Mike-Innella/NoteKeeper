import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "notes.json");
const BACKUP_FILE = path.join(DATA_DIR, "notes.backup.json");

// Ensure data directory and file exist
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DATA_FILE)) {
      // Check if backup exists and restore from it
      if (fs.existsSync(BACKUP_FILE)) {
        console.log("Restoring from backup...");
        fs.copyFileSync(BACKUP_FILE, DATA_FILE);
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      }
    }
  } catch (error) {
    console.error("Error ensuring data file:", error);
    throw new Error("Failed to initialize data storage");
  }
}

// Read notes with error recovery
export function readNotes() {
  ensureDataFile();
  
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    
    if (!raw || raw.trim() === "") {
      return [];
    }
    
    const notes = JSON.parse(raw);
    
    // Validate data structure
    if (!Array.isArray(notes)) {
      console.warn("Invalid data structure, returning empty array");
      return [];
    }
    
    // Validate each note has required fields
    return notes.filter(note => {
      return note && 
             typeof note.id === "string" &&
             note.createdAt &&
             note.updatedAt;
    });
    
  } catch (error) {
    console.error("Error reading notes, attempting recovery:", error);
    
    // Try to recover from backup
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const backupRaw = fs.readFileSync(BACKUP_FILE, "utf8");
        const backupNotes = JSON.parse(backupRaw);
        
        if (Array.isArray(backupNotes)) {
          console.log("Recovered from backup");
          writeNotes(backupNotes);
          return backupNotes;
        }
      } catch (backupError) {
        console.error("Backup recovery failed:", backupError);
      }
    }
    
    return [];
  }
}

// Write notes with atomic operation and backup
export function writeNotes(notes) {
  ensureDataFile();
  
  try {
    // Validate input
    if (!Array.isArray(notes)) {
      throw new Error("Notes must be an array");
    }
    
    // Create backup before writing
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, BACKUP_FILE);
      } catch (backupError) {
        console.warn("Failed to create backup:", backupError);
      }
    }
    
    // Write to temporary file first (atomic write)
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(notes, null, 2));
    
    // Rename temp file to actual file (atomic operation)
    fs.renameSync(tempFile, DATA_FILE);
    
  } catch (error) {
    console.error("Error writing notes:", error);
    
    // Try to restore from backup if write failed
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        fs.copyFileSync(BACKUP_FILE, DATA_FILE);
        console.log("Restored from backup after write failure");
      } catch (restoreError) {
        console.error("Failed to restore from backup:", restoreError);
      }
    }
    
    throw new Error("Failed to save notes");
  }
}

// Export a function to manually create a backup
export function createBackup() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const backupPath = path.join(DATA_DIR, `notes-${timestamp}.backup.json`);
      fs.copyFileSync(DATA_FILE, backupPath);
      return backupPath;
    }
  } catch (error) {
    console.error("Failed to create backup:", error);
    return null;
  }
}
