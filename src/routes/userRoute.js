import express from "express";
import userCtrl from "../controllers/userController.js";
import { hasValidToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put(
  "/user/changeDepartment",
  hasValidToken,
  isAdmin,
  userCtrl.changeUserDepartment
);
router.get("/users/search", hasValidToken, isAdmin, userCtrl.searchForUsers);
router.put(
  "/users/:emailOrUsername/changeRole",
  hasValidToken,
  isAdmin,
  userCtrl.changeUserRole
);
//admin changing another user's password
router.put(
  "/users/:emailOrUsername/changePassword",
  hasValidToken,
  isAdmin,
  userCtrl.changeUserPassword
);

export default router;
