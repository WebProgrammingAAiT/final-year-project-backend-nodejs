import express from "express";
import inquiryCtrl from "../controllers/inquiryController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/inquiries/onHand", inquiryCtrl.onHandInquiry);
router.get("/inquiries/trackItem", inquiryCtrl.trackItem);
router.get("/inquiries/stockInquiry", inquiryCtrl.stockInquiry);
// router.get('/items/:id',itemCtrl.getItem);
// router.put('/items/:id',hasValidToken,isAdmin,itemCtrl.updateItem);
// router.delete('/items/:id',hasValidToken,isAdmin,itemCtrl.deleteItem);

// //TODO: remove
// router.put('/items/test/:id',itemCtrl.testItem);

export default router;
