import express from "express";
import transactionCtrl from "../controllers/transactionController.js";

const router = express.Router();

router.get("/transactions/:id", transactionCtrl.getTransactionById);

export default router;
