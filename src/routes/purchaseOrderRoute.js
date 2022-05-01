import express from "express";
import purchaseOrderCtrl from "../controllers/purchaseOrderController.js";
import { hasValidToken, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/purchaseOrders", purchaseOrderCtrl.addPurchaseOrder);
router.get("/purchaseOrders", purchaseOrderCtrl.getPurchaseOrders);
router.get("/purchaseOrders/:purchaseOrderNumber", purchaseOrderCtrl.getPurchaseOrder);

export default router;
