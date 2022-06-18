import express from "express";
import inquiryCtrl from "../controllers/inquiryController.js";
import { hasValidToken, isPropertyAdminUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/inquiries/onHand", hasValidToken, isPropertyAdminUser, inquiryCtrl.onHandInquiry);
router.get("/inquiries/trackItem", hasValidToken, isPropertyAdminUser, inquiryCtrl.trackItem);
router.get("/inquiries/stockInquiry/detail", hasValidToken, isPropertyAdminUser, inquiryCtrl.stockInquiryDetail);
router.get("/inquiries/stockInquiry/general", hasValidToken, isPropertyAdminUser, inquiryCtrl.stockInquiryGeneral);
router.get("/inquiries/report", hasValidToken, isPropertyAdminUser, inquiryCtrl.report);

export default router;
