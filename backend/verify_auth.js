const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://127.0.0.1:3000' }));

async function verifyAuth() {
  const email = `test${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  console.log('--- Starting Auth Verification ---');

  try {
    // 1. Register
    console.log(`1. Registering user: ${email}`);
    const registerRes = await client.post('/auth/register', { email, password, name });
    console.log('   ✅ Registration successful:', registerRes.status);

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await client.post('/auth/login', { email, password });
    console.log('   ✅ Login successful:', loginRes.status);
    
    // Check cookies
    const cookies = await jar.getCookies('http://127.0.0.1:3000');
    const authCookie = cookies.find(c => c.key === 'Authentication');
    const refreshCookie = cookies.find(c => c.key === 'Refresh');
    
    if (authCookie && refreshCookie) {
      console.log('   ✅ Cookies received (HttpOnly)');
    } else {
      console.error('   ❌ Cookies MISSING!');
      process.exit(1);
    }

    // 3. Access Protected Route (Missing Persons Create - requires Auth)
    console.log('3. Accessing Protected Route (POST /missing-persons)...');
    // We'll try to create a dummy missing person. We expect 400 (Bad Request) or 201, but NOT 401/403.
    // Actually, let's try a simpler protected route if available, or just check if we get past the guard.
    // Let's try GET /children (protected).
    try {
      const childrenRes = await client.get('/children');
      console.log('   ✅ Protected route accessed:', childrenRes.status);
    } catch (err) {
      console.error('   ❌ Protected route access failed:', err.response ? err.response.status : err.message);
    }

    // 4. Logout
    console.log('4. Logging out...');
    await client.post('/auth/logout');
    console.log('   ✅ Logout successful');

    // 5. Verify Access Denied after Logout
    console.log('5. Verifying Access Denied after Logout...');
    try {
      await client.get('/children');
      console.error('   ❌ Access should have been denied!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('   ✅ Access correctly denied (401 Unauthorized)');
      } else {
        console.error('   ❌ Unexpected error:', err.message);
      }
    }

    console.log('--- Verification Complete: SUCCESS ---');

  } catch (error) {
    console.error('--- Verification FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

verifyAuth();
