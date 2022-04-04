import express from 'express';
import authCtrl from '../controllers/authController.js';
import { signupValidator,signinValidator,isRequestValidated } from '../validators/authValidator.js';

const router = express.Router();

router.post('/signup',signupValidator,isRequestValidated,authCtrl.signup)
router.post('/login',signinValidator,isRequestValidated,authCtrl.signin)
router.post('/user/refreshToken',authCtrl.getUserAccessToken)
router.post('/user/logout', authCtrl.logout)


export default router;