import mongoose from "mongoose";
import ItemTypeCollection from "../models/itemTypeModel.js";
import SubinventoryCollection from "../models/subinventoryModel.js";
import ItemCollection from "../models/itemModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import DepartmentItemCollection from "../models/departmentItemModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransaction.js";
import { customAlphabet } from "nanoid";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const itemCtrl = {
  addItemToSubinventoryNonPO: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const sess = await mongoose.startSession();
    sess.startTransaction();
    try {
      // itemsToBeAdded is a list of objects, with each object having {itemTypeId,subinventoryId,quantity,unitCost}
      // user and source will be be a single value for all items to be added
      const { itemsToBeAdded, user, source } = req.body;
      if (!itemsToBeAdded || itemsToBeAdded.length === 0 || !user || !source) {
        return res.sendStatus(400);
      }
      let mapOfItemTypeToItem = {};

      // iterating through each item found in items to be added
      // and checking if the itemType and subinventory id exists
      for (let i = 0; i < itemsToBeAdded.length; i++) {
        const item = itemsToBeAdded[i];
        const { itemTypeId, subinventoryId, quantity, unitCost } = item;

        if (!itemTypeId || !subinventoryId || !quantity || !unitCost) {
          return res.sendStatus(400);
        }
        if (typeof quantity != "number" || typeof unitCost != "number") {
          return res.status(400).json({ msg: "Inputs must be numbers" });
        }

        const itemType = await ItemTypeCollection.findById(itemTypeId);
        if (!itemType)
          return res
            .status(404)
            .json({ msg: "No itemType found with the specified id." });

        const subinventory = await SubinventoryCollection.findById(
          subinventoryId
        );
        if (!subinventory)
          return res
            .status(404)
            .json({ msg: "No subinventory found with the specified id." });

        // adding to our map with key itemTypeId and value {quantity,unitCost, subinventoryId}
        mapOfItemTypeToItem[itemTypeId] = {
          quantity,
          unitCost,
          subinventoryId,
        };
        // checking if array named items is found in the map with the key itemTypeId
        // if not instantiate an empty one for the current itemTypeId
        if (!mapOfItemTypeToItem[itemTypeId].items) {
          mapOfItemTypeToItem[itemTypeId].items = [];
        }
        // iterating through the quantity of the given item type
        // and adding it to the db, then pushing the id to the items array
        for (let j = 1; j <= quantity; j++) {
          const item = new SubinventoryItemCollection({
            itemType: itemTypeId,
            subinventory: subinventoryId,
          });
          const result = await item.save({ session: sess });

          mapOfItemTypeToItem[itemTypeId].items.push(result._id);
        }
      }
      // useful for setting the receiving transaction data
      let arrayOfReceivedItems = [];
      Object.keys(mapOfItemTypeToItem).map((key) =>
        arrayOfReceivedItems.push({
          itemType: key,
          quantity: mapOfItemTypeToItem[key].quantity,
          unitCost: mapOfItemTypeToItem[key].unitCost,
          subinventory: mapOfItemTypeToItem[key].subinventoryId,
          items: mapOfItemTypeToItem[key].items,
        })
      );

      await ReceivingTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            source,
            receivedItems: arrayOfReceivedItems,
          },
        ],
        { session: sess }
      );

      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await sess.commitTransaction();
      return res.status(201).json({ msg: "Item(s) added successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await sess.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      sess.endSession();
    }
  },
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
      const items = await SubinventoryItemCollection.find({ subinventory: id });
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addItemsToDepartment: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { requestedItems, user, department, requiredDate } = req.body;
      if (
        !requestedItems ||
        requestedItems.length === 0 ||
        !user ||
        !department ||
        !requiredDate
      ) {
        return res.sendStatus(400);
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
        if (!itemType)
          return res
            .status(404)
            .json({ msg: "No itemType found with the specified id." });

        //checking first if the quantity specified is in the db first
        const itemsInSubinventory =
          await SubinventoryItemCollection.countDocuments(
            {
              itemType: itemTypeId,
            },
            { session: session }
          ).exec();
        if (itemsInSubinventory < quantity) {
          const itemType = await ItemTypeCollection.findById(itemTypeId);
          return res.status(400).json({
            msg:
              "Not enough items in subinventory for item type " + itemType.name,
          });
        }
        // adding to our map with key itemTypeId and value {quantity}
        mapOfItemTypeToItem[itemTypeId] = {
          quantity,
        };
        // checking if array named items is found in the map with the key itemTypeId
        // if not instantiate an empty one for the current itemTypeId
        if (!mapOfItemTypeToItem[itemTypeId].items) {
          mapOfItemTypeToItem[itemTypeId].items = [];
        }
        // iterating through the quantity of the given item type
        // and changing it's type to department item, and setting department id, then pushing the id to the items array
        for (let j = 1; j <= quantity; j++) {
          const item = await SubinventoryItemCollection.findOne({
            itemType: itemTypeId,
          }).session(session);
          
           await ItemCollection.replaceOne(
            { _id: item._id },
            {
              itemType: itemTypeId,
              department,
              type: "Department_Item",
              createdAt: item.createdAt,
            },
            { session: session }
          );
          mapOfItemTypeToItem[itemTypeId].items.push(item._id);
        }
      }
      // useful for setting the requesting transaction data
      let arrayOfRequestedItems = [];
      Object.keys(mapOfItemTypeToItem).map((key) =>
        arrayOfRequestedItems.push({
          itemType: key,
          quantity: mapOfItemTypeToItem[key].quantity,
          items: mapOfItemTypeToItem[key].items,
        })
      );

      await RequestingTransactionCollection.create(
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

      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res
        .status(200)
        .json({ msg: "Item(s) added to department successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await sess.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
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
      if (!itemType)
        return res
          .status(404)
          .json({ msg: "No itemType found with the specified id." });

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
