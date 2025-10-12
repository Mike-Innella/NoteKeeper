// test-supabase-connection.js
import pkg from "pg";
const { Pool } = pkg;

async function testConnection() {
  console.log("🔄 Testing Supabase database connection...\n");
  
  // Session Pooler connection string (IPv4 only, works with Render)
  const SUPABASE_DB_URL = "postgresql://postgres.pytuhhdxbdscqktvtlal:noteKEEPER2099@aws-1-us-east-1.pooler.supabase.com:5432/postgres";
  
  console.log("🔗 Using Session Pooler connection (IPv4-optimized)");
  
  const pool = new Pool({
    connectionString: SUPABASE_DB_URL,
    ssl: {
      rejectUnauthorized: false,
      // Explicit SSL mode
      require: true
    }
  });
  
  try {
    // Test basic connection
    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
    console.log("✅ Connection successful!");
    console.log("📅 Server time:", result.rows[0].current_time);
    console.log("🐘 PostgreSQL:", result.rows[0].pg_version.split(',')[0]);
    
    // Check if our tables exist
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'notes')
      ORDER BY table_name;
    `);
    
    console.log("\n📊 Existing tables:");
    if (tablesQuery.rows.length === 0) {
      console.log("   ⚠️  No tables found - database needs initialization");
      console.log("   Run 'npm start' to initialize the database schema");
    } else {
      tablesQuery.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      
      // Count records if tables exist
      for (const table of tablesQuery.rows) {
        const countQuery = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`      → ${countQuery.rows[0].count} records`);
      }
    }
    
    // Check extensions
    const extensionsQuery = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
      ORDER BY extname;
    `);
    
    if (extensionsQuery.rows.length > 0) {
      console.log("\n🔧 Available extensions:");
      extensionsQuery.rows.forEach(row => {
        console.log(`   ✓ ${row.extname} (v${row.extversion})`);
      });
    }
    
    console.log("\n✨ Supabase database is ready for migration!");
    
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("password")) {
      console.error("\n💡 Check your database password in the connection string");
    }
    if (error.message.includes("does not exist")) {
      console.error("\n💡 Check your Supabase project reference ID");
    }
    if (error.message.includes("SSL")) {
      console.error("\n💡 Ensure ?sslmode=require is in your connection string");
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
