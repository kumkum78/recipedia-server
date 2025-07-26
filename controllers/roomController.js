const Room = require('../models/Room');
const MealSuggestion = require('../models/MealSuggestion');
const Invite = require('../models/Invite');
const crypto = require('crypto');

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'name email')
      .populate('recipes', 'title description');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  const { name } = req.body;
  const room = await Room.create({ name, members: [req.user._id] });
  req.user.rooms.push(room._id);
  await req.user.save();
  res.status(201).json(room);
};

exports.joinRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!room.members.includes(req.user._id)) {
    room.members.push(req.user._id);
    await room.save();
    req.user.rooms.push(room._id);
    await req.user.save();
  }
  res.json(room);
};

exports.getRoomSuggestions = async (req, res) => {
  try {
  const { id } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);
    
  let suggestion = await MealSuggestion.findOne({ room: id, date });
  if (!suggestion) {
    suggestion = await MealSuggestion.create({ room: id, date });
  }
    
    // Populate user info before sending response
    await suggestion.populate('breakfast.user', 'name');
    await suggestion.populate('lunch.user', 'name');
    await suggestion.populate('snacks.user', 'name');
    await suggestion.populate('dinner.user', 'name');
    
  res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addMealSuggestion = async (req, res) => {
  try {
  const { id } = req.params;
    const { meal, dish, date } = req.body; // Frontend sends 'meal' not 'mealType'
    const suggestionDate = date || new Date().toISOString().slice(0, 10);
    
    let suggestion = await MealSuggestion.findOne({ room: id, date: suggestionDate });
  if (!suggestion) {
      suggestion = await MealSuggestion.create({ room: id, date: suggestionDate });
  }
    
    suggestion[meal].push({ user: req.user._id, dish });
  await suggestion.save();
    
    // Populate user info before sending response
    await suggestion.populate('breakfast.user', 'name');
    await suggestion.populate('lunch.user', 'name');
    await suggestion.populate('snacks.user', 'name');
    await suggestion.populate('dinner.user', 'name');
    
  res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate a unique invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

exports.createInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of the room to create invites' });
    }
    
    // Generate unique invite code
    let inviteCode;
    let invite;
    do {
      inviteCode = generateInviteCode();
      invite = await Invite.findOne({ inviteCode });
    } while (invite);
    
    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const newInvite = await Invite.create({
      room: id,
      createdBy: req.user._id,
      inviteCode,
      expiresAt
    });
    
    res.json({ 
      message: 'Invite created successfully',
      inviteCode,
      expiresAt: newInvite.expiresAt,
      inviteUrl: `${req.protocol}://${req.get('host')}/rooms/join/${inviteCode}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.joinByInvite = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    
    const invite = await Invite.findOne({ inviteCode })
      .populate('room')
      .populate('createdBy', 'name');
    
    if (!invite) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    
    if (invite.used) {
      return res.status(400).json({ message: 'This invite has already been used' });
    }
    
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ message: 'This invite has expired' });
    }
    
    const room = invite.room;
    
    // Check if user is already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this room' });
    }
    
    // Add user to room
    room.members.push(req.user._id);
    await room.save();
    
    // Add room to user's rooms
    req.user.rooms.push(room._id);
    await req.user.save();
    
    // Mark invite as used
    invite.used = true;
    invite.usedBy = req.user._id;
    await invite.save();
    
    res.json({ 
      message: 'Successfully joined room',
      room: {
        _id: room._id,
        name: room.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRoomInvites = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of the room to view invites' });
    }
    
    const invites = await Invite.find({ room: id })
      .populate('createdBy', 'name')
      .populate('usedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addRecipeToRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, steps, image } = req.body;
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of the room to add recipes' });
    }
    
    // Create the recipe
    const Recipe = require('../models/Recipe');
    const recipe = await Recipe.create({
      title,
      description,
      ingredients,
      steps,
      image,
      createdBy: req.user._id,
      room: id
    });
    
    // Add recipe to room
    room.recipes.push(recipe._id);
    await room.save();
    
    // Add recipe to user's uploaded recipes
    req.user.uploadedRecipes.push(recipe._id);
    await req.user.save();
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('recipe-added', {
        roomId: id,
        recipe: recipe
      });
    }
    
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeMemberFromRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is the room creator (admin)
    if (room.members[0].toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can remove members' });
    }
    
    // Check if trying to remove the creator
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself from the room' });
    }
    
    // Remove member from room
    room.members = room.members.filter(member => member.toString() !== memberId);
    await room.save();
    
    // Remove room from member's rooms
    const User = require('../models/User');
    await User.findByIdAndUpdate(memberId, {
      $pull: { rooms: id }
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};