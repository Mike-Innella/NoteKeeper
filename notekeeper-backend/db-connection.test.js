import pkg from "pg";
const { Client } = pkg;

// Test different connection configurations
const configs = [
  {
    name: "Session Pooler AWS-1 (5432) - From .env",
    connectionString: "postgresql://postgres.pytuhhdxbdscqktvtlal:noteKEEPER2099@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  },
  {
    name: "Transaction Pooler AWS-1 (6543)",
    connectionString: "postgresql://postgres.pytuhhdxbdscqktvtlal:noteKEEPER2099@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  },
  {
    name: "Session Pooler AWS-0 (5432)",
    connectionString: "postgresql://postgres.pytuhhdxbdscqktvtlal:noteKEEPER2099@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  },
  {
    name: "Transaction Pooler AWS-0 (6543)",
    connectionString: "postgresql://postgres.pytuhhdxbdscqktvtlal:noteKEEPER2099@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  },
  {
    name: "Direct DB Connection",
    connectionString: "postgresql://postgres:noteKEEPER2099@db.pytuhhdxbdscqktvtlal.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  },
  {
    name: "Direct DB Connection (Port 6543)",
    connectionString: "postgresql://postgres:noteKEEPER2099@db.pytuhhdxbdscqktvtlal.supabase.co:6543/postgres",
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnection(config) {
  console.log(`\nTesting: ${config.name}`);
  console.log(`Connection String: ${config.connectionString.replace(/:[^@]+@/, ':****@')}`);
  
  const client = new Client({
    connectionString: config.connectionString,
    ssl: config.ssl
  });
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ SUCCESS: Connected at ${result.rows[0].now}`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("Testing Supabase Database Connections");
  console.log("=".repeat(60));
  
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 Working configuration found!`);
      console.log(`Use this DATABASE_URL in Render:`);
      console.log(config.connectionString);
      break;
    }
  }
  
  process.exit(0);
}

runTests();
