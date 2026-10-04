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

  console.log('Creating handle_new_user trigger on auth.users...');
  await client.query(`
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, email, full_name, phone, dl_number, role, created_at)
      values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'dl_number',
        case when lower(new.email) = 'wheels4rent@cyberforage.space' then 'admin' else coalesce(new.raw_user_meta_data->>'role', 'customer') end,
        now()
      )
      on conflict (id) do update set
        email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        dl_number = coalesce(excluded.dl_number, public.profiles.dl_number),
        role = excluded.role;
      return new;
    end;
    $$ language plpgsql security definer;

    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert or update on auth.users
      for each row execute procedure public.handle_new_user();
  `);

  console.log('Database auth setup complete!');
  await client.end();
}

setup().catch(console.error);
