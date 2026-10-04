import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
const url = 'https://gjtzgkgjigsilfnmccig.supabase.co';
const key = 'sb_publishable_rQzKnsMzu3GIkU1RTrnCfA_6ITfSmE1';

async function testCustomer() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const testEmail = 'testcustomer@wheels4rent.space';
  const testPassword = 'Password123!';
  const fullName = 'Test Customer User';
  const phone = '+91 98765 43210';
  const dlNumber = 'DL992024001';

  console.log('1. Checking or deleting old test customer...');
  await client.query("delete from auth.users where email = $1", [testEmail]);

  console.log('2. Inserting user into auth.users with pgcrypto crypt...');
  const res = await client.query(`
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      $1,
      crypt($2, gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      $3::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    returning id;
  `, [
    testEmail, 
    testPassword, 
    JSON.stringify({ full_name: fullName, phone, dl_number: dlNumber, role: 'customer' })
  ]);

  const userId = res.rows[0].id;
  console.log('Inserted user ID:', userId);

  console.log('3. Inserting identity into auth.identities...');
  await client.query(`
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      $1::uuid,
      jsonb_build_object('sub', $1::text, 'email', $2::text),
      'email',
      $1::text,
      now(),
      now(),
      now()
    );
  `, [userId, testEmail]);

  console.log('4. Upserting into public.profiles...');
  await client.query(`
    insert into public.profiles (id, email, full_name, phone, dl_number, role)
    values ($1, $2, $3, $4, $5, 'customer')
    on conflict (id) do update set
      email = excluded.email,
      full_name = excluded.full_name;
  `, [userId, testEmail, fullName, phone, dlNumber]);

  await client.end();
  console.log('User created in DB! Now testing Supabase Client login...');

  const sb = createClient(url, key);
  const loginRes = await sb.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginRes.error) {
    console.error('Login error:', loginRes.error);
  } else {
    console.log('SUCCESS! Logged into Supabase Auth as customer!');
    console.log('User ID:', loginRes.data.user.id);
    console.log('Access token:', Boolean(loginRes.data.session?.access_token));
  }
}

testCustomer().catch(console.error);
