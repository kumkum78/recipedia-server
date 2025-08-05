const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.get('/profile', auth, userController.getProfile);
router.post('/like/:id', auth, userController.likeRecipe);
router.delete('/like/:id', auth, userController.unlikeRecipe);
router.post('/bookmark/:id', auth, userController.bookmarkRecipe);
router.delete('/bookmark/:id', auth, userController.unbookmarkRecipe);
router.post('/add-video-data', auth, userController.addVideoData);

// Profile image upload endpoint
router.post('/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile picture path
    user.profilePicture = `/uploads/profile-images/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: 'Profile image updated successfully',
      imageUrl: user.profilePicture
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/liked-recipes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedRecipes')
      .exec();
    res.json(user.likedRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bookmarked-recipes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedRecipes')
      .exec();
    res.json(user.bookmarkedRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;