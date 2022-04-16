import express from "express";
import requestingTransactionCtrl from "../controllers/requestingTransactionController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

//TODO: add department user check
router.post("/transactions/requesting", requestingTransactionCtrl.requestItems);
router.get(
  "/transactions/requesting/pending",
  requestingTransactionCtrl.getPendingRequestingTransactions
);
router.get(
  "/transactions/requesting/approved",
  requestingTransactionCtrl.getApprovedRequestingTransactions
);
export default router;
