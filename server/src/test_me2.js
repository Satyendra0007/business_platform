const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./modules/user/user.model.js');
  
  const user = await User.findOne({ email: 'harry@gmail.com' });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'tradafy_super_secret_fallback', { expiresIn: '30d' });

  try {
    const meRes = await axios.get('http://localhost:5004/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Auth ME response:');
    console.log(JSON.stringify(meRes.data, null, 2));
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
  process.exit(0);
}
test();
