require('dotenv').config();
const mongoose = require('mongoose');
const PasswordReset = require('./models/PasswordReset');
const User = require('./models/User');
const crypto = require('crypto');

async function testResetPassword() {
  try {
    console.log('Testing reset password functionality...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get the latest reset token for test@example.com
    const resetRecord = await PasswordReset.findOne({ 
      email: 'test@example.com',
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!resetRecord) {
      console.log('❌ No valid reset token found');
      process.exit(1);
    }
    
    console.log('Found reset token:', resetRecord._id);
    console.log('Token expires at:', resetRecord.expiresAt);
    
    // For testing purposes, we'll create a mock token that matches the hash
    // In reality, this would come from the email
    const mockToken = crypto.randomBytes(32).toString('hex');
    const mockTokenHash = crypto.createHash('sha256').update(mockToken).digest('hex');
    
    // Update the reset record with our mock token hash for testing
    await PasswordReset.findByIdAndUpdate(resetRecord._id, { token: mockTokenHash });
    
    console.log('✅ Reset token prepared for testing');
    console.log('Mock token:', mockToken);
    console.log('You can now test the reset password flow with this token');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testResetPassword(); 