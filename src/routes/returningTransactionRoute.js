import express from "express";
import returningTransactionCtrl from "../controllers/returningTransactionController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

//TODO: add department user check
router.post("/transactions/returning", returningTransactionCtrl.returnItems);
router.post("/transactions/returning/accept", returningTransactionCtrl.acceptReturnedItems);

export default router;
