import { createClient } from '@supabase/supabase-js';

const url = 'https://gjtzgkgjigsilfnmccig.supabase.co';
const key = 'sb_publishable_rQzKnsMzu3GIkU1RTrnCfA_6ITfSmE1';

const sb = createClient(url, key);

async function testSignup() {
  console.log('Testing supabase.auth.signUp for testuser@example.com...');
  const start = Date.now();
  try {
    const { data, error } = await sb.auth.signUp({
      email: 'testcustomer99@gmail.com',
      password: 'Password123!',
      options: {
        data: {
          full_name: 'Test Customer',
          phone: '+91 9999999999',
        }
      }
    });

    console.log(`Took ${Date.now() - start}ms`);
    if (error) {
      console.error('Signup Error:', error);
    } else {
      console.log('Signup Success:', data);
    }
  } catch (err) {
    console.error(`Caught error after ${Date.now() - start}ms:`, err);
  }
}

testSignup();
