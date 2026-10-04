import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function check() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check schemas
    const schemas = await client.query(`
      SELECT schema_name FROM information_schema.schemata;
    `);
    console.log('Schemas:', schemas.rows.map(r => r.schema_name));

    // Check if vault schema exists
    const vaultTables = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'vault';
    `);
    console.log('Vault tables:', vaultTables.rows);

    // Check auth schema users
    const authUsers = await client.query(`
      SELECT id, email, created_at FROM auth.users LIMIT 10;
    `);
    console.log('Auth users:', authUsers.rows);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

check();
