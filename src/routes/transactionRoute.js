import express from "express";
import transactionCtrl from "../controllers/transactionController.js";

const router = express.Router();

router.get("/transactions", transactionCtrl.getTransactions);
router.get("/transactions/:id", transactionCtrl.getTransactionById);
router.get("/transactions/byReceiptNumber/:receiptNumber", transactionCtrl.getTransactionByReceiptNumber);

export default router;
