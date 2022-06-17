import mongoose from "mongoose";

import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import ItemCollection from "../models/itemModel.js";
import DepartmentCollection from "../models/departmentModel.js";
import SubinventoryCollection from "../models/subinventoryModel.js";
import DepartmentItemCollection from "../models/departmentItemModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import UserCollection from "../models/userModel.js";
import smartContractInteraction from "./smartContractInteractionController.js";

import { customAlphabet } from "nanoid";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const returningTransactionCtrl = {
  returnItems: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { returnedItems, user, department } = req.body;
      if (!returnedItems || returnedItems.length === 0 || !user || !department) {
        return res.sendStatus(400);
      }
      const returningUser = await UserCollection.findById(req.userId);
      if (returningUser.department != department) {
        return res.status(403).json({ msg: "You are not authorized to view this page." });
      }
      let arrayOfReturnedItems = [];

      // iterating through each item found in returnedItems to be returned
      // and checking if the itemType exists
      for (let i = 0; i < returnedItems.length; i++) {
        const item = returnedItems[i];
        const { tagNumber } = item;

        if (!tagNumber) {
          return res.sendStatus(400);
        }

        //checking first if the item belongs to the department
        const itemInDepartment = await DepartmentItemCollection.findById(tagNumber).session(session);
        if (!itemInDepartment || itemInDepartment.department != department) {
          return res.status(400).json({ msg: "Item does not belong to the department" });
        }
        if (itemInDepartment.markedForReturn) {
          return res.status(400).json({ msg: "Item(s) has/have already been marked for return" });
        }
        itemInDepartment.markedForReturn = true;
        await itemInDepartment.save();
        arrayOfReturnedItems.push({ item: tagNumber, itemType: itemInDepartment.itemType });
      }

      const transaction = await ReturningTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            department,
            returnedDate: new Date(),
            returnedItems: arrayOfReturnedItems,
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let tPopulated = await ReturningTransactionCollection.findById(transaction[0]._id)
        .lean()
        .populate("department returnedItems.itemType", "name")
        .session(session);
      let tNormal = await ReturningTransactionCollection.findById(transaction[0]._id).lean().session(session);
      await smartContractInteraction.createReturningTransaction(tPopulated, tNormal);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(200).json({ msg: "Item(s) return requested successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
    }
  },
  getPendingReturningTransactionsGroupedByDepartments: async (req, res) => {
    try {
      const pendingReturningTransactionsGroupedByDepartments = await ReturningTransactionCollection.aggregate([
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
        {
          $group: {
            _id: "$department",
            totalItemsReturned: {
              $sum: {
                $cond: {
                  if: {
                    $isArray: "$returnedItems",
                  },
                  then: {
                    $size: "$returnedItems",
                  },
                  else: "NA",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $unwind: {
            path: "$department",
          },
        },
        {
          $project: {
            _id: 0,
            "department._id": 1,
            "department.name": 1,
            totalItemsReturned: 1,
          },
        },
      ]);

      return res.status(200).json({ pendingReturningTransactionsGroupedByDepartments });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPendingReturningTransactionsForDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;
      if (!departmentId) {
        return res.status(400).json({ msg: "Department Id is required" });
      }
      const pendingReturningTransactions = await ReturningTransactionCollection.aggregate([
        {
          $match: {
            department: mongoose.Types.ObjectId(departmentId),
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
      await ItemTypeCollection.populate(pendingReturningTransactions, {
        path: "returnedItems.itemType",
        select: "name itemCode",
      });
      await DepartmentCollection.populate(pendingReturningTransactions, {
        path: "department",
        select: "name",
      });
      return res.status(200).json({ pendingReturningTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  acceptReturnedItems: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // itemsToBeReturned is a list of objects, with each object having {itemTypeId,subinventoryId,itemId,returningTransactionId}
      // user and source will be be a single value for all items to be Returned
      const { itemsToBeReturned, user, department } = req.body;
      if (!itemsToBeReturned || itemsToBeReturned.length === 0 || !user || !department) {
        return res.sendStatus(400);
      }

      const departmentInDB = await DepartmentCollection.findById(department);
      if (!departmentInDB) return res.status(404).json({ msg: "No department found with the specified id." });

      let mapOfItemTypeToItem = {};

      // iterating through each item found in items to be Returned
      // and checking if the itemId , subinventory id, returningTransactionId exists
      for (let i = 0; i < itemsToBeReturned.length; i++) {
        const item = itemsToBeReturned[i];
        const { subinventoryId, itemId, returningTransactionId } = item;

        if (!subinventoryId || !itemId || !returningTransactionId) {
          return res.sendStatus(400);
        }
        const returningTransaction = await ReturningTransactionCollection.findById(returningTransactionId);
        if (!returningTransaction)
          return res.status(404).json({
            msg: "No returning transaction found with the specified id.",
          });
        const itemFromDb = await ItemCollection.findById(itemId);
        if (!itemFromDb) return res.status(404).json({ msg: "No item found with the specified id." });
        //checking if item exists and belongs to the specified department
        if (itemFromDb.type == "Subinventory_Item" || itemFromDb.department != department) {
          return res.status(400).json({
            msg: "Item is not a department item / doesn't belong to the department",
          });
        }
        let itemTypeId = itemFromDb.itemType;

        const subinventory = await SubinventoryCollection.findById(subinventoryId);
        if (!subinventory) return res.status(404).json({ msg: "No subinventory found with the specified id." });

        // checking if array is there in the map with the key itemTypeId
        // if not instantiate an empty one for the current itemTypeId
        if (!mapOfItemTypeToItem[itemTypeId]) {
          mapOfItemTypeToItem[itemTypeId] = [];
        }
        // adding to our map with key itemTypeId and value {unitCost, subinventoryId,itemId}
        mapOfItemTypeToItem[itemTypeId].push({
          itemId: itemId,
          subinventoryId: subinventoryId,
          unitCost: itemFromDb.price,
        });
        // changing the department item to be a subinventory item
        await ItemCollection.replaceOne(
          { _id: itemFromDb._id },
          {
            itemType: itemTypeId,
            price: itemFromDb.price,
            department,
            type: "Subinventory_Item",
            subinventory: subinventoryId,
            createdAt: itemFromDb.createdAt,
          },
          { session: session }
        );

        //checking if the item is there in the returning transaction
        const itemInReturningTransaction = returningTransaction.returnedItems.find((itemInArray) => itemInArray.item == itemId);
        if (!itemInReturningTransaction) return res.status(400).json({ msg: "Item not found in the returning transaction" });
        // updating the returningTransaction with the given itemId to approved
        returningTransaction.returnedItems = returningTransaction.returnedItems.map((itemInMap) => {
          if (itemInMap.item == itemId) {
            return { ...itemInMap, status: "approved" };
          }
          return itemInMap;
        });
        await returningTransaction.save({ session: session });
      }
      // checking if items with same itemType but different subinventory exist
      for (let m in mapOfItemTypeToItem) {
        let previousItemTypeSubinventory = "";
        for (let k = 0; k < mapOfItemTypeToItem[m].length; k++) {
          let subinventoryId = mapOfItemTypeToItem[m][k].subinventoryId;
          if (previousItemTypeSubinventory !== "" && previousItemTypeSubinventory !== subinventoryId) {
            return res.status(400).json({
              msg: "Two different subinventories are not allowed for the same item type",
            });
          }
          previousItemTypeSubinventory = subinventoryId;
        }
      }
      // useful for setting the receiving transaction data
      let arrayOfReceivedItems = [];
      // iterating through each itemType found in mapOfItemTypeToItem
      Object.keys(mapOfItemTypeToItem).map((key) => {
        let items = mapOfItemTypeToItem[key].map((item) => item.itemId);
        let averageUnitCost =
          mapOfItemTypeToItem[key].reduce((acc, item) => {
            return acc + item.unitCost;
          }, 0) / mapOfItemTypeToItem[key].length;
        arrayOfReceivedItems.push({
          itemType: key,
          quantity: mapOfItemTypeToItem[key].length,
          subinventory: mapOfItemTypeToItem[key][0].subinventoryId,
          items,
          unitCost: averageUnitCost,
        });
      });

      const transaction = await ReceivingTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            source: department,
            receivedItems: arrayOfReceivedItems,
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let tPopulated = await ReceivingTransactionCollection.findById(transaction[0]._id)
        .lean()
        .populate("receivedItems.itemType receivedItems.subinventory", "name")
        .session(session);
      //not populated document (useful for hashing)
      let tNormal = await ReceivingTransactionCollection.findById(transaction[0]._id).lean().session(session);

      await smartContractInteraction.createReceiveTransaction(tPopulated, tNormal);

      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(200).json({ msg: "Item(s) returned successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
    }
  },
};

export default returningTransactionCtrl;
