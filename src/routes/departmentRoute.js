import express from "express";
import departmentCtrl from "../controllers/departmentController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/departments",
  hasValidToken,
  isAdmin,
  departmentCtrl.addDepartment
);
router.get("/departments", departmentCtrl.getDepartments);
router.get("/departments/:id", departmentCtrl.getDepartment);
router.put(
  "/departments/:id",
  hasValidToken,
  isAdmin,
  departmentCtrl.updateDepartment
);
router.delete(
  "/departments/:id",
  hasValidToken,
  isAdmin,
  departmentCtrl.deleteDepartment
);

router.get(
  "/departments/:id/requestingTransactions",
  departmentCtrl.getDepartmentMaterialRequests
);
router.get(
  "/departments/:id/returningTransactions/pending",
  departmentCtrl.getPendingDepartmentReturnMaterialTransactions
);

export default router;
