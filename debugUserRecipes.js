require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

async function debugUserRecipes() {
  try {
    console.log('🔍 Debugging User Recipes...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find user by email
    const user = await User.findOne({ email: 'ayushmiglani2004@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name);
    console.log('📧 Email:', user.email);
    
    // Check liked recipes
    console.log('\n❤️ Liked Recipes:');
    console.log('Count:', user.likedRecipes ? user.likedRecipes.length : 0);
    if (user.likedRecipes && user.likedRecipes.length > 0) {
      user.likedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. Type: ${typeof recipe}, Value:`, recipe);
        if (typeof recipe === 'object' && recipe !== null) {
          console.log(`     Keys:`, Object.keys(recipe));
          console.log(`     Title:`, recipe.title);
          console.log(`     Image:`, recipe.image);
        }
      });
    }
    
    // Check bookmarked recipes
    console.log('\n🔖 Bookmarked Recipes:');
    console.log('Count:', user.bookmarkedRecipes ? user.bookmarkedRecipes.length : 0);
    if (user.bookmarkedRecipes && user.bookmarkedRecipes.length > 0) {
      user.bookmarkedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. Type: ${typeof recipe}, Value:`, recipe);
        if (typeof recipe === 'object' && recipe !== null) {
          console.log(`     Keys:`, Object.keys(recipe));
          console.log(`     Title:`, recipe.title);
          console.log(`     Image:`, recipe.image);
        }
      });
    }
    
    // Check uploaded recipes
    console.log('\n📝 Uploaded Recipes:');
    console.log('Count:', user.uploadedRecipes ? user.uploadedRecipes.length : 0);
    if (user.uploadedRecipes && user.uploadedRecipes.length > 0) {
      user.uploadedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. Recipe ID:`, recipe);
      });
    }
    
    // Try to populate uploaded recipes
    console.log('\n🔍 Trying to populate uploaded recipes...');
    const populatedUser = await User.findById(user._id)
      .populate('uploadedRecipes')
      .select('-password');
    
    if (populatedUser.uploadedRecipes && populatedUser.uploadedRecipes.length > 0) {
      console.log('✅ Uploaded recipes populated successfully:');
      populatedUser.uploadedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. Title: ${recipe.title}, Image: ${recipe.image}`);
      });
    } else {
      console.log('❌ No uploaded recipes found or population failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugUserRecipes(); 