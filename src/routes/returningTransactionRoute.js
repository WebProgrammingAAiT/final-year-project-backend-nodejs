import express from "express";
import returningTransactionCtrl from "../controllers/returningTransactionController.js";
import { hasValidToken, isDepartmentUser, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions/returning", hasValidToken, isDepartmentUser, returningTransactionCtrl.returnItems);
router.post("/transactions/returning/accept", hasValidToken, isPropertyAdminUser, returningTransactionCtrl.acceptReturnedItems);

export default router;
