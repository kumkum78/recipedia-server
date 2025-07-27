const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.post('/like/:id', auth, userController.likeRecipe);
router.delete('/like/:id', auth, userController.unlikeRecipe);
router.post('/bookmark/:id', auth, userController.bookmarkRecipe);
router.delete('/bookmark/:id', auth, userController.unbookmarkRecipe);
router.post('/add-video-data', auth, userController.addVideoData);

module.exports = router;