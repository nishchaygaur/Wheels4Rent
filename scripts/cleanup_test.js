import pg from 'pg';
const { Client } = pg;
const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function cleanup() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query("delete from auth.users where email like 'live_test_%@example.com'");
  await client.query("delete from public.profiles where email like 'live_test_%@example.com'");
  console.log('Cleanup complete.');
  await client.end();
}

cleanup().catch(console.error);
