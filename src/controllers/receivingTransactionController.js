import mongoose from "mongoose";
import SubinventoryCollection from "../models/subinventoryModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import PurchaseOrderCollection from "../models/purchaseOrderModel.js";
import { customAlphabet } from "nanoid";
import smartContractInteraction from "./smartContractInteractionController.js";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const receivingTransactionCtrl = {
  addItemToSubinventoryNonPO: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
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
        if (!itemType) return res.status(404).json({ msg: "No itemType found with the specified id." });

        const subinventory = await SubinventoryCollection.findById(subinventoryId);
        if (!subinventory) return res.status(404).json({ msg: "No subinventory found with the specified id." });

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
            price: unitCost,
            subinventory: subinventoryId,
          });
          const result = await item.save({ session: session });

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

      let transaction = await ReceivingTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            source,
            receivedItems: arrayOfReceivedItems,
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let t = await ReceivingTransactionCollection.findById(transaction[0]._id).lean().session(session);
      await smartContractInteraction.createReceiveTransaction(t);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(201).json({ msg: "Item(s) added successfully" });
    } catch (err) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      return res.status(500).json({ msg: err.message });
    } finally {
      // Ending the session
      session.endSession();
    }
  },
  addItemToSubinventoryPO: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // itemsToBeAdded is a list of objects, with each object having {itemTypeId,subinventoryId,quantity,unitCost}
      // user and source will be be a single value for all items to be added
      const { itemsToBeAdded, user, purchaseOrderNumber } = req.body;
      if (!itemsToBeAdded || itemsToBeAdded.length === 0 || !user || !purchaseOrderNumber) {
        return res.sendStatus(400);
      }
      const purchaseOrder = await PurchaseOrderCollection.findOne({
        purchaseOrderNumber,
      });
      if (!purchaseOrder) {
        return res.status(404).json({ msg: "No purchase order found with the specified purchase number." });
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
        if (!itemType) return res.status(404).json({ msg: "No itemType found with the specified id." });

        const subinventory = await SubinventoryCollection.findById(subinventoryId);
        if (!subinventory) return res.status(404).json({ msg: "No subinventory found with the specified id." });

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
            price: unitCost,
            subinventory: subinventoryId,
          });
          const result = await item.save({ session: session });

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

      const transaction = await ReceivingTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            source: purchaseOrderNumber,
            receivedItems: arrayOfReceivedItems,
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let t = await ReceivingTransactionCollection.findById(transaction[0]._id).lean().session(session);
      await smartContractInteraction.createReceiveTransaction(t);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(201).json({ msg: "Item(s) added successfully" });
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

export default receivingTransactionCtrl;
