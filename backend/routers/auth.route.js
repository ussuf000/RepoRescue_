import express from 'express'
import * as controller from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js';

const route=express.Router();

// auth route
route.post('/register',controller.userRegister);
route.post('/login',controller.userLogin);
route.get('/logout',authMiddleware,controller.userLogout)

export default route;