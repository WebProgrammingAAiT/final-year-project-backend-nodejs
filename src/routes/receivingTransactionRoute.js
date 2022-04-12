import express from "express";
import receivingTransactionCtrl from "../controllers/receivingTransactionController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

//TODO: add property admin user check
router.post("/transactions/receiving/nonPO", receivingTransactionCtrl.addItemToSubinventoryNonPO);

export default router;
