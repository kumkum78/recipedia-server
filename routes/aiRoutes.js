const express = require('express');
const router = express.Router();
const { suggestDishes } = require('../controllers/aiController');

router.post('/suggest', suggestDishes);

module.exports = router;