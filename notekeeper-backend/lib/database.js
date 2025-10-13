import pkg from "pg";
import { parse } from "pg-connection-string";
const { Pool } = pkg;

// Parse DATABASE_URL to get connection parameters
const parseConnectionString = (connectionString) => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  
  try {
    // Use pg-connection-string to parse the URL
    const config = parse(connectionString);
    return config;
  } catch (error) {
    console.error("[Database] Failed to parse DATABASE_URL:", error);
    throw error;
  }
};

// Create connection pool with proper SSL handling for Supabase
const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  
  // Parse the connection string to get individual parameters
  const parsedConfig = parseConnectionString(connectionString);
  
  // Check environment
  const isProduction = process.env.NODE_ENV === "production";
  const isRender = process.env.RENDER === "true" || !!process.env.RENDER;
  const isSupabase = /supabase\.co|supabase\.com/.test(connectionString || "");
  
  // Build the configuration object
  const config = {
    host: parsedConfig.host,
    port: parsedConfig.port || 5432,
    database: parsedConfig.database,
    user: parsedConfig.user,
    password: parsedConfig.password,
    // Connection pool settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  };
  
  // Apply SSL configuration for production/Render/Supabase
  if (isProduction || isRender || isSupabase) {
    config.ssl = {
      rejectUnauthorized: false,
      // This is critical for Supabase
      require: true,
    };
  }
  
  // Log configuration (without sensitive data) for debugging
  console.log("[Database] Initializing pool with config:", {
    host: config.host,
    port: config.port,
    database: config.database,
    hasSSL: !!config.ssl,
    sslRejectUnauthorized: config.ssl?.rejectUnauthorized,
    isProduction,
    isRender,
    isSupabase,
  });
  
  return new Pool(config);
};

export const pool = createPool();

// Add connection event handlers for better debugging
pool.on('error', (err) => {
  console.error('[Database] Unexpected pool error:', err);
});

pool.on('connect', () => {
  console.log('[Database] New client connected to pool');
});

async function query(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res;
  } catch (error) {
    console.error('[Database] Query error:', error.message);
    throw error;
  }
}
// --- Schema bootstrap ---
const schemaSQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- update updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $BODY$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notes_set_updated_at') THEN
    CREATE TRIGGER notes_set_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END$$;
`;

export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  try {
    // Test connection first
    console.log("[Database] Testing connection...");
    const testResult = await query("SELECT 1 as test;");
    console.log("[Database] Connection test successful");
    
    // Initialize schema
    console.log("[Database] Initializing schema...");
    await query(schemaSQL);
    
    // Final health check
    await query("SELECT 1;");
    console.log("[Database] Initialized and healthy");
  } catch (error) {
    console.error("[Database] Initialization failed:", error.message);
    if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.error("[Database] SSL certificate issue detected. Ensure DATABASE_URL is correct and SSL is properly configured.");
    }
    throw error;
  }
}

export async function healthcheck() {
  const { rows } = await query("SELECT NOW() as now");
  return rows?.[0]?.now;
}

// --- Users adapter ---
const users = {
  async findByEmail(email) {
    const { rows } = await query(
      `SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },
  async create(user) {
    const { id, email, passwordHash, createdAt } = user;
    const { rows } = await query(
      `INSERT INTO users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()))
       RETURNING id, email, created_at`,
      [id, email, passwordHash, createdAt || null]
    );
    return rows[0];
  },
};

// --- Notes adapter ---
const notes = {
  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM notes WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  },
  async findById(id, userId) {
    const { rows } = await query(
      `SELECT id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM notes WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },
  async create(note) {
    const { id, userId, title, content, createdAt, updatedAt } = note;
    const { rows } = await query(
      `INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()), COALESCE($6::timestamptz, NOW()))
       RETURNING id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [id, userId, title, content, createdAt || null, updatedAt || null]
    );
    return rows[0];
  },
  async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(updates.content);
    }
    if (!fields.length) return this.findById(id, userId);

    // updated_at handled by trigger, but we can set it explicitly too
    fields.push(`updated_at = NOW()`);

    values.push(id);
    values.push(userId);

    const { rows } = await query(
      `UPDATE notes SET ${fields.join(", ")}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING id, user_id AS "userId", title, content, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return rows[0] || null;
  },
  async delete(id, userId) {
    const { rowCount } = await query(
      `DELETE FROM notes WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rowCount > 0;
  },
};

export async function closePool() {
  try {
    await pool.end();
    console.log("[Database] Pool closed");
  } catch (err) {
    console.error("[Database] Error closing pool:", err);
  }
}

export const db = { users, notes, pool, initDatabase, healthcheck, closePool };
export default db;
