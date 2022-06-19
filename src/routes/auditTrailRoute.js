import express from "express";
import auditTrailCtrl from "../controllers/auditTrailController.js";
import { hasValidToken, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/auditTrail/validateTransactions", auditTrailCtrl.validateTransactions);
router.get("/auditTrail/compareTransactions/:transactionId", auditTrailCtrl.compareTransactions);
router.post("/auditTrail/restoreTransaction", hasValidToken, isPropertyAdminUser, auditTrailCtrl.restoreTransaction);

export default router;
