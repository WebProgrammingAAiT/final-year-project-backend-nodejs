import express from "express";
import returningTransactionCtrl from "../controllers/returningTransactionController.js";
import { hasValidToken, isDepartmentUser, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions/returning", hasValidToken, isDepartmentUser, returningTransactionCtrl.returnItems);
router.get(
  "/transactions/returning/pending",
  hasValidToken,
  isPropertyAdminUser,
  returningTransactionCtrl.getPendingReturningTransactionsGroupedByDepartments
);
router.get(
  "/transactions/returning/pending/departments/:departmentId",
  hasValidToken,
  isPropertyAdminUser,
  returningTransactionCtrl.getPendingReturningTransactionsForDepartment
);
router.post("/transactions/returning/accept", hasValidToken, isPropertyAdminUser, returningTransactionCtrl.acceptReturnedItems);
router.put("/transactions/returning/deny", hasValidToken, isPropertyAdminUser, returningTransactionCtrl.denyReturnedItems);

export default router;
