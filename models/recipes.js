import { Schema, model } from 'mongoose';
// const mongoose = require('mongoose');

const RecipeSchema=new Schema
  ({
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: "",
    },
    ingredients: {
      type: [String],
      required: true
    },
    steps: {
      type: [String],
      required: true,
    },
    tags: {
      type: [String],
      default: []
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

export default model('Recipe', RecipeSchema);
// module.exports = mongoose.model('Recipe', RecipeSchema);