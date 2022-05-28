import express from "express";
import auditTrailCtrl from "../controllers/auditTrailController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/auditTrail/validateTransactions", auditTrailCtrl.validateTransactions);
router.get("/auditTrail/compareTransactions/:transactionId", auditTrailCtrl.compareTransactions);

export default router;
