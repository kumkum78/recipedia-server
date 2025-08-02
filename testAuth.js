const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication endpoint...');
    
    // Test login with correct credentials
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', loginResponse.data);
    
    // Test login with wrong password
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Wrong password correctly rejected');
      } else {
        console.log('❌ Unexpected error with wrong password:', error.message);
      }
    }
    
    // Test login with non-existent user
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Non-existent user correctly rejected');
      } else {
        console.log('❌ Unexpected error with non-existent user:', error.message);
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
    } else {
      console.log('❌ Error testing authentication:', error.message);
    }
  }
}

testAuth(); 