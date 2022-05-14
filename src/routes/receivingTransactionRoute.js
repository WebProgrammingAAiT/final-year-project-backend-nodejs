import express from "express";
import receivingTransactionCtrl from "../controllers/receivingTransactionController.js";
import { hasValidToken, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/transactions/receiving/PO", hasValidToken, isPropertyAdminUser, receivingTransactionCtrl.addItemToSubinventoryPO);
router.post(
  "/transactions/receiving/nonPO",
  hasValidToken,
  isPropertyAdminUser,
  receivingTransactionCtrl.addItemToSubinventoryNonPO
);

export default router;
