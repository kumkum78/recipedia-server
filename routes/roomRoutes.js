const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createRoom, joinRoom, getRoom, getRoomSuggestions, addMealSuggestion, createInvite, joinByInvite, getRoomInvites, addRecipeToRoom, removeMemberFromRoom, getUserRooms } = require('../controllers/roomController');

router.get('/', auth, getUserRooms);
router.post('/', auth, createRoom);
router.get('/:id', auth, getRoom);
router.post('/join/:id', auth, joinRoom);
router.get('/:id/suggestions', auth, getRoomSuggestions);
router.post('/:id/suggestions', auth, addMealSuggestion);

// Invite routes
router.post('/:id/invite', auth, createInvite);
router.get('/:id/invites', auth, getRoomInvites);
router.post('/join/invite/:inviteCode', auth, joinByInvite);

// Recipe and member management routes
router.post('/:id/recipes', auth, addRecipeToRoom);
router.delete('/:id/members', auth, removeMemberFromRoom);

module.exports = router;