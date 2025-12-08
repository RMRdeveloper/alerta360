const axios = require('axios');

async function verifyPublicAccess() {
  console.log('--- Starting Public Access Verification ---');
  const baseURL = 'http://127.0.0.1:3000';

  try {
    // 1. Verify Missing Persons List (Public)
    console.log('1. Checking GET /missing-persons (Public)...');
    try {
      const missingRes = await axios.get(`${baseURL}/missing-persons`);
      console.log('   ✅ Access successful:', missingRes.status);
      console.log('   ℹ️  Count:', missingRes.data.length);
    } catch (err) {
      console.error('   ❌ Access FAILED:', err.response ? err.response.status : err.message);
    }

    // 2. Verify Stats (Public)
    console.log('2. Checking GET /stats (Public)...');
    try {
      const statsRes = await axios.get(`${baseURL}/stats`);
      console.log('   ✅ Access successful:', statsRes.status);
      console.log('   ℹ️  Data:', JSON.stringify(statsRes.data));
    } catch (err) {
      console.error('   ❌ Access FAILED:', err.response ? err.response.status : err.message);
    }

    console.log('--- Verification Complete ---');

  } catch (error) {
    console.error('--- Verification Script Error ---');
    console.error(error);
  }
}

verifyPublicAccess();
