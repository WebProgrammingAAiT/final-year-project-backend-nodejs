import DepartmentUserCollection from "../models/departmentUserModel.js";
import UserCollection from "../models/userModel.js";
import bcrypt from "bcrypt";
import smartContractInteraction from "./smartContractInteractionController.js";
const userCtrl = {
  getUsers: async (req, res) => {
    try {
      const users = await UserCollection.find({}).select("-password");
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await UserCollection.findById(req.userId).select("-password").populate("department", "name");
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserFromBlockchain: async (req, res) => {
    try {
      let id = req.params.id;
      if (!id) {
        return res.sendStatus(400);
      }
      const user = await smartContractInteraction.getUser(id);
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const user = await UserCollection.findById(id).select("-password").populate("department", "name");
      if (!user) {
        return res.status(404).json({ msg: "No user found." });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changeUserDepartment: async (req, res) => {
    try {
      const { emailOrUsername, departmentId } = req.body;
      if (!emailOrUsername || !departmentId) return res.sendStatus(400);
      const user = await DepartmentUserCollection.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });

      if (!user) return res.status(404).json({ msg: "No user found." });

      if (user.role !== "departmentUser") return res.status(400).json({ msg: "User is not a department user." });

      user.department = departmentId;
      await user.save();
      return res.status(200).json({ msg: "Department changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changeUserRole: async (req, res) => {
    try {
      const { emailOrUsername } = req.params;
      const { role, departmentId } = req.body;
      if (!emailOrUsername || !role) return res.sendStatus(400);
      if (role !== "propertyAdminUser" && role !== "departmentUser") {
        return res.status(400).json({ msg: "Role must be propertyAdminUser or departmentUser" });
      }
      if (role == "departmentUser" && !departmentId) {
        return res.status(400).json({ msg: "Department Id is required" });
      }
      const user = await UserCollection.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });
      if (!user) return res.status(404).json({ msg: "No user found." });
      let newUser = user.toObject();
      let data = {};
      if (role == "departmentUser") {
        data = {
          ...newUser,
          department: departmentId,
          type: "Department_User",
          role,
        };
        delete data.updatedAt;
      } else {
        data = {
          ...newUser,
          role,
        };
        delete data.department;
        delete data.type;
        delete data.updatedAt;
      }
      await UserCollection.replaceOne({ _id: data._id }, data);
      return res.status(200).json({ msg: "Role changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changeUserPassword: async (req, res) => {
    try {
      const { emailOrUsername } = req.params;
      const { newPassword } = req.body;
      if (!emailOrUsername || !newPassword) return res.sendStatus(400);
      if (newPassword.length < 6) return res.status(400).json({ msg: "Password must be at least 6 characters long" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await UserCollection.findOneAndUpdate(
        {
          $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
        { password: hashedPassword }
      );

      if (!result) return res.status(404).json({ msg: "User not found" });

      return res.json({ msg: "Password changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  searchForUsers: async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm;
      let filter = {};
      // the i is for case insensitive search
      if (searchTerm) {
        filter = {
          $or: [{ username: { $regex: searchTerm, $options: "i" } }, { email: { $regex: searchTerm, $options: "i" } }],
        };
      }
      let users = await UserCollection.find(filter).select("-password");

      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { emailOrUsername } = req.params;
      if (!emailOrUsername) return res.sendStatus(400);
      const user = await UserCollection.findOneAndDelete({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });
      if (!user) return res.status(404).json({ msg: "No user found" });
      return res.status(200).json({ msg: "User deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
export default userCtrl;
