import jwt from "jsonwebtoken";

import UserCollection from "../models/userModel.js";
const hasValidToken = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    token = token.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      req.userId = user.id;
      next();
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Admin that can create a user, delete a user
const isAdmin = async (req, res, next) => {
  try {
    const user = await UserCollection.findById(req.userId);
    if (!user) {
      return res.sendStatus(403);
    }
    if (user.role !== "admin") {
      return res.sendStatus(403);
    }
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
// PropertyAdmin that can create a subinventory,generate model 19/22
const isPropertyAdminUser = async (req, res, next) => {
  try {
    const user = await UserCollection.findById(req.userId);
    if (!user) {
      return res.sendStatus(403);
    }
    if (user.role !== "propertyAdminUser") {
      return res.sendStatus(403);
    }
    if (user.isAccountActive == false) {
      return res.status(403).json({ msg: "Your account is currently deactivated. Please contact your administrator." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
// DepartmentUser can generate model 20
const isDepartmentUser = async (req, res, next) => {
  try {
    const user = await UserCollection.findById(req.userId);
    if (!user) {
      return res.sendStatus(403);
    }
    if (user.role !== "departmentUser") {
      return res.sendStatus(403);
    }
    if (user.isAccountActive == false) {
      return res.status(403).json({ msg: "Your account is currently deactivated. Please contact your administrator." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export { hasValidToken, isAdmin, isPropertyAdminUser, isDepartmentUser };
