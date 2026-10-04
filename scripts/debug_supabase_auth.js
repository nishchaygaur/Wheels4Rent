import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('--- Auth Tables ---');
  const tables = await client.query(`
    select table_name from information_schema.tables where table_schema = 'auth' order by table_name;
  `);
  console.log(tables.rows.map(r => r.table_name));

  console.log('--- Recent auth.users ---');
  const users = await client.query(`
    select id, email, created_at, email_confirmed_at, confirmation_sent_at, last_sign_in_at, raw_user_meta_data
    from auth.users order by created_at desc limit 10;
  `);
  console.log(users.rows);

  await client.end();
}

main().catch(console.error);
