import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function seedAdminAuth() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database...');

    // 1. Ensure pgcrypto extension is installed
    await client.query('create extension if not exists pgcrypto;');

    const adminEmail = 'wheels4rent@cyberforage.space';
    const adminPassword = 'Suraj@5141';

    // 2. Check existing user in auth.users
    const existing = await client.query('select id, email, encrypted_password, email_confirmed_at from auth.users where email = $1', [adminEmail]);
    console.log('Existing in auth.users:', existing.rows);

    let adminUserId = null;

    if (existing.rows.length > 0) {
      adminUserId = existing.rows[0].id;
      console.log('Updating password and confirming email for existing user ID:', adminUserId);
      await client.query(`
        update auth.users
        set 
          encrypted_password = crypt($1, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          confirmation_sent_at = coalesce(confirmation_sent_at, now()),
          raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{provider}', '"email"'),
          raw_user_meta_data = jsonb_set(
            jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"'),
            '{full_name}', '"Wheels4Rent Operations (Admin)"'
          ),
          role = 'authenticated',
          aud = 'authenticated',
          updated_at = now()
        where id = $2;
      `, [adminPassword, adminUserId]);
    } else {
      console.log('Creating new user in auth.users...');
      const insertRes = await client.query(`
        insert into auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          recovery_sent_at,
          last_sign_in_at,
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
          null,
          null,
          '{"provider": "email", "providers": ["email"]}'::jsonb,
          '{"role": "admin", "full_name": "Wheels4Rent Operations (Admin)", "phone": "+91 97589 25637"}'::jsonb,
          now(),
          now(),
          '',
          '',
          '',
          ''
        )
        returning id;
      `, [adminEmail, adminPassword]);
      adminUserId = insertRes.rows[0].id;
    }

    console.log('Admin user ID in auth.users:', adminUserId);

    // 3. Ensure auth.identities has an identity for email sign in
    const colsRes = await client.query(`
      select column_name, data_type, udt_name 
      from information_schema.columns 
      where table_schema = 'auth' and table_name = 'identities';
    `);
    console.log('auth.identities columns:', colsRes.rows);

    const identityCheck = await client.query('select * from auth.identities where user_id = $1::uuid', [adminUserId]);
    console.log('Existing identities for admin:', identityCheck.rows.length);

    if (identityCheck.rows.length === 0) {
      console.log('Inserting email identity into auth.identities...');
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
      `, [adminUserId, adminEmail]);
    }

    // 4. Upsert into public.profiles with role = 'admin'
    console.log('Upserting admin record in public.profiles...');
    await client.query(`
      insert into public.profiles (id, email, full_name, phone, role)
      values (
        $1,
        $2,
        'Wheels4Rent Operations (Admin)',
        '+91 97589 25637',
        'admin'
      )
      on conflict (id) do update set
        email = excluded.email,
        full_name = excluded.full_name,
        role = 'admin';
    `, [adminUserId, adminEmail]);

    // Also update any old 'admin-001' record if present
    await client.query(`
      update public.profiles set role = 'admin' where email = $1;
    `, [adminEmail]);

    console.log('Admin user successfully configured in Supabase Auth & Profiles!');

    // 5. Verify bcrypt password check with pgcrypto
    const testAuth = await client.query(`
      select 
        id, 
        email, 
        (encrypted_password = crypt($1, encrypted_password)) as password_matches,
        email_confirmed_at,
        raw_user_meta_data
      from auth.users 
      where email = $2;
    `, [adminPassword, adminEmail]);

    console.log('Verification result:', testAuth.rows[0]);
  } catch (err) {
    console.error('Error seeding admin auth:', err);
  } finally {
    await client.end();
  }
}

seedAdminAuth();
