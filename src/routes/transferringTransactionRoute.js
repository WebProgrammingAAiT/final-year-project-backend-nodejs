import express from 'express';
import transferringTransactionCtrl from '../controllers/transferringTransactionController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

//TODO: add property admin user check
router.post('/transactions/transferring',transferringTransactionCtrl.transferItems);




export default router;