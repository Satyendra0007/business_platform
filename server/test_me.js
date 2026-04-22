const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5004/api/auth/login', { email: 'harry@gmail.com', password: 'password123' });
    const token = loginRes.data.data.token;
    console.log('Login plan:', loginRes.data.data.plan);
    const meRes = await axios.get('http://localhost:5004/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Auth ME response:');
    console.log(JSON.stringify(meRes.data, null, 2));
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}
test();
