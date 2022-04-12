import express from "express";
import requestingTransactionCtrl from "../controllers/requestingTransactionController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

//TODO: add property admin user check
router.post("/transactions/requesting", requestingTransactionCtrl.requestItems);

export default router;
