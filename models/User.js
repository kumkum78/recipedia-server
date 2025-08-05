const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileIcon: { type: String, default: null }, // Add profile icon field
  likedRecipes: [{ type: mongoose.Schema.Types.Mixed }], // Allow both ObjectIds and strings
  bookmarkedRecipes: [{ type: mongoose.Schema.Types.Mixed }], // Allow both ObjectIds and strings
  uploadedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  videoRecipeData: { type: mongoose.Schema.Types.Mixed, default: {} } // Store video recipe data
});

module.exports = mongoose.model('User', userSchema);