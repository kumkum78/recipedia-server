import mongoose from 'mongoose';
// const mongoose = require('mongoose');

const UserSchema=new mongoose.Schema
  ({
    username: {
      type: String,
      required: true,
      unique:true 
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

export default mongoose.model('User',UserSchema);
// module.exports = mongoose.model('User', UserSchema);