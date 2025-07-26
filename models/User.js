const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedRecipes: [{ type: mongoose.Schema.Types.Mixed }], // Allow both ObjectIds and strings
  bookmarkedRecipes: [{ type: mongoose.Schema.Types.Mixed }], // Allow both ObjectIds and strings
  uploadedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

module.exports = mongoose.model('User', userSchema);