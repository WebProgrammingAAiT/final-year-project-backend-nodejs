import mongoose from "mongoose";

import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import DepartmentCollection from "../models/departmentModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import { customAlphabet } from "nanoid";
import UserCollection from "../models/userModel.js";
import smartContractInteraction from "./smartContractInteractionController.js";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const requestingTransactionCtrl = {
  requestItems: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { requestedItems, user, department, requiredDate } = req.body;
      if (!requestedItems || requestedItems.length === 0 || !user || !department || !requiredDate) {
        return res.sendStatus(400);
      }
      const requestingUser = await UserCollection.findById(req.userId);
      if (requestingUser.department != department) {
        return res.status(403).json({ msg: "You are not authorized to view this page." });
      }

      let mapOfItemTypeToItem = {};

      // iterating through each item found in requestedItems to be added
      // and checking if the itemType exists and the quantity specified is available
      for (let i = 0; i < requestedItems.length; i++) {
        const item = requestedItems[i];
        const { itemTypeId, quantity } = item;

        if (!itemTypeId || !quantity) {
          return res.sendStatus(400);
        }
        if (typeof quantity != "number") {
          return res.status(400).json({ msg: "Inputs must be numbers" });
        }

        const itemType = await ItemTypeCollection.findById(itemTypeId);
        if (!itemType) return res.status(404).json({ msg: "No itemType found with the specified id." });

        //checking first if the quantity specified is in the db first
        const itemsInSubinventory = await SubinventoryItemCollection.countDocuments(
          {
            itemType: itemTypeId,
          },
          { session: session }
        ).exec();
        if (itemsInSubinventory < quantity) {
          const itemType = await ItemTypeCollection.findById(itemTypeId);
          return res.status(400).json({
            msg: "Not enough items in subinventory for item type " + itemType.name,
          });
        }
        // adding to our map with key itemTypeId and value {quantity}
        if (mapOfItemTypeToItem[itemTypeId]) {
          mapOfItemTypeToItem[itemTypeId] = {
            quantity: mapOfItemTypeToItem[itemTypeId].quantity + quantity,
          };
        } else {
          mapOfItemTypeToItem[itemTypeId] = {
            quantity,
          };
        }
      }
      // useful for setting the requesting transaction data
      let arrayOfRequestedItems = [];
      Object.keys(mapOfItemTypeToItem).map((key) =>
        arrayOfRequestedItems.push({
          itemType: key,
          quantity: mapOfItemTypeToItem[key].quantity,
        })
      );

      let transaction = await RequestingTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            department,
            requiredDate,
            requestedItems: arrayOfRequestedItems,
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let tPopulated = await RequestingTransactionCollection.findById(transaction[0]._id)
        .lean()
        .populate("department requestedItems.itemType", "name")
        .session(session);
      //not populated document (useful for hashing)
      let tNormal = await RequestingTransactionCollection.findById(transaction[0]._id).lean().session(session);
      await smartContractInteraction.createRequestingTransaction(tPopulated, tNormal);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(200).json({ msg: "Item(s) requested successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
    }
  },
  getPendingRequestingTransactions: async (req, res) => {
    try {
      const pendingRequestingTransactions = await RequestingTransactionCollection.aggregate([
        {
          $match: {
            requestedItems: {
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
            requiredDate: 1,
            createdAt: 1,
            requestedItems: {
              $filter: {
                input: "$requestedItems",
                as: "requestedItems",
                cond: {
                  $eq: ["$$requestedItems.status", "pending"],
                },
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
      await ItemTypeCollection.populate(pendingRequestingTransactions, {
        path: "requestedItems.itemType",
        select: "name itemCode",
      });
      await DepartmentCollection.populate(pendingRequestingTransactions, {
        path: "department",
        select: "name",
      });
      return res.status(200).json({ pendingRequestingTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getApprovedRequestingTransactions: async (req, res) => {
    try {
      const approvedRequestingTransactions = await RequestingTransactionCollection.aggregate([
        {
          $match: {
            requestedItems: {
              $elemMatch: {
                status: "approved",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            department: 1,
            requiredDate: 1,
            createdAt: 1,
            requestedItems: {
              $filter: {
                input: "$requestedItems",
                as: "requestedItems",
                cond: {
                  $eq: ["$$requestedItems.status", "approved"],
                },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      await ItemTypeCollection.populate(approvedRequestingTransactions, {
        path: "requestedItems.itemType",
        select: "name itemCode",
      });
      await DepartmentCollection.populate(approvedRequestingTransactions, {
        path: "department",
        select: "name",
      });
      return res.status(200).json({ approvedRequestingTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default requestingTransactionCtrl;
