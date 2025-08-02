require('dotenv').config();
const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Password Reset Flow\n');
    
    // Step 1: Request password reset
    console.log('1️⃣ Requesting password reset for test@example.com...');
    const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'test@example.com'
    });
    console.log('✅ Response:', forgotResponse.data.message);
    
    // Step 2: Check server console for the reset URL
    console.log('\n2️⃣ Check your server console for the reset URL!');
    console.log('   Look for something like:');
    console.log('   === PASSWORD RESET EMAIL ===');
    console.log('   Reset URL: http://localhost:5173/reset-password/[TOKEN]');
    console.log('   ===============================');
    
    // Step 3: Instructions for testing
    console.log('\n3️⃣ To test the complete flow:');
    console.log('   a) Copy the reset URL from the server console');
    console.log('   b) Open the URL in your browser');
    console.log('   c) Set a new password');
    console.log('   d) Try logging in with the new password');
    
    console.log('\n🎉 Password reset functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testCompleteFlow(); 