// database.js
import pkg from "pg";
const { Pool } = pkg;

/**
 * Connection pool
 * - Uses Supabase Session Pooler (IPv4-optimized) for best performance
 * - SSL is required with self-signed certificates
 */
// Force SSL for Supabase connections
const isSupabase =
  process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase.com");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production" || process.env.IS_SUPABASE === "true"
      ? { rejectUnauthorized: false } // ✅ required for Supabase
      : false,
});

/**
 * Initialize database schema and helpers.
 * - users: auth identities
 * - notes: user-scoped notes
 * - Trigger keeps updated_at current on UPDATE
 * - Indexes for common queries
 */
export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            VARCHAR(255) PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id         VARCHAR(255) PRIMARY KEY,
        user_id    VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT,
        content    TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at DESC);
    `);

    // Keep updated_at fresh on UPDATE
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_set_updated_at ON notes;

      CREATE TRIGGER trg_set_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

    console.log("[Database] Tables initialized successfully");
  } catch (error) {
    console.error("[Database] Error initializing tables:", error);
    throw error;
  }
}

/** ---------- User operations ---------- */
export const users = {
  async all() {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, created_at
         FROM users
         ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("[Database] Error fetching users:", error);
      return [];
    }
  },

  async findByEmail(email) {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, password_hash, created_at
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("[Database] Error finding user by email:", error);
      return null;
    }
  },

  async create(user) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (id, email, password_hash, created_at)
         VALUES ($1, $2, $3, COALESCE($4, now()))
         RETURNING id, email, created_at`,
        [user.id, user.email, user.passwordHash, user.createdAt || null]
      );
      return rows[0];
    } catch (error) {
      console.error("[Database] Error creating user:", error);
      throw error;
    }
  },
};

/** ---------- Note operations ---------- */
export const notes = {
  async all() {
    try {
      const { rows } = await pool.query(
        `SELECT id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM notes
         ORDER BY updated_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("[Database] Error fetching notes:", error);
      return [];
    }
  },

  async findByUserId(userId) {
    try {
      const { rows } = await pool.query(
        `SELECT id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM notes
         WHERE user_id = $1
         ORDER BY updated_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("[Database] Error fetching notes by user:", error);
      return [];
    }
  },

  async findById(id, userId) {
    try {
      const { rows } = await pool.query(
        `SELECT id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM notes
         WHERE id = $1 AND user_id = $2
         LIMIT 1`,
        [id, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("[Database] Error finding note:", error);
      return null;
    }
  },

  async create(note) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
         VALUES ($1, $2, $3, $4, COALESCE($5, now()), COALESCE($6, now()))
         RETURNING id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [
          note.id,
          note.userId,
          note.title ?? null,
          note.content ?? null,
          note.createdAt || null,
          note.updatedAt || null,
        ]
      );
      return rows[0];
    } catch (error) {
      console.error("[Database] Error creating note:", error);
      throw error;
    }
  },

  async update(id, userId, updates) {
    try {
      const { title = null, content = null } = updates || {};
      const { rows } = await pool.query(
        `UPDATE notes
         SET title = COALESCE($1, title),
             content = COALESCE($2, content)
         WHERE id = $3 AND user_id = $4
         RETURNING id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [title, content, id, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("[Database] Error updating note:", error);
      throw error;
    }
  },

  async delete(id, userId) {
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM notes WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      return rowCount > 0;
    } catch (error) {
      console.error("[Database] Error deleting note:", error);
      throw error;
    }
  },
};

/** ---------- Utilities ---------- */

/** Simple health check: SELECT 1; returns true if DB reachable */
export async function healthcheck() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/** Graceful shutdown helper (call on SIGINT/SIGTERM) */
export async function closePool() {
  try {
    await pool.end();
    console.log("[Database] Pool closed");
  } catch (err) {
    console.error("[Database] Error closing pool:", err);
  }
}

/** Compatibility export */
export const db = { users, notes, pool, initDatabase, healthcheck, closePool };
export default db;
