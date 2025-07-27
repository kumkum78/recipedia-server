const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const {
  getAllRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe, uploadImage
} = require('../controllers/recipeController');

router.get('/', getAllRecipes);
router.post('/', auth, createRecipe);
router.post('/upload-image', auth, upload.single('image'), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, uploadImage);
router.get('/:id', getRecipeById);
router.put('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);

module.exports = router;