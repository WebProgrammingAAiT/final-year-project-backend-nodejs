import UserCollection from "../models/userModel.js";
import DepartmentUserCollection from "../models/departmentUserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authCtrl = {
  signup: async (req, res) => {
    try {
      const { email, username, password, role } = req.body;
      if (!email || !username || !password || !role) {
        return res.status(400).json({ msg: "Please fill all the fields" });
      }

      if (role !== "propertyAdminUser" && role !== "departmentUser") {
        return res
          .status(400)
          .json({ msg: "Role must be propertyAdminUser or departmentUser" });
      }
      if (role == "departmentUser" && !req.body.department) {
        return res.status(400).json({ msg: "Department is required" });
      }
      const user = await UserCollection.findOne({
        $or: [{ email: email }, { username: username }],
      });
      if (user) {
        return res
          .status(400)
          .json({ msg: "Either email or username is already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let newUser = {
        email,
        username,
        password: hashedPassword,
        role,
      };
      if (role == "departmentUser") {
        newUser.department = req.body.department;
        await DepartmentUserCollection.create(newUser);
      } else {
        await UserCollection.create(newUser);
      }
      return res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
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
        return res
          .status(404)
          .json({ msg: "Invalid Credential, please try again." });
      }

      const isCorrectPassword = await bcrypt.compare(password, user.password);
      if (!isCorrectPassword)
        return res
          .status(404)
          .json({ msg: "Invalid Credentials, please try again." });

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
      if (!refreshToken)
        return res.status(400).json({ msg: "Please login first." });

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            return res.status(401).json({ msg: "Please login first." });
          } else {
            const accessToken = createAccessToken({ id: user.id });

            return res.json({ accessToken });
          }
        }
      );
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
