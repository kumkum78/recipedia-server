const User = require('../models/User');
const Recipe = require('../models/Recipe');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('uploadedRecipes')
      .populate('likedRecipes')
      .populate('bookmarkedRecipes')
      .populate('rooms');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeData } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.likedRecipes.includes(id)) {
      user.likedRecipes.push(id);
      
      // Store video recipe data if it's a video recipe
      if (id.startsWith('external_video_') && recipeData) {
        const videoId = id.replace('external_video_', '');
        if (!user.videoRecipeData) {
          user.videoRecipeData = {};
        }
        user.videoRecipeData[videoId] = recipeData;
      }
      
      await user.save();
    }
    
    res.json({ message: 'Recipe liked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unlikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    user.likedRecipes = user.likedRecipes.filter(recipeId => recipeId.toString() !== id);
    
    // Remove video recipe data if it's a video recipe and not bookmarked
    if (id.startsWith('external_video_')) {
      const videoId = id.replace('external_video_', '');
      if (user.videoRecipeData && user.videoRecipeData[videoId]) {
        // Only remove if not bookmarked
        if (!user.bookmarkedRecipes.includes(id)) {
          delete user.videoRecipeData[videoId];
        }
      }
    }
    
    await user.save();
    
    res.json({ message: 'Recipe unliked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bookmarkRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeData } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.bookmarkedRecipes.includes(id)) {
      user.bookmarkedRecipes.push(id);
      
      // Store video recipe data if it's a video recipe
      if (id.startsWith('external_video_') && recipeData) {
        const videoId = id.replace('external_video_', '');
        if (!user.videoRecipeData) {
          user.videoRecipeData = {};
        }
        user.videoRecipeData[videoId] = recipeData;
      }
      
      await user.save();
    }
    
    res.json({ message: 'Recipe bookmarked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unbookmarkRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    user.bookmarkedRecipes = user.bookmarkedRecipes.filter(recipeId => recipeId.toString() !== id);
    
    // Remove video recipe data if it's a video recipe and not liked
    if (id.startsWith('external_video_')) {
      const videoId = id.replace('external_video_', '');
      if (user.videoRecipeData && user.videoRecipeData[videoId]) {
        // Only remove if not liked
        if (!user.likedRecipes.includes(id)) {
          delete user.videoRecipeData[videoId];
        }
      }
    }
    
    await user.save();
    
    res.json({ message: 'Recipe unbookmarked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addVideoData = async (req, res) => {
  try {
    const { videoData } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.videoRecipeData) {
      user.videoRecipeData = {};
    }
    
    user.videoRecipeData = { ...user.videoRecipeData, ...videoData };
    await user.save();
    
    res.json({ message: 'Video data added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

