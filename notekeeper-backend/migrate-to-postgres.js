import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from 'pg';
const { Pool } = pkg;

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Paths to JSON files
const usersJsonPath = join(__dirname, "db", "users.json");
const notesJsonPath = join(__dirname, "db", "notes.json");

async function initDatabase() {
  console.log("Initializing database tables...");
  
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

  console.log("✓ Database tables initialized");
}

async function migrateUsers() {
  if (!existsSync(usersJsonPath)) {
    console.log("No users.json file found, skipping users migration");
    return;
  }

  const usersData = JSON.parse(readFileSync(usersJsonPath, "utf8"));
  
  if (!Array.isArray(usersData) || usersData.length === 0) {
    console.log("No users to migrate");
    return;
  }

  console.log(`Migrating ${usersData.length} users...`);

  for (const user of usersData) {
    try {
      // Check if user already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE id = $1 OR email = $2',
        [user.id, user.email]
      );

      if (existing.rows.length > 0) {
        console.log(`  User ${user.email} already exists, skipping`);
        continue;
      }

      // Insert user
      await pool.query(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
        [
          user.id,
          user.email,
          user.passwordHash || user.password_hash,
          user.createdAt || new Date()
        ]
      );
      console.log(`  ✓ Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate user ${user.email}:`, error.message);
    }
  }
}

async function migrateNotes() {
  if (!existsSync(notesJsonPath)) {
    console.log("No notes.json file found, skipping notes migration");
    return;
  }

  const notesData = JSON.parse(readFileSync(notesJsonPath, "utf8"));
  
  if (!Array.isArray(notesData) || notesData.length === 0) {
    console.log("No notes to migrate");
    return;
  }

  console.log(`Migrating ${notesData.length} notes...`);

  // Get the first user from database (for orphaned notes)
  const firstUserResult = await pool.query('SELECT id FROM users LIMIT 1');
  const defaultUserId = firstUserResult.rows[0]?.id;

  if (!defaultUserId && notesData.some(n => !n.userId)) {
    console.log("Warning: Some notes don't have a userId and no users exist in database");
    console.log("Please create a user first, then run migration again");
  }

  for (const note of notesData) {
    try {
      // Check if note already exists
      const existing = await pool.query(
        'SELECT id FROM notes WHERE id = $1',
        [note.id]
      );

      if (existing.rows.length > 0) {
        console.log(`  Note "${note.title}" already exists, skipping`);
        continue;
      }

      // Determine userId - use existing or assign to first user
      let userId = note.userId || note.user_id;
      
      if (!userId && defaultUserId) {
        userId = defaultUserId;
        console.log(`  Assigning orphaned note "${note.title}" to user ${defaultUserId}`);
      }

      if (!userId) {
        console.log(`  ✗ Skipping note "${note.title}" - no userId and no users in database`);
        continue;
      }

      // Check if the user exists
      const userExists = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userExists.rows.length === 0) {
        console.log(`  ✗ Skipping note "${note.title}" - user ${userId} not found`);
        continue;
      }

      // Insert note
      await pool.query(
        'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          note.id,
          userId,
          note.title || '',
          note.content || '',
          note.createdAt || new Date(),
          note.updatedAt || note.createdAt || new Date()
        ]
      );
      console.log(`  ✓ Migrated note: "${note.title}"`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate note "${note.title}":`, error.message);
    }
  }
}

async function showStats() {
  const usersCount = await pool.query('SELECT COUNT(*) FROM users');
  const notesCount = await pool.query('SELECT COUNT(*) FROM notes');
  
  console.log("\nMigration Summary:");
  console.log(`  Total users in database: ${usersCount.rows[0].count}`);
  console.log(`  Total notes in database: ${notesCount.rows[0].count}`);
}

async function runMigration() {
  console.log("Starting migration to PostgreSQL...\n");

  try {
    await initDatabase();
    await migrateUsers();
    await migrateNotes();
    await showStats();
    
    console.log("\n✅ Migration completed successfully!");
    console.log("\nNote: The old JSON files are preserved. You can delete them once you've verified the migration.");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
