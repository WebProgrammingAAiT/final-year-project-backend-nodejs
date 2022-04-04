import express from 'express';
import departmentCtrl from '../controllers/departmentController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/department',hasValidToken,isAdmin, departmentCtrl.addDepartment)

export default router;