import DepartmentCollection from "../models/departmentModel.js";

const departmentCtrl = {
  addDepartment: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.sendStatus(400);
    }

    try {
      await DepartmentCollection.create({
        name,
      });

      return res.status(201).json({ msg: "Department added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getDepartments: async (req, res) => {
    try {
      const departments = await DepartmentCollection.find();
      return res.status(200).json({ departments });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const department = await DepartmentCollection.findById(id);
      if (!department)
        return res.status(404).json({ msg: "No department found." });

      return res.status(200).json({ department });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name || !id) {
        return res.sendStatus(400);
      }

      const result = await DepartmentCollection.findByIdAndUpdate(id, {
        name,
      });
      if (!result) {
        return res.status(404).json({ msg: "No department found." });
      }
      return res.json({
        msg: "Department updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const result = await DepartmentCollection.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ msg: "No department found." });
      }
      return res.json({
        msg: "Department deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  
};

export default departmentCtrl;
