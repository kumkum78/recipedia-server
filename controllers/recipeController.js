const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.getAllRecipes = async (req, res) => {
  const recipes = await Recipe.find().populate('createdBy', 'name');
  res.json(recipes);
};

exports.createRecipe = async (req, res) => {
  try {
  const { title, description, ingredients, steps, image } = req.body;
  const recipe = await Recipe.create({
    title, description, ingredients, steps, image, createdBy: req.user._id
  });
    
    // Add recipe to user's uploadedRecipes array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedRecipes: recipe._id }
    });
    
  res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: "Failed to create recipe", error: error.message });
  }
};



exports.getRecipeById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json(recipe);
};

exports.updateRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  Object.assign(recipe, req.body);
  await recipe.save();
  res.json(recipe);
};

exports.deleteRecipe = async (req, res) => {
  try {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    
    // Check if the user is the creator of the recipe
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own recipes' });
    }
    
    // Remove recipe from user's uploadedRecipes array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { uploadedRecipes: recipe._id }
    });
    
    // Delete the recipe
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Image upload endpoint
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};