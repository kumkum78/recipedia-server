const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, likeRecipe, bookmarkRecipe, unlikeRecipe, unbookmarkRecipe } = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.post('/like/:id', auth, likeRecipe);
router.delete('/like/:id', auth, unlikeRecipe);
router.post('/bookmark/:id', auth, bookmarkRecipe);
router.delete('/bookmark/:id', auth, unbookmarkRecipe);

module.exports = router;