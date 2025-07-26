const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe
} = require('../controllers/recipeController');

router.get('/', getAllRecipes);
router.post('/', auth, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);

module.exports = router;