import express from "express";
import transferringTransactionCtrl from "../controllers/transferringTransactionController.js";
import { hasValidToken, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions/transferring", hasValidToken, isPropertyAdminUser, transferringTransactionCtrl.transferItems);
router.put("/transactions/denyTransfer", hasValidToken, isPropertyAdminUser, transferringTransactionCtrl.denyTransfer);

export default router;
