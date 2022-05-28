import mongoose from "mongoose";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import TransactionCollection from "../models/transactionModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import DepartmentCollection from "../models/departmentModel.js";
import UserCollection from "../models/userModel.js";

const inquiryCtrl = {
  onHandInquiry: async (req, res) => {
    try {
      const { subinventory } = req.query;
      if (!subinventory) return res.status(400).json({ msg: "Please provide a subinventory" });

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
  trackItem: async (req, res) => {
    try {
      let { tagNumber } = req.query;
      if (!tagNumber) {
        return res.sendStatus(400);
      }
      tagNumber = mongoose.Types.ObjectId(tagNumber);
      const itemHistory = await TransactionCollection.aggregate([
        {
          $match: {
            $or: [
              {
                "receivedItems.items": tagNumber,
              },
              {
                "transferredItems.items": tagNumber,
              },
              {
                $and: [
                  {
                    "returnedItems.item": tagNumber,
                  },
                  {
                    "returnedItems.status": "approved",
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            receivedItems: 0,
            transferredItems: 0,
            returnedItems: 0,
          },
        },
      ]);
      await UserCollection.populate(itemHistory, {
        path: "user",
        select: "username email",
      });
      await DepartmentCollection.populate(itemHistory, {
        path: "department",
        select: "name",
      });
      return res.status(200).json({ itemHistory });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  stockInquiryDetail: async (req, res) => {
    try {
      const { subinventory, startDate, endDate } = req.query;
      if (!subinventory || !startDate || !endDate) {
        return res.sendStatus(400);
      }

      const items = await ReceivingTransactionCollection.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $project: {
            _id: 1,
            receivedItems: {
              $filter: {
                input: "$receivedItems",
                as: "receivedItems",
                cond: {
                  $eq: ["$$receivedItems.subinventory", mongoose.Types.ObjectId(subinventory)],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: [
                {
                  $size: "$receivedItems",
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            receivedItems: 1,
          },
        },
        {
          $unwind: {
            path: "$receivedItems",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$receivedItems",
          },
        },
      ]);
      await ItemTypeCollection.populate(items, {
        path: "itemType",
        select: "name itemCode",
      });

      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  stockInquiryGeneral: async (req, res) => {
    try {
      const { subinventory, startDate, endDate } = req.query;
      if (!subinventory || !startDate || !endDate) {
        return res.sendStatus(400);
      }

      const items = await ReceivingTransactionCollection.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $project: {
            _id: 1,
            receivedItems: {
              $filter: {
                input: "$receivedItems",
                as: "receivedItems",
                cond: {
                  $eq: ["$$receivedItems.subinventory", mongoose.Types.ObjectId(subinventory)],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: [
                {
                  $size: "$receivedItems",
                },
                0,
              ],
            },
          },
        },
      ]);
      await ItemTypeCollection.populate(items, {
        path: "receivedItems.itemType",
        select: "name itemCode",
      });
      // if we want to show general overview
      let mapOfItemTypeToItem = {};

      for (let i = 0; i < items.length; i++) {
        let receivedItems = items[i].receivedItems;
        for (let j = 0; j < receivedItems.length; j++) {
          let item = receivedItems[j];
          if (!item.itemType) continue;
          if (mapOfItemTypeToItem[item.itemType.itemCode]) {
            mapOfItemTypeToItem[item.itemType.itemCode].quantity += item.quantity;
            mapOfItemTypeToItem[item.itemType.itemCode].totalUnitCost += item.unitCost * item.quantity;
          } else {
            mapOfItemTypeToItem[item.itemType.itemCode] = {};
            mapOfItemTypeToItem[item.itemType.itemCode].quantity = item.quantity;
            mapOfItemTypeToItem[item.itemType.itemCode].totalUnitCost = item.unitCost * item.quantity;
            mapOfItemTypeToItem[item.itemType.itemCode].itemName = item.itemType.name;
          }
        }
      }
      let arrayOfReceivedItems = [];
      Object.keys(mapOfItemTypeToItem).map((key) =>
        arrayOfReceivedItems.push({
          itemCode: key,
          itemName: mapOfItemTypeToItem[key].itemName,
          quantity: mapOfItemTypeToItem[key].quantity,
          totalUnitCost: mapOfItemTypeToItem[key].totalUnitCost,
        })
      );

      return res.status(200).json({ mapOfItemTypeToItem });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default inquiryCtrl;
