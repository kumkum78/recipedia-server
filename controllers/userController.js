const User = require('../models/User');
const Recipe = require('../models/Recipe');
const axios = require('axios');

exports.getProfile = async (req, res) => {
  try {
  const user = await User.findById(req.user._id)
      .populate('uploadedRecipes')
      .populate('rooms');
    
    console.log("User found:", user.name);
    console.log("Uploaded recipes count:", user.uploadedRecipes ? user.uploadedRecipes.length : 0);
    console.log("Uploaded recipes:", user.uploadedRecipes);
    console.log("User videoRecipeData:", user.videoRecipeData);
    console.log("Liked recipes:", user.likedRecipes);
    console.log("Bookmarked recipes:", user.bookmarkedRecipes);
    
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
    
    // Static video recipes fallback (copied exactly from Vedios.jsx)
    const staticVideoRecipes = [
      {
        id: 1,
        category: 'Desserts',
        title: 'Molten Chocolate Lava Cake Dessert',
        image: '/images/recipe-6-630x785.jpg',
        rating: 4.9,
        time: '80 min',
        difficulty: 'Advanced',
        cuisine: 'Ethiopian',
        flag: '🇪🇹',
        liked: false,
        bookmarked: false,
      },
      {
        id: 2,
        category: 'Vegetarian',
        title: 'Spinach Ricotta Stuffed Vegan Pasta Shells',
        image: '/images/recipe-21-630x785.jpg',
        rating: 4.8,
        time: '25 min',
        difficulty: 'Expert',
        cuisine: 'Italian',
        flag: '🇮🇹',
        liked: false,
        bookmarked: false,
      },
      {
        id: 3,
        category: 'Desserts',
        title: 'Apple Crumble with Cinnamon Oat Topping',
        image: '/images/recipe-20-630x785.jpg',
        rating: 5.0,
        time: '35 min',
        difficulty: 'Easy',
        cuisine: 'Korean',
        flag: '🇰🇷',
        liked: false,
        bookmarked: false,
      },
      {
        id: 4,
        category: 'Pasta',
        title: 'Creamy Garlic Mushroom Penne Pasta',
        image: '/images/recipe-2-550x690.jpg',
        rating: 4.8,
        time: '35 min',
        difficulty: 'Intermediate',
        cuisine: 'Italian',
        flag: '🇮🇹',
        liked: false,
        bookmarked: false,
      },
      {
        id: 5,
        category: 'Healthy',
        title: 'Chickpea and Kale Salad with Lemon Dressing',
        image: '/images/recipe-18-630x785.jpg',
        rating: 4.6,
        time: '5 min',
        difficulty: 'Intermediate',
        cuisine: 'Spanish',
        flag: '🇪🇸',
        liked: false,
        bookmarked: false,
      },
      {
        id: 6,
        category: 'Breads',
        title: 'Savory Garlic Herb Butter Dinner Rolls',
        image: '/images/recipe-13-630x785.jpg',
        rating: 4.8,
        time: '85 min',
        difficulty: 'Beginner',
        cuisine: 'Mexican',
        flag: '🇲🇽',
        liked: false,
        bookmarked: false,
      },
      {
        id: 7,
        category: 'Salads',
        title: 'Asian Sesame Noodles with Crunchy Veggies',
        image: '/images/recipe-28-630x785.jpg',
        rating: 4.5,
        time: '60 min',
        difficulty: 'Beginner',
        cuisine: 'Moroccan',
        flag: '🇲🇦',
        liked: false,
        bookmarked: false,
      },
      {
        id: 8,
        category: 'Meat',
        title: 'Slow Cooker Beef and Black Bean Chili',
        image: '/images/recipe-35-630x785.jpg',
        rating: 4.5,
        time: '45 min',
        difficulty: 'Intermediate',
        cuisine: 'Turkish',
        flag: '🇹🇷',
        liked: false,
        bookmarked: false,
      },
    ];

    // Patch fetchExternalRecipeDetails to use fallback for missing video data
    const fetchExternalRecipeDetails = async (externalIds) => {
      console.log('fetchExternalRecipeDetails called with:', externalIds);
      const recipeDetails = [];
      for (const id of externalIds) {
        try {
          // Check if it's a video recipe
          if (id.startsWith('external_video_')) {
            console.log('Processing video recipe:', id);
            console.log('User videoRecipeData:', user.videoRecipeData);
            // For video recipes, get data from user's stored video recipe data
            let videoData = user.videoRecipeData?.[id] || {};
            // Fallback: if missing, use static list
            if (!videoData.title || !videoData.image) {
              const videoId = parseInt(id.replace('external_video_', ''));
              const fallback = staticVideoRecipes.find(v => v.id === videoId);
              if (fallback) {
                videoData = {
                  ...fallback,
                  title: fallback.title,
                  image: fallback.image,
                  category: fallback.category,
                  cuisine: fallback.cuisine,
                  description: `Video recipe: ${fallback.title} - ${fallback.category} cuisine`,
                  difficulty: fallback.difficulty,
                  time: fallback.time,
                  rating: fallback.rating,
                  source: 'Video Recipe',
                  strCategory: fallback.category,
                  strArea: fallback.cuisine,
                  strMeal: fallback.title,
                  strMealThumb: fallback.image
                };
              }
            }
            const videoId = id.replace('external_video_', '');
            recipeDetails.push({
              _id: id,
              title: videoData.title || `Video Recipe ${videoId}`,
              description: videoData.description || 'Video recipe from Recipedia',
              image: videoData.image || videoData.strMealThumb || null, // Use fallback if image is missing
              category: videoData.category || videoData.strCategory || 'Video',
              cuisine: videoData.cuisine || videoData.strArea || 'Video',
              source: videoData.source || 'Video Recipe',
              difficulty: videoData.difficulty,
              time: videoData.time,
              rating: videoData.rating
            });
            continue;
          }
          
          // Extract the actual recipe ID from external_ID format (TheMealDB)
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
    
    // Ensure all recipes have proper image paths
    const processRecipeImages = (recipes) => {
      return recipes.map(recipe => {
        if (recipe.image && !recipe.image.startsWith('http') && !recipe.image.startsWith('/uploads/') && !recipe.image.startsWith('/images/')) {
          // If it's a relative path that doesn't start with /uploads/ or /images/, 
          // it might be an uploaded image that needs the full path
          recipe.image = `/uploads/${recipe.image}`;
        }
        return recipe;
      });
    };
    
    const profile = {
      ...user.toObject(),
      likedRecipes: [...processRecipeImages(internalLikedRecipes), ...externalLikedRecipes],
      bookmarkedRecipes: [...processRecipeImages(internalBookmarkedRecipes), ...externalBookmarkedRecipes]
    };
    
    console.log('Final profile data being sent:', {
      likedRecipes: profile.likedRecipes.length,
      bookmarkedRecipes: profile.bookmarkedRecipes.length,
      videoRecipeData: user.videoRecipeData
    });
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeData } = req.body;
    console.log('=== LIKE RECIPE REQUEST ===');
    console.log('ID:', id);
    console.log('Recipe Data:', JSON.stringify(recipeData, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if it's an external recipe (TheMealDB or Video)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log('User found:', user.name);
      console.log('Current likedRecipes:', user.likedRecipes);
      console.log('Current videoRecipeData:', user.videoRecipeData);
  
      // Check if already liked
      if (user.likedRecipes.includes(id)) {
        console.log('Recipe already liked');
        return res.status(400).json({ message: "Recipe already liked" });
      }
  
      // Add to user's liked recipes
      user.likedRecipes.push(id);
      console.log('Added to likedRecipes:', user.likedRecipes);
      
      // Store recipe data for video recipes
      if (id.startsWith('external_video_') && recipeData) {
        console.log('=== STORING VIDEO RECIPE DATA ===');
        console.log('Video ID:', id);
        console.log('Recipe Data to store:', JSON.stringify(recipeData, null, 2));
        
        if (!user.videoRecipeData) {
          user.videoRecipeData = {};
          console.log('Initialized videoRecipeData');
        }
        
        // Store the complete recipe data (always overwrite with latest)
        user.videoRecipeData[id] = { ...recipeData };
        
        console.log('Updated videoRecipeData:', JSON.stringify(user.videoRecipeData, null, 2));
      } else {
        console.log('Not storing video recipe data. ID starts with external_video_:', id.startsWith('external_video_'));
        console.log('RecipeData exists:', !!recipeData);
        console.log('RecipeData content:', recipeData);
      }
      
      console.log('About to save user...');
      await user.save();
      console.log('User saved successfully!');
      console.log('Final videoRecipeData:', JSON.stringify(user.videoRecipeData, null, 2));
  
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
    console.error('=== LIKE RECIPE ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.bookmarkRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeData } = req.body;
    console.log('=== BOOKMARK RECIPE REQUEST ===');
    console.log('ID:', id);
    console.log('Recipe Data:', JSON.stringify(recipeData, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if it's an external recipe (TheMealDB or Video)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log('User found:', user.name);
      console.log('Current bookmarkedRecipes:', user.bookmarkedRecipes);
      console.log('Current videoRecipeData:', user.videoRecipeData);
  
      // Check if already bookmarked
      if (user.bookmarkedRecipes.includes(id)) {
        console.log('Recipe already bookmarked');
        return res.status(400).json({ message: "Recipe already bookmarked" });
      }
  
      // Add to user's bookmarked recipes
      user.bookmarkedRecipes.push(id);
      console.log('Added to bookmarkedRecipes:', user.bookmarkedRecipes);
      
      // Store recipe data for video recipes
      if (id.startsWith('external_video_') && recipeData) {
        console.log('=== STORING VIDEO RECIPE DATA ===');
        console.log('Video ID:', id);
        console.log('Recipe Data to store:', JSON.stringify(recipeData, null, 2));
        
        if (!user.videoRecipeData) {
          user.videoRecipeData = {};
          console.log('Initialized videoRecipeData');
        }
        
        // Store the complete recipe data (always overwrite with latest)
        user.videoRecipeData[id] = { ...recipeData };
        
        console.log('Updated videoRecipeData:', JSON.stringify(user.videoRecipeData, null, 2));
      } else {
        console.log('Not storing video recipe data. ID starts with external_video_:', id.startsWith('external_video_'));
        console.log('RecipeData exists:', !!recipeData);
        console.log('RecipeData content:', recipeData);
      }
      
      console.log('About to save user...');
      await user.save();
      console.log('User saved successfully!');
      console.log('Final videoRecipeData:', JSON.stringify(user.videoRecipeData, null, 2));
  
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
    console.error('=== BOOKMARK RECIPE ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.unlikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's an external recipe (TheMealDB or Video)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Remove from user's liked recipes
      user.likedRecipes = user.likedRecipes.filter(recipeId => recipeId !== id);
      
      // Remove video recipe data if it exists
      if (id.startsWith('external_video_') && user.videoRecipeData) {
        delete user.videoRecipeData[id];
      }
      
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
    
    // Check if it's an external recipe (TheMealDB or Video)
    if (id.startsWith('external_')) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Remove from user's bookmarked recipes
      user.bookmarkedRecipes = user.bookmarkedRecipes.filter(recipeId => recipeId !== id);
      
      // Remove video recipe data if it exists
      if (id.startsWith('external_video_') && user.videoRecipeData) {
        delete user.videoRecipeData[id];
      }
      
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

// Simple test function to add video recipe data
exports.addVideoData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add video recipe data for testing
    if (!user.videoRecipeData) {
      user.videoRecipeData = {};
    }

    const videoImageMap = {
      '1': '/images/recipe-6-630x785.jpg',
      '2': '/images/recipe-21-630x785.jpg',
      '3': '/images/recipe-20-630x785.jpg',
      '4': '/images/recipe-2-550x690.jpg',
      '5': '/images/recipe-18-630x785.jpg',
      '6': '/images/recipe-13-630x785.jpg',
      '7': '/images/recipe-28-630x785.jpg',
      '8': '/images/recipe-35-630x785.jpg'
    };
    const videoTitleMap = {
      '1': 'Molten Chocolate Lava Cake Dessert',
      '2': 'Spinach Ricotta Stuffed Vegan Pasta Shells',
      '3': 'Apple Crumble with Cinnamon Oat Topping',
      '4': 'Creamy Garlic Mushroom Penne Pasta',
      '5': 'Chickpea and Kale Salad with Lemon Dressing',
      '6': 'Savory Garlic Herb Butter Dinner Rolls',
      '7': 'Asian Sesame Noodles with Crunchy Veggies',
      '8': 'Slow Cooker Beef and Black Bean Chili'
    };
    const videoCategoryMap = {
      '1': 'Desserts',
      '2': 'Vegetarian',
      '3': 'Desserts',
      '4': 'Pasta',
      '5': 'Healthy',
      '6': 'Breads',
      '7': 'Salads',
      '8': 'Meat'
    };

    // Add data for all video recipes
    Object.keys(videoRecipesData).forEach(videoId => {
      if (!user.likedRecipes.includes(videoId)) {
        user.likedRecipes.push(videoId);
      }
    });

    await user.save();
    
    res.json({ 
      message: "Video data added successfully",
      videoRecipeData: user.videoRecipeData
    });
  } catch (error) {
    console.error('Add video data error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};