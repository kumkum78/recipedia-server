require('dotenv').config();
const axios = require('axios');

async function testProfileDisplay() {
  try {
    console.log('🧪 Testing Profile Display...\n');
    
    // First, login to get a token
    console.log('1️⃣ Logging in to get token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ayushmiglani2004@gmail.com',
      password: 'password123' // Use the test password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test profile endpoint
    console.log('\n2️⃣ Testing profile endpoint...');
    const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile data received');
    console.log('User:', profileResponse.data.name);
    console.log('Email:', profileResponse.data.email);
    console.log('Liked recipes count:', profileResponse.data.likedRecipes ? profileResponse.data.likedRecipes.length : 0);
    console.log('Bookmarked recipes count:', profileResponse.data.bookmarkedRecipes ? profileResponse.data.bookmarkedRecipes.length : 0);
    console.log('Uploaded recipes count:', profileResponse.data.uploadedRecipes ? profileResponse.data.uploadedRecipes.length : 0);
    
    // Show liked recipes details
    if (profileResponse.data.likedRecipes && profileResponse.data.likedRecipes.length > 0) {
      console.log('\n❤️ Liked Recipes:');
      profileResponse.data.likedRecipes.forEach((recipe, index) => {
        if (typeof recipe === 'string') {
          console.log(`  ${index + 1}. String ID: ${recipe}`);
        } else {
          console.log(`  ${index + 1}. Recipe: ${recipe.title || 'No title'}`);
        }
      });
    }
    
    // Show bookmarked recipes details
    if (profileResponse.data.bookmarkedRecipes && profileResponse.data.bookmarkedRecipes.length > 0) {
      console.log('\n🔖 Bookmarked Recipes:');
      profileResponse.data.bookmarkedRecipes.forEach((recipe, index) => {
        if (typeof recipe === 'string') {
          console.log(`  ${index + 1}. String ID: ${recipe}`);
        } else {
          console.log(`  ${index + 1}. Recipe: ${recipe.title || 'No title'}`);
        }
      });
    }
    
    console.log('\n🎉 Profile display test completed!');
    console.log('\nThe Profile component should now show:');
    console.log('- String IDs for external recipes (with placeholder text)');
    console.log('- Proper recipe data for uploaded recipes');
    console.log('- Working like/unlike and bookmark/unbookmark buttons');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testProfileDisplay(); 