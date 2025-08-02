require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    console.log('\nChecking for users in database...');
    const users = await User.find();
    console.log(`Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('\nUser details:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}`);
        console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      });
      
      // Test authentication with the first user
      const testUser = users[0];
      console.log(`\nTesting authentication for user: ${testUser.email}`);
      
      // Test with a common password
      const testPasswords = ['password', '123456', 'test', 'admin', 'user'];
      
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, testUser.password);
        console.log(`Testing password "${testPassword}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
      }
    } else {
      console.log('\nNo users found in database. You may need to register a user first.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers(); 