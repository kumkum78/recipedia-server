const mongoose = require('mongoose');

const mealSuggestionSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  date: String, // e.g., '2024-07-25'
  breakfast: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, dish: String }],
  lunch: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, dish: String }],
  snacks: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, dish: String }],
  dinner: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, dish: String }]
});

module.exports = mongoose.model('MealSuggestion', mealSuggestionSchema);