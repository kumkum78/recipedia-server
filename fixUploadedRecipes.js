const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
require('dotenv').config();

async function fixUploadedRecipes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all recipes
    const recipes = await Recipe.find().populate('createdBy');
    console.log(`Found ${recipes.length} recipes`);

    // For each recipe, ensure it's in the creator's uploadedRecipes array
    for (const recipe of recipes) {
      if (recipe.createdBy) {
        const user = await User.findById(recipe.createdBy._id);
        if (user && !user.uploadedRecipes.includes(recipe._id)) {
          user.uploadedRecipes.push(recipe._id);
          await user.save();
          console.log(`Added recipe "${recipe.title}" to user "${user.name}" uploaded recipes`);
        }
      }
    }

    console.log('Fixed uploaded recipes for all users');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing uploaded recipes:', error);
    process.exit(1);
  }
}

fixUploadedRecipes(); 