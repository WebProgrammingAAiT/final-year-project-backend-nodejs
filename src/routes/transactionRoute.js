import express from 'express';
import transactionCtrl from '../controllers/transactionController.js';
import { hasValidToken,isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

//TODO: add property admin user check
router.post('/transactions/receiving',transactionCtrl.addReceivingTransaction);
router.get('/transactions/receiving',transactionCtrl.getReceivingTransactions);
//TODO: add department user check
router.post('/transactions/returning',transactionCtrl.addReturningTransaction);
router.get('/transactions/returning',transactionCtrl.getReturningTransactions);

router.get('/transactions/:id',transactionCtrl.getTransactionById);



export default router;