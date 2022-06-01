import UserCollection from "../models/userModel.js";
import DepartmentUserCollection from "../models/departmentUserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import smartContractInteraction from "./smartContractInteractionController.js";
const authCtrl = {
  signup: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { email, username, password, role } = req.body;
      if (!email || !username || !password || !role) {
        return res.status(400).json({ msg: "Please fill all the fields" });
      }

      if (role !== "propertyAdminUser" && role !== "departmentUser") {
        return res.status(400).json({ msg: "Role must be propertyAdminUser or departmentUser" });
      }
      if (role == "departmentUser" && !req.body.department) {
        return res.status(400).json({ msg: "Department is required" });
      }

      const user = await UserCollection.findOne({
        $or: [{ email: email }, { username: username }],
      });
      if (user) {
        return res.status(400).json({ msg: "Either email or username is already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let newUser = {
        email,
        username,
        password: hashedPassword,
        role,
      };
      let transaction;
      if (role == "departmentUser") {
        newUser.department = req.body.department;
        transaction = await DepartmentUserCollection.create([newUser], { session: session });
      } else {
        transaction = await UserCollection.create([newUser], { session: session });
      }

      // refetching the user created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let t = await UserCollection.findById(transaction[0]._id).lean().session(session);
      let createdBy = await UserCollection.findById(req.userId);
      await smartContractInteraction.createUser(t, createdBy.username);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
    }
  },

  signin: async (req, res) => {
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password) {
        return res.status(400).json({ msg: "Please fill all the fields" });
      }
      const user = await UserCollection.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });
      if (!user) {
        return res.status(404).json({ msg: "Invalid Credential, please try again." });
      }

      const isCorrectPassword = await bcrypt.compare(password, user.password);
      if (!isCorrectPassword) return res.status(404).json({ msg: "Invalid Credentials, please try again." });

      const refreshToken = createRefreshToken({
        id: user._id,
        role: user.role,
      });
      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/user/refreshToken",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
      });
      const accessToken = createAccessToken({ id: user._id, role: user.role });
      return res.json({ msg: "Login Successful.", accessToken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getUserAccessToken: (req, res) => {
    try {
      const refreshToken = req.cookies.userRefreshToken;
      if (!refreshToken) return res.status(400).json({ msg: "Please login first." });

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.status(401).json({ msg: "Please login first." });
        } else {
          const accessToken = createAccessToken({ id: user.id });

          return res.json({ accessToken });
        }
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: (req, res) => {
    try {
      res.clearCookie("userRefreshToken", { path: "/api/user/refreshToken" });
      return res.json({ msg: "Logout successful." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) => {
  //TODO: reduce to 10min
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });
};

export default authCtrl;
