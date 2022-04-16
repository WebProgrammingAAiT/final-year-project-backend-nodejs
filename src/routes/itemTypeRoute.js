import express from "express";
import itemTypeCtrl from "../controllers/itemTypeController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/itemTypes", hasValidToken, isAdmin, itemTypeCtrl.addItemType);
router.get("/itemTypes", itemTypeCtrl.getItemTypes);
router.get("/itemTypes/search", itemTypeCtrl.searchForItemCode);
router.get("/itemTypes/:id", itemTypeCtrl.getItemType);
router.put(
  "/itemTypes/:id",
  hasValidToken,
  isAdmin,
  itemTypeCtrl.updateItemType
);
router.delete(
  "/itemTypes/:id",
  hasValidToken,
  isAdmin,
  itemTypeCtrl.deleteItemType
);

export default router;
