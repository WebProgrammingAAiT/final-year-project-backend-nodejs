import DepartmentUserCollection from "../models/departmentUserModel.js";
import UserCollection from "../models/userModel.js";

const userCtrl = {
  changeUserDepartment: async (req, res) => {
    try {
      const { emailOrUsername, departmentId } = req.body;
      if (!emailOrUsername || !departmentId) return res.sendStatus(400);
      const user = await DepartmentUserCollection.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });

      if (!user) return res.status(404).json({ msg: "No user found." });

      if (user.role !== "departmentUser")
        return res.status(400).json({ msg: "User is not a department user." });

      user.department = departmentId;
      await user.save();
      return res.status(200).json({ msg: "Department changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changeUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role, departmentId } = req.body;
      if (!id || !role) return res.sendStatus(400);
      if (role !== "propertyAdminUser" && role !== "departmentUser") {
        return res
          .status(400)
          .json({ msg: "Role must be propertyAdminUser or departmentUser" });
      }
      if (role == "departmentUser" && !departmentId) {
        return res.status(400).json({ msg: "Department Id is required" });
      }
      const user = await UserCollection.findById(id);
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
      await UserCollection.replaceOne({ _id: id }, data);
      return res.status(200).json({ msg: "Role changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm;
      let filter = {};
      // the i is for case insensitive search
      if (searchTerm) {
        filter = {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        };
      }
      let users = await UserCollection.find(filter).select("-password");

      res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
export default userCtrl;
