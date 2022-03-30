import UserCollection from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await UserCollection.findOne({
      username,
    });
    if (user) {
      if (user.email === email) {
        return res.status(401).json({ msg: "Email already in use" });
      } else {
        return res.status(401).json({ msg: "Username already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserCollection.create({
      email,
      username,
      password: hashedPassword,
    });
    return res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const signin = async (req, res) => {
  try {
    const user = await UserCollection.findOne({
      $or: [
        { email: req.body.emailOrUsername },
        { username: req.body.emailOrUsername },
      ],
    });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "Invalid Credential, please try again." });
    }

    const isCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isCorrectPassword)
      return res
        .status(404)
        .json({ msg: "Invalid Credentials, please try again." });

    const refreshToken = createRefreshToken({ id: user._id, role: user.role });
    res.cookie("userRefreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/user/refreshToken",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });
    const accessToken = createAcessToken({ id: user._id, role: user.role });
    return res.json({ msg: "Login Successful.", accessToken });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const createAcessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });
};

export { signup, signin };