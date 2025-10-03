import "dotenv/config";
import pkg from 'pg';
const { Pool } = pkg;

// Test database connection
async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set");
    
    // Try to connect
    const client = await pool.connect();
    console.log("✓ Successfully connected to database");
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log("✓ Database is responding. Current time:", result.rows[0].now);
    
    client.release();
    await pool.end();
    
    console.log("\n✅ Database connection test successful!");
    console.log("\nYou can now:");
    console.log("1. Run 'npm run migrate' to migrate existing data");
    console.log("2. Run 'npm start' to start the server");
    
  } catch (error) {
    console.error("\n❌ Database connection test failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 PostgreSQL might not be running locally.");
      console.log("For local testing, install PostgreSQL or use Render's database.");
    }
    
    if (!process.env.DATABASE_URL) {
      console.log("\n💡 DATABASE_URL is not set in your .env file");
      console.log("Please update the .env file with your database credentials.");
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
