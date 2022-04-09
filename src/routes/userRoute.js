import express from 'express';
import userCtrl from '../controllers/userController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.put('/user/changeDepartment',hasValidToken,isAdmin,userCtrl.changeDepartment);




export default router;