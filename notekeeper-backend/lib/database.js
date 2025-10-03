import pkg from 'pg';
const { Pool } = pkg;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
export async function initDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create notes table
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

    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)
    `);

    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Error initializing tables:', error);
    throw error;
  }
}

// User operations
export const users = {
  async all() {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('[Database] Error fetching users:', error);
      return [];
    }
  },

  async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('[Database] Error finding user by email:', error);
      return null;
    }
  },

  async create(user) {
    try {
      const result = await pool.query(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, user.email, user.passwordHash, user.createdAt || new Date()]
      );
      return result.rows[0];
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
      const result = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC');
      return result.rows;
    } catch (error) {
      console.error('[Database] Error fetching notes:', error);
      return [];
    }
  },

  async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('[Database] Error fetching notes by user:', error);
      return [];
    }
  },

  async findById(id, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('[Database] Error finding note:', error);
      return null;
    }
  },

  async create(note) {
    try {
      const result = await pool.query(
        'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [note.id, note.userId, note.title, note.content, note.createdAt, note.updatedAt]
      );
      return result.rows[0];
    } catch (error) {
      console.error('[Database] Error creating note:', error);
      throw error;
    }
  },

  async update(id, userId, updates) {
    try {
      const { title, content } = updates;
      const result = await pool.query(
        'UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
        [title, content, id, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('[Database] Error updating note:', error);
      throw error;
    }
  },

  async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('[Database] Error deleting note:', error);
      throw error;
    }
  }
};

// Export database instance for compatibility
export const db = {
  users,
  notes,
  pool,
  initDatabase
};

export default db;
