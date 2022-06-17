import mongoose from "mongoose";
import ItemTypeCollection from "../models/itemTypeModel.js";
import SubinventoryCollection from "../models/subinventoryModel.js";
import ItemCollection from "../models/itemModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import DepartmentItemCollection from "../models/departmentItemModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import { getPaginatedResult } from "../utils/getPaginatedResult.js";
const itemCtrl = {
  getSubinventoryItems: async (req, res) => {
    try {
      const items = await SubinventoryItemCollection.find();
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSpecificSubinventoryItems: async (req, res) => {
    try {
      const { id } = req.params;
      const items = await SubinventoryItemCollection.find({ subinventory: id }).populate("itemType", "itemCode name");
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getAllDepartmentItems: async (req, res) => {
    try {
      const itemsLength = await DepartmentItemCollection.countDocuments().exec();
      const results = getPaginatedResult(req, res, itemsLength);
      const items = await DepartmentItemCollection.find()
        .populate("itemType department", "itemCode name")
        .limit(results.limit)
        .skip(results.startIndex);
      results.items = items;
      delete results.limit;
      delete results.startIndex;
      return res.status(200).json({ ...results });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getItem: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const item = await ItemCollection.findById(id);
      if (!item) return res.status(404).json({ msg: "No Item found." });

      return res.status(200).json({ item });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { itemTypeId } = req.body;
      if (!itemTypeId) {
        return res.sendStatus(400);
      }
      const itemType = await ItemTypeCollection.findById(itemTypeId);
      if (!itemType) return res.status(404).json({ msg: "No itemType found with the specified id." });

      const result = await ItemCollection.findByIdAndUpdate(id, {
        itemType: itemTypeId,
      });
      if (!result) {
        return res.status(404).json({ msg: "No Item found." });
      }
      return res.json({
        msg: "Item updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendStatus(400);
      }
      const result = await ItemCollection.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ msg: "No Item found." });
      }
      return res.json({
        msg: "Item deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default itemCtrl;
