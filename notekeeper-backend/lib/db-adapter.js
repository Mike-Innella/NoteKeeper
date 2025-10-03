import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from 'pg';
const { Pool } = pkg;

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database mode detection
let DB_MODE = 'file'; // 'postgres' or 'file'
let pool = null;

// JSON file paths
const DB_DIR = join(__dirname, "..", "db");
const usersFile = join(DB_DIR, "users.json");
const notesFile = join(DB_DIR, "notes.json");

// Ensure db directory exists
function ensureDbDir() {
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }
}

// Read JSON file safely
function readJsonFile(filepath, defaultValue = []) {
  try {
    if (!existsSync(filepath)) {
      writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const content = readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filepath}:`, error);
    return defaultValue;
  }
}

// Write JSON file safely
function writeJsonFile(filepath, data) {
  try {
    ensureDbDir();
    writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filepath}:`, error);
    throw error;
  }
}

// PostgreSQL initialization
async function initPostgres() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    const client = await pool.connect();
    client.release();

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)
    `);

    console.log('[Database] PostgreSQL connected and initialized');
    DB_MODE = 'postgres';
    return true;
  } catch (error) {
    console.log('[Database] PostgreSQL not available:', error.message);
    return false;
  }
}

// Initialize database (try PostgreSQL first, fallback to files)
export async function initDatabase() {
  if (process.env.DATABASE_URL) {
    const pgSuccess = await initPostgres();
    if (pgSuccess) return;
  }
  
  // Fallback to file-based storage
  console.log('[Database] Using file-based storage (development mode)');
  console.log('[Database] Note: Data will persist locally but not across deployments');
  ensureDbDir();
  DB_MODE = 'file';
}

// User operations
export const users = {
  async all() {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
      } else {
        return readJsonFile(usersFile, []);
      }
    } catch (error) {
      console.error('[Database] Error fetching users:', error);
      return [];
    }
  },

  async findByEmail(email) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
          [email]
        );
        return result.rows[0] || null;
      } else {
        const users = readJsonFile(usersFile, []);
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
      }
    } catch (error) {
      console.error('[Database] Error finding user by email:', error);
      return null;
    }
  },

  async create(user) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
          [user.id, user.email, user.passwordHash, user.createdAt || new Date()]
        );
        return result.rows[0];
      } else {
        const users = readJsonFile(usersFile, []);
        const newUser = {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt || new Date().toISOString()
        };
        users.push(newUser);
        writeJsonFile(usersFile, users);
        return newUser;
      }
    } catch (error) {
      console.error('[Database] Error creating user:', error);
      throw error;
    }
  }
};

// Note operations
export const notes = {
  async all() {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC');
        return result.rows;
      } else {
        return readJsonFile(notesFile, []);
      }
    } catch (error) {
      console.error('[Database] Error fetching notes:', error);
      return [];
    }
  },

  async findByUserId(userId) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
          [userId]
        );
        return result.rows;
      } else {
        const notes = readJsonFile(notesFile, []);
        return notes
          .filter(n => n.userId === userId || n.user_id === userId)
          .sort((a, b) => {
            const dateA = new Date(b.updatedAt || b.updated_at || b.createdAt || b.created_at);
            const dateB = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at);
            return dateA - dateB;
          });
      }
    } catch (error) {
      console.error('[Database] Error fetching notes by user:', error);
      return [];
    }
  },

  async findById(id, userId) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
          [id, userId]
        );
        return result.rows[0] || null;
      } else {
        const notes = readJsonFile(notesFile, []);
        return notes.find(n => 
          n.id === id && (n.userId === userId || n.user_id === userId)
        ) || null;
      }
    } catch (error) {
      console.error('[Database] Error finding note:', error);
      return null;
    }
  },

  async create(note) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [note.id, note.userId, note.title, note.content, note.createdAt, note.updatedAt]
        );
        return result.rows[0];
      } else {
        const notes = readJsonFile(notesFile, []);
        const newNote = {
          id: note.id,
          userId: note.userId,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        };
        notes.push(newNote);
        writeJsonFile(notesFile, notes);
        return newNote;
      }
    } catch (error) {
      console.error('[Database] Error creating note:', error);
      throw error;
    }
  },

  async update(id, userId, updates) {
    try {
      if (DB_MODE === 'postgres') {
        const { title, content } = updates;
        const result = await pool.query(
          'UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
          [title, content, id, userId]
        );
        return result.rows[0] || null;
      } else {
        const notes = readJsonFile(notesFile, []);
        const index = notes.findIndex(n => 
          n.id === id && (n.userId === userId || n.user_id === userId)
        );
        if (index === -1) return null;
        
        notes[index] = {
          ...notes[index],
          title: updates.title !== undefined ? updates.title : notes[index].title,
          content: updates.content !== undefined ? updates.content : notes[index].content,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(notesFile, notes);
        return notes[index];
      }
    } catch (error) {
      console.error('[Database] Error updating note:', error);
      throw error;
    }
  },

  async delete(id, userId) {
    try {
      if (DB_MODE === 'postgres') {
        const result = await pool.query(
          'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
          [id, userId]
        );
        return result.rowCount > 0;
      } else {
        const notes = readJsonFile(notesFile, []);
        const filtered = notes.filter(n => 
          !(n.id === id && (n.userId === userId || n.user_id === userId))
        );
        if (filtered.length === notes.length) return false;
        writeJsonFile(notesFile, filtered);
        return true;
      }
    } catch (error) {
      console.error('[Database] Error deleting note:', error);
      throw error;
    }
  }
};

// Export database instance
export const db = {
  users,
  notes,
  pool,
  initDatabase,
  getMode: () => DB_MODE
};

export default db;
