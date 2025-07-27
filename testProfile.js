const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
require('dotenv').config();

async function testProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'kumkummotwani788@gmail.com' }).populate('uploadedRecipes');
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.name);
    console.log('User ID:', user._id);
    console.log('Uploaded recipes array:', user.uploadedRecipes);
    console.log('Uploaded recipes count:', user.uploadedRecipes ? user.uploadedRecipes.length : 0);

    // Check all recipes in the database
    const allRecipes = await Recipe.find();
    console.log('\nAll recipes in database:');
    allRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} (ID: ${recipe._id}) - Created by: ${recipe.createdBy}`);
    });

    // Check if any recipes are created by this user
    const userRecipes = await Recipe.find({ createdBy: user._id });
    console.log('\nRecipes created by this user:');
    userRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} (ID: ${recipe._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error testing profile:', error);
    process.exit(1);
  }
}

testProfile(); 