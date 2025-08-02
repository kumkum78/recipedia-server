require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testCurrentUser() {
  try {
    console.log('🔍 Testing Current User Profile...\n');
    
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
      });
    }
    
    // Check bookmarked recipes
    console.log('\n🔖 Bookmarked Recipes:');
    console.log('Count:', user.bookmarkedRecipes ? user.bookmarkedRecipes.length : 0);
    if (user.bookmarkedRecipes && user.bookmarkedRecipes.length > 0) {
      user.bookmarkedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. Type: ${typeof recipe}, Value:`, recipe);
      });
    }
    
    // Test fetching external recipe data
    console.log('\n🌐 Testing External Recipe Data Fetching...');
    
    // Test TheMealDB API for external_53060
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=53060');
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        console.log('✅ External recipe 53060 found:');
        console.log(`   Title: ${meal.strMeal}`);
        console.log(`   Category: ${meal.strCategory}`);
        console.log(`   Image: ${meal.strMealThumb}`);
      } else {
        console.log('❌ External recipe 53060 not found');
      }
    } catch (error) {
      console.log('❌ Error fetching external recipe 53060:', error.message);
    }
    
    // Test TheMealDB API for external_53065
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=53065');
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        console.log('✅ External recipe 53065 found:');
        console.log(`   Title: ${meal.strMeal}`);
        console.log(`   Category: ${meal.strCategory}`);
        console.log(`   Image: ${meal.strMealThumb}`);
      } else {
        console.log('❌ External recipe 53065 not found');
      }
    } catch (error) {
      console.log('❌ Error fetching external recipe 53065:', error.message);
    }
    
    console.log('\n🎉 Profile data test completed!');
    console.log('\nThe Profile component should now:');
    console.log('- Show actual recipe titles and images for external recipes');
    console.log('- Display proper descriptions and categories');
    console.log('- Handle both external and uploaded recipes correctly');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCurrentUser(); 