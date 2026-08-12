const fs = require('fs');
const path = require('path');

const password = process.argv[2] || process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Error: Please provide your Supabase database password as an argument or set SUPABASE_DB_PASSWORD.');
  console.error('Usage: node scripts/deploy-supabase.js <YOUR_PASSWORD>');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.zlymhniyvrdapgyqhcry.supabase.co:5432/postgres`;
const sqlFilePath = path.join(__dirname, '..', 'supabase_schema_and_data.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error('Error: supabase_schema_and_data.sql file not found.');
  process.exit(1);
}

const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Connecting to Supabase PostgreSQL at db.zlymhniyvrdapgyqhcry.supabase.co...');

try {
  const { Client } = require('pg');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  async function run() {
    await client.connect();
    console.log('Connected successfully to Supabase PostgreSQL database!');
    console.log('Executing schema creation and data insertion...');
    await client.query(sql);
    console.log('SQL query executed successfully on Supabase database!');
    await client.end();
  }

  run().catch(err => {
    console.error('Failed to execute SQL on Supabase:', err.message);
    process.exit(1);
  });
} catch (e) {
  console.error('pg module not found. Installing pg...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install pg --no-audit --no-fund', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('pg installed successfully! Re-running deployment...');
    execSync(`node "${__filename}" "${password}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (err) {
    console.error('Failed to install pg module automatically:', err.message);
  }
}
