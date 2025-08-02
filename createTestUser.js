require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      process.exit(0);
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    // Verify the user was created
    const savedUser = await User.findOne({ email: 'test@example.com' });
    console.log('User saved with ID:', savedUser._id);
    
    // Test authentication
    const isMatch = await bcrypt.compare('password123', savedUser.password);
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 