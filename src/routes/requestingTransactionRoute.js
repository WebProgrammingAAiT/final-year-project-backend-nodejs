import express from "express";
import requestingTransactionCtrl from "../controllers/requestingTransactionController.js";
import { hasValidToken, isDepartmentUser, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions/requesting", hasValidToken, isDepartmentUser, requestingTransactionCtrl.requestItems);
router.get(
  "/transactions/requesting/pending",
  hasValidToken,
  isPropertyAdminUser,
  requestingTransactionCtrl.getPendingRequestingTransactions
);
router.get(
  "/transactions/requesting/approved",
  hasValidToken,
  isPropertyAdminUser,
  requestingTransactionCtrl.getApprovedRequestingTransactions
);
export default router;
