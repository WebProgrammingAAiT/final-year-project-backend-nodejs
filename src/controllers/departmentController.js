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
};

export default departmentCtrl;
