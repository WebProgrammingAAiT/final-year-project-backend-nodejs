import DepartmentCollection from "../models/departmentModel.js";
import DepartmentItemCollection from "../models/departmentItemModel.js";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import ItemCollection from "../models/itemModel.js";
import UserCollection from "../models/userModel.js";

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
      if (!department) return res.status(404).json({ msg: "No department found." });

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
      const department = await DepartmentCollection.findById(id);
      if (!department) {
        return res.status(404).json({ msg: "No department found." });
      }
      const itemBelongingToDepartment = await DepartmentItemCollection.findOne({ department: id });
      if (itemBelongingToDepartment) return res.status(400).json({ msg: "Department has items assigned to it." });

      await DepartmentCollection.findByIdAndDelete(id);

      return res.json({
        msg: "Department deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getDepartmentMaterialRequests: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const user = await UserCollection.findById(req.userId);
      if (user.role !== "admin" && user.department != id) {
        return res.status(403).json({ msg: "You are not authorized to view this page." });
      }
      const requestingTransactions = await RequestingTransactionCollection.find({ department: id }).populate("user", "username");
      await ItemTypeCollection.populate(requestingTransactions, {
        path: "requestedItems.itemType",
        select: "name itemCode",
      });
      return res.status(200).json({ requestingTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPendingDepartmentReturnMaterialTransactions: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const user = await UserCollection.findById(req.userId);
      if (user.role !== "admin" && user.department != id) {
        return res.status(403).json({ msg: "You are not authorized to view this page." });
      }
      const pendingReturningTransactions = await ReturningTransactionCollection.aggregate([
        {
          $match: {
            returnedItems: {
              $elemMatch: {
                status: "pending",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            department: 1,
            returnedDate: 1,
            returnedItems: {
              $filter: {
                input: "$returnedItems",
                as: "returnedItems",
                cond: {
                  $eq: ["$$returnedItems.status", "pending"],
                },
              },
            },
          },
        },
      ]);
      await ItemCollection.populate(pendingReturningTransactions, {
        path: "returnedItems.item",
        select: "itemType",
      });
      await ItemTypeCollection.populate(pendingReturningTransactions, {
        path: "returnedItems.item.itemType",
        select: "name itemCode",
      });
      return res.status(200).json({ pendingReturningTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getDepartmentItems: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await UserCollection.findById(req.userId);
      if (user.role !== "admin" && user.department != id) {
        return res.status(403).json({ msg: "You are not authorized to view this page." });
      }
      const departmentItems = await DepartmentItemCollection.find({
        department: id,
      })
        .populate("itemType", "itemCode name")
        .sort({ markedForReturn: 1 });
      return res.status(200).json({ departmentItems });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default departmentCtrl;
