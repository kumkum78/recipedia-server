const Room = require('../models/Room');
const MealSuggestion = require('../models/MealSuggestion');
const Invite = require('../models/Invite');
const User = require('../models/User');
const crypto = require('crypto');

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'name email')
      .populate({
        path: 'recipes',
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all rooms for the current user
exports.getUserRooms = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('rooms');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Populate room details
    const populatedRooms = await Room.find({ _id: { $in: user.rooms } })
      .populate('members', 'name email')
      .populate({
        path: 'recipes',
        populate: {
          path: 'createdBy',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(populatedRooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Room name is required' });
    }
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create the room
    const room = await Room.create({ 
      name: name.trim(), 
      members: [user._id] 
    });
    
    // Add room to user's rooms
    user.rooms.push(room._id);
    await user.save();
    
    // Return the created room with populated data
    const populatedRoom = await Room.findById(room._id).populate('members', 'name email');
    
    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    console.log('Attempting to join room with ID:', roomId);
    
    // Validate room ID format
    if (!roomId || roomId.length !== 24) {
      console.log('Invalid room ID format. Expected 24 characters, got:', roomId?.length || 0);
      return res.status(400).json({ 
        message: 'Invalid room ID format. Room ID must be 24 characters long.',
        providedId: roomId,
        expectedLength: 24,
        actualLength: roomId?.length || 0
      });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      console.log('Room not found with ID:', roomId);
      return res.status(404).json({ message: 'Room not found' });
    }
    
    console.log('Room found:', room.name, 'with ID:', room._id);
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.name, 'with ID:', user._id);
    
    if (room.members.includes(user._id)) {
      console.log('User is already a member of this room');
      return res.status(400).json({ message: 'You are already a member of this room' });
    }
    
    // Add user to room
    room.members.push(user._id);
    await room.save();
    console.log('User added to room members');
    
    // Add room to user's rooms
    user.rooms.push(room._id);
    await user.save();
    console.log('Room added to user\'s rooms');
    
    // Return the updated room with populated data
    const populatedRoom = await Room.findById(room._id).populate('members', 'name email');
    
    console.log('Successfully joined room:', room.name);
    res.json(populatedRoom);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Failed to join room', error: error.message });
  }
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
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let suggestion = await MealSuggestion.findOne({ room: id, date: suggestionDate });
    if (!suggestion) {
      suggestion = await MealSuggestion.create({ room: id, date: suggestionDate });
    }
    
    suggestion[meal].push({ user: user._id, dish });
    await suggestion.save();
    
    // Populate user info before sending response
    await suggestion.populate('breakfast.user', 'name');
    await suggestion.populate('lunch.user', 'name');
    await suggestion.populate('snacks.user', 'name');
    await suggestion.populate('dinner.user', 'name');
    
    res.json(suggestion);
  } catch (error) {
    console.error('Add meal suggestion error:', error);
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
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(user._id)) {
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
      createdBy: user._id,
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
    console.error('Create invite error:', error);
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
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already a member
    if (room.members.includes(user._id)) {
      return res.status(400).json({ message: 'You are already a member of this room' });
    }
    
    // Add user to room
    room.members.push(user._id);
    await room.save();
    
    // Add room to user's rooms
    user.rooms.push(room._id);
    await user.save();
    
    // Mark invite as used
    invite.used = true;
    invite.usedBy = user._id;
    await invite.save();
    
    res.json({ 
      message: 'Successfully joined room',
      room: {
        _id: room._id,
        name: room.name
      }
    });
  } catch (error) {
    console.error('Join by invite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRoomInvites = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(user._id)) {
      return res.status(403).json({ message: 'You must be a member of the room to view invites' });
    }
    
    const invites = await Invite.find({ room: id })
      .populate('createdBy', 'name')
      .populate('usedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(invites);
  } catch (error) {
    console.error('Get room invites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addRecipeToRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, steps, image } = req.body;
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(user._id)) {
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
      createdBy: user._id,
      room: id
    });
    
    // Add recipe to room
    room.recipes.push(recipe._id);
    await room.save();
    
    // Add recipe to user's uploaded recipes
    user.uploadedRecipes.push(recipe._id);
    await user.save();
    
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
    console.error('Add recipe to room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeMemberFromRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is the room creator (admin)
    if (room.members[0].toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can remove members' });
    }
    
    // Check if trying to remove the creator
    if (memberId === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself from the room' });
    }
    
    // Remove member from room
    room.members = room.members.filter(member => member.toString() !== memberId);
    await room.save();
    
    // Remove room from member's rooms
    await User.findByIdAndUpdate(memberId, {
      $pull: { rooms: id }
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member from room error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};