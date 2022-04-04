import express from 'express';
import authCtrl from '../controllers/authController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";

import { signupValidator,signinValidator,isRequestValidated } from '../validators/authValidator.js';

const router = express.Router();

//signup(creating accounts) is only for admin
router.post('/signup',hasValidToken,isAdmin, signupValidator,isRequestValidated,authCtrl.signup)
router.post('/login',signinValidator,isRequestValidated,authCtrl.signin)
router.post('/user/refreshToken',authCtrl.getUserAccessToken)
router.post('/user/logout', authCtrl.logout)


export default router;