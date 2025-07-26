const User = require('../models/User');
const Recipe = require('../models/Recipe');
const axios = require('axios');

exports.getProfile = async (req, res) => {
  try {
  const user = await User.findById(req.user._id)
      .populate('uploadedRecipes')
      .populate('rooms');
    
    // Handle mixed types for liked and bookmarked recipes
    const likedRecipes = user.likedRecipes || [];
    const bookmarkedRecipes = user.bookmarkedRecipes || [];
    
    // Filter out external recipes and populate internal ones
    const externalLiked = likedRecipes.filter(id => typeof id === 'string' && id.startsWith('external_'));
    const internalLikedIds = likedRecipes.filter(id => typeof id === 'object' || (typeof id === 'string' && !id.startsWith('external_')));
    
    const externalBookmarked = bookmarkedRecipes.filter(id => typeof id === 'string' && id.startsWith('external_'));
    const internalBookmarkedIds = bookmarkedRecipes.filter(id => typeof id === 'object' || (typeof id === 'string' && !id.startsWith('external_')));
    
    // Populate internal recipes
    const internalLikedRecipes = await Recipe.find({ _id: { $in: internalLikedIds } });
    const internalBookmarkedRecipes = await Recipe.find({ _id: { $in: internalBookmarkedIds } });
    
    // Fetch external recipe details from TheMealDB
    const fetchExternalRecipeDetails = async (externalIds) => {
      const recipeDetails = [];
      for (const id of externalIds) {
        try {
          // Extract the actual recipe ID from external_ID format
          const recipeId = id.replace('external_', '');
          const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
          
          if (response.data.meals && response.data.meals.length > 0) {
            const meal = response.data.meals[0];
            recipeDetails.push({
              _id: id,
              title: meal.strMeal,
              description: meal.strInstructions ? meal.strInstructions.substring(0, 100) + '...' : 'A delicious recipe from TheMealDB',
              image: meal.strMealThumb,
              category: meal.strCategory,
              cuisine: meal.strArea
            });
          } else {
            // Fallback if recipe not found
            recipeDetails.push({
              _id: id,
              title: `Recipe ${recipeId}`,
              description: 'Recipe from TheMealDB',
              image: null,
              category: 'Unknown',
              cuisine: 'Unknown'
            });
          }
        } catch (error) {
          console.error(`Failed to fetch recipe ${id}:`, error.message);
          // Fallback for failed requests
          recipeDetails.push({
            _id: id,
            title: `Recipe ${id.replace('external_', '')}`,
            description: 'Recipe from TheMealDB',
            image: null,
            category: 'Unknown',
            cuisine: 'Unknown'
          });
        }
      }
      return recipeDetails;
    };

    // Fetch external recipe details
    const externalLikedRecipes = await fetchExternalRecipeDetails(externalLiked);
    const externalBookmarkedRecipes = await fetchExternalRecipeDetails(externalBookmarked);
    
    const profile = {
      ...user.toObject(),
      likedRecipes: [...internalLikedRecipes, ...externalLikedRecipes],
      bookmarkedRecipes: [...internalBookmarkedRecipes, ...externalBookmarkedRecipes]
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Like recipe request:', { id, userId: req.user._id });
    
    // Check if it's an external recipe (TheMealDB)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if already liked
      if (user.likedRecipes.includes(id)) {
        return res.status(400).json({ message: "Recipe already liked" });
      }
  
      // Add to user's liked recipes
      user.likedRecipes.push(id);
      await user.save();
  
      res.json({ message: "External recipe liked successfully" });
      return;
    }
    
    const recipe = await Recipe.findById(id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

  if (!recipe.likes.includes(req.user._id)) {
    recipe.likes.push(req.user._id);
    await recipe.save();
    req.user.likedRecipes.push(recipe._id);
    await req.user.save();
  }
  res.json(recipe);
  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.bookmarkRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Bookmark recipe request:', { id, userId: req.user._id });
    
    // Check if it's an external recipe (TheMealDB)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if already bookmarked
      if (user.bookmarkedRecipes.includes(id)) {
        return res.status(400).json({ message: "Recipe already bookmarked" });
      }
  
      // Add to user's bookmarked recipes
      user.bookmarkedRecipes.push(id);
      await user.save();
  
      res.json({ message: "External recipe bookmarked successfully" });
      return;
    }
    
    const recipe = await Recipe.findById(id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

  if (!recipe.bookmarks.includes(req.user._id)) {
    recipe.bookmarks.push(req.user._id);
    await recipe.save();
    req.user.bookmarkedRecipes.push(recipe._id);
    await req.user.save();
  }
  res.json(recipe);
  } catch (error) {
    console.error('Bookmark recipe error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.unlikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's an external recipe (TheMealDB)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Remove from user's liked recipes
      user.likedRecipes = user.likedRecipes.filter(recipeId => recipeId !== id);
      await user.save();
  
      res.json({ message: "External recipe unliked successfully" });
      return;
    }
    
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Remove user from recipe's likes
    recipe.likes = recipe.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await recipe.save();
    
    // Remove recipe from user's liked recipes
    req.user.likedRecipes = req.user.likedRecipes.filter(recipeId => recipeId.toString() !== id);
    await req.user.save();
    
    res.json({ message: "Recipe unliked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.unbookmarkRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's an external recipe (TheMealDB)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Remove from user's bookmarked recipes
      user.bookmarkedRecipes = user.bookmarkedRecipes.filter(recipeId => recipeId !== id);
      await user.save();
  
      res.json({ message: "External recipe unbookmarked successfully" });
      return;
    }
    
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Remove user from recipe's bookmarks
    recipe.bookmarks = recipe.bookmarks.filter(userId => userId.toString() !== req.user._id.toString());
    await recipe.save();
    
    // Remove recipe from user's bookmarked recipes
    const user = await User.findById(req.user._id);
    user.bookmarkedRecipes = user.bookmarkedRecipes.filter(recipeId => recipeId.toString() !== id);
    await user.save();
    
    res.json({ message: "Recipe unbookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};