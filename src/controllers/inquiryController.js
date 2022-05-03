import mongoose from "mongoose";
import ItemTypeCollection from "../models/itemTypeModel.js";
import SubinventoryCollection from "../models/subinventoryModel.js";
import ItemCollection from "../models/itemModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import DepartmentItemCollection from "../models/departmentItemModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";

const inquiryCtrl = {
  onHandInquiry: async (req, res) => {
    try {
      const { subinventory, endDate } = req.query;
      const items = await SubinventoryItemCollection.aggregate([
        {
          $match: {
            subinventory: mongoose.Types.ObjectId(subinventory),
          },
        },
        {
          $group: {
            _id: "$itemType",
            quantity: {
              $sum: 1,
            },
            averagePrice: {
              $avg: "$price",
            },
          },
        },
        {
          $project: {
            quantity: 1,
            averagePrice: 1,
            totalAmount: {
              $multiply: ["$quantity", "$averagePrice"],
            },
          },
        },
        {
          $lookup: {
            from: "item_types",
            localField: "_id",
            foreignField: "_id",
            as: "itemType",
          },
        },
        {
          $unwind: {
            path: "$itemType",
          },
        },
        {
          $project: {
            "itemType.createdAt": 0,
            "itemType.updatedAt": 0,
          },
        },
        {
          $sort: {
            totalAmount: -1,
          },
        },
      ]);
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSpecificSubinventoryItems: async (req, res) => {
    try {
      const { id } = req.params;
      const items = await SubinventoryItemCollection.find({ subinventory: id });
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getDepartmentItems: async (req, res) => {
    try {
      const items = await DepartmentItemCollection.find();
      return res.status(200).json({ items });
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

  //TODO: remove
  testItem: async (req, res) => {
    const { itemTypeId, quantity, department } = req.body;
    const items = await ItemCollection.find({
      type: "Subinventory_Item",
      itemType: itemTypeId,
    }).limit(quantity);
    if (items.length < quantity) {
      return res.status(400).json({ msg: "Not enough items in subinventory for item type" });
    }
    console.log(items[0]);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ItemCollection.replaceOne(
        { _id: item._id },
        {
          itemType: itemTypeId,
          department,
          type: "Department_Item",
          createdAt: item.createdAt,
        }
      );
    }
  },
};

export default inquiryCtrl;
