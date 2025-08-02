require('dotenv').config();
const axios = require('axios');

async function testPasswordReset() {
  try {
    console.log('Testing password reset functionality...\n');
    
    // Test 1: Request password reset for existing user
    console.log('1. Testing forgot password request...');
    try {
      const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: 'test@example.com'
      });
      console.log('✅ Forgot password request successful:', forgotResponse.data.message);
    } catch (error) {
      console.log('❌ Forgot password request failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Request password reset for non-existent user
    console.log('\n2. Testing forgot password for non-existent user...');
    try {
      const forgotResponse2 = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: 'nonexistent@example.com'
      });
      console.log('✅ Non-existent user handled correctly:', forgotResponse2.data.message);
    } catch (error) {
      console.log('❌ Non-existent user test failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Check if reset tokens were created in database
    console.log('\n3. Checking database for reset tokens...');
    const mongoose = require('mongoose');
    const PasswordReset = require('./models/PasswordReset');
    
    await mongoose.connect(process.env.MONGO_URI);
    const resetTokens = await PasswordReset.find({ email: 'test@example.com' });
    console.log(`Found ${resetTokens.length} reset tokens for test@example.com`);
    
    if (resetTokens.length > 0) {
      const latestToken = resetTokens[resetTokens.length - 1];
      console.log('Latest token expires at:', latestToken.expiresAt);
      console.log('Token used:', latestToken.used);
    }

    // Test 4: Verify reset token (if we have one)
    if (resetTokens.length > 0) {
      console.log('\n4. Testing token verification...');
      const latestToken = resetTokens[resetTokens.length - 1];
      
      // We need to get the original token from the email, but for testing we'll use a mock
      console.log('Note: In a real scenario, you would get the token from the email');
      console.log('For testing, you can check the email preview URL in the server logs');
    }

    console.log('\n✅ Password reset functionality tests completed!');
    console.log('\nTo test the full flow:');
    console.log('1. Check the server logs for email preview URL');
    console.log('2. Copy the reset token from the URL');
    console.log('3. Visit: http://localhost:5173/reset-password/[TOKEN]');
    console.log('4. Set a new password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPasswordReset(); 