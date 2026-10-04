import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function setup() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Creating auth_otps table...');
  await client.query(`
    create table if not exists public.auth_otps (
      email text primary key,
      otp_code text not null,
      expires_at timestamp with time zone not null,
      otp_type text not null default 'login',
      created_at timestamp with time zone default now()
    );
  `);

  console.log('Checking pgcrypto extension...');
  await client.query(`create extension if not exists pgcrypto;`);

  console.log('Database auth setup complete!');
  await client.end();
}

setup().catch(console.error);
