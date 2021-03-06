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

      const receivedItemsFromOutside = await ReceivingTransactionCollection.aggregate([
        {
          // useful to set the default of isReturn to false
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
            isReturn: false,
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
      const receivedItemsFromDepartments = await ReceivingTransactionCollection.aggregate([
        {
          // useful to set the default of isReturn to false
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
            isReturn: true,
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
      await ItemTypeCollection.populate(receivedItemsFromOutside, {
        path: "itemType",
        select: "name itemCode",
      });
      await ItemTypeCollection.populate(receivedItemsFromDepartments, {
        path: "itemType",
        select: "name itemCode",
      });

      return res.status(200).json({ receivedItemsFromOutside, receivedItemsFromDepartments });
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

      const itemsReceivedFromOutside = await ReceivingTransactionCollection.aggregate([
        {
          // useful to set the default of isReturn to false
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
            isReturn: false,
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
      await ItemTypeCollection.populate(itemsReceivedFromOutside, {
        path: "receivedItems.itemType",
        select: "name itemCode",
      });
      // if we want to show general overview
      let mapOfItemTypeToItemForItemsReceivedFromOutside = {};

      for (let i = 0; i < itemsReceivedFromOutside.length; i++) {
        let receivedItems = itemsReceivedFromOutside[i].receivedItems;
        for (let j = 0; j < receivedItems.length; j++) {
          let item = receivedItems[j];
          if (!item.itemType) continue;
          if (mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode]) {
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode].quantity += item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode].totalUnitCost += item.unitCost * item.quantity;
          } else {
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode] = {};
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode].quantity = item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode].totalUnitCost = item.unitCost * item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromOutside[item.itemType.itemCode].itemName = item.itemType.name;
          }
        }
      }

      const itemsReceivedFromDepartments = await ReceivingTransactionCollection.aggregate([
        {
          // useful to set the default of isReturn to false
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
            isReturn: true,
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
      await ItemTypeCollection.populate(itemsReceivedFromDepartments, {
        path: "receivedItems.itemType",
        select: "name itemCode",
      });
      // if we want to show general overview
      let mapOfItemTypeToItemForItemsReceivedFromDepartments = {};

      for (let i = 0; i < itemsReceivedFromDepartments.length; i++) {
        let receivedItems = itemsReceivedFromDepartments[i].receivedItems;
        for (let j = 0; j < receivedItems.length; j++) {
          let item = receivedItems[j];
          if (!item.itemType) continue;
          if (mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode]) {
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode].quantity += item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode].totalUnitCost +=
              item.unitCost * item.quantity;
          } else {
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode] = {};
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode].quantity = item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode].totalUnitCost =
              item.unitCost * item.quantity;
            mapOfItemTypeToItemForItemsReceivedFromDepartments[item.itemType.itemCode].itemName = item.itemType.name;
          }
        }
      }

      return res
        .status(200)
        .json({ mapOfItemTypeToItemForItemsReceivedFromOutside, mapOfItemTypeToItemForItemsReceivedFromDepartments });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  report: async (req, res) => {
    try {
      const receivedItems = await ReceivingTransactionCollection.aggregate([
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            type: "Receiving_Transaction",
            isReturn: false,
          },
        },
        {
          $unwind: {
            path: "$receivedItems",
          },
        },
        {
          $group: {
            _id: "$receivedItems.itemType",
            quantity: {
              $sum: "$receivedItems.quantity",
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
            _id: 1,
            quantity: 1,
            name: "$itemType.name",
            itemCode: "$itemType.itemCode",
          },
        },
        { $sort: { quantity: -1 } },
      ]);

      const transferredItems = await TransactionCollection.aggregate([
        {
          $match: {
            type: "Transferring_Transaction",
          },
        },
        {
          $group: {
            _id: "$transferredItems.itemType",
            quantity: {
              $sum: "$transferredItems.quantity",
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
            _id: 1,
            quantity: 1,
            name: "$itemType.name",
            itemCode: "$itemType.itemCode",
          },
        },
      ]);

      const returnedItems = await ReceivingTransactionCollection.aggregate([
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            type: "Receiving_Transaction",
            isReturn: true,
          },
        },
        {
          $unwind: {
            path: "$receivedItems",
          },
        },
        {
          $group: {
            _id: "$receivedItems.itemType",
            quantity: {
              $sum: "$receivedItems.quantity",
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
            _id: 1,
            quantity: 1,
            name: "$itemType.name",
            itemCode: "$itemType.itemCode",
          },
        },
      ]);
      let mapOfItemTypeIdToQuantity = {};

      for (let i = 0; i < receivedItems.length; i++) {
        const item = receivedItems[i];
        if (!mapOfItemTypeIdToQuantity[item._id]) {
          mapOfItemTypeIdToQuantity[item._id] = {};
        }
        mapOfItemTypeIdToQuantity[item._id].receivedQuantity = item.quantity;
        mapOfItemTypeIdToQuantity[item._id].name = item.name;
        mapOfItemTypeIdToQuantity[item._id].itemCode = item.itemCode;
      }
      for (let i = 0; i < transferredItems.length; i++) {
        const item = transferredItems[i];
        if (!mapOfItemTypeIdToQuantity[item._id]) {
          mapOfItemTypeIdToQuantity[item._id] = {};
        }
        mapOfItemTypeIdToQuantity[item._id].transferredQuantity = item.quantity;
        mapOfItemTypeIdToQuantity[item._id].name = item.name;
        mapOfItemTypeIdToQuantity[item._id].itemCode = item.itemCode;
      }
      for (let i = 0; i < returnedItems.length; i++) {
        const item = returnedItems[i];
        if (!mapOfItemTypeIdToQuantity[item._id]) {
          mapOfItemTypeIdToQuantity[item._id] = {};
        }
        mapOfItemTypeIdToQuantity[item._id].returnedQuantity = item.quantity;
        mapOfItemTypeIdToQuantity[item._id].name = item.name;
        mapOfItemTypeIdToQuantity[item._id].itemCode = item.itemCode;
      }

      Object.keys(mapOfItemTypeIdToQuantity).map((key) => {
        let receivedQuantity = mapOfItemTypeIdToQuantity[key].receivedQuantity ?? 0;
        let transferredQuantity = mapOfItemTypeIdToQuantity[key].transferredQuantity ?? 0;
        let returnedQuantity = mapOfItemTypeIdToQuantity[key].returnedQuantity ?? 0;
        mapOfItemTypeIdToQuantity[key].onHand = receivedQuantity - transferredQuantity + returnedQuantity;
      });

      return res.status(200).json({ mapOfItemTypeIdToQuantity });
    } catch (error) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default inquiryCtrl;
