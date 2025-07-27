// const route = require('express').Router();
// const {userRegister, userLogin, getMe} = require('../controllers/userController.js');

import express from 'express';
import { userRegister, userLogin, getMe } from '../controllers/userController.js';

const route = express.Router();

route.post('/register', userRegister);
route.post('/login', userLogin);
route.get('/me/:id', getMe);

export default route;
// module.exports = route;