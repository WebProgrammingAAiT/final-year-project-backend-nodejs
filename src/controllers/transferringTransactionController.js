import mongoose from "mongoose";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import TransferringTransactionCollection from "../models/transferringTransactionModel.js";
import ItemCollection from "../models/itemModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import smartContractInteraction from "./smartContractInteractionController.js";

import { customAlphabet } from "nanoid";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const transferringTransactionCtrl = {
  transferItems: async (req, res) => {
    // instantiating a session so that if any of the queries fail, the entire transaction will be rolled back
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { requestingTransactionId, itemTypeId, quantity, user, department } = req.body;
      if (!requestingTransactionId || !itemTypeId || !quantity || !user || !department) {
        return res.sendStatus(400);
      }

      if (typeof quantity != "number") {
        return res.status(400).json({ msg: "Quantity Input must be a number" });
      }

      const requestingTransaction = await RequestingTransactionCollection.findById(requestingTransactionId);
      if (!requestingTransaction)
        return res.status(404).json({
          msg: "No requesting transaction found with the specified id.",
        });

      //checking if the itemType exists
      const itemType = await ItemTypeCollection.findById(itemTypeId);
      if (!itemType) return res.status(404).json({ msg: "No itemType found with the specified id." });

      //checking first if the quantity specified is available in the db first
      const itemsInSubinventory = await SubinventoryItemCollection.find({
        itemType: itemTypeId,
      })
        .session(session)
        .limit(quantity);

      if (itemsInSubinventory.length < quantity) {
        return res.status(400).json({ msg: "Not enough items in subinventory for item type" });
      }

      let itemsToBeTransferred = [];
      // iterating through the quantity of the given item type
      // and changing it's type to department item, and setting department id, then pushing the id to the itemsToBeTransferred array
      for (let j = 0; j < quantity; j++) {
        const item = itemsInSubinventory[j];

        await ItemCollection.replaceOne(
          { _id: item._id },
          {
            itemType: itemTypeId,
            price: item.price,
            department,
            type: "Department_Item",
            createdAt: item.createdAt,
          },
          { session: session }
        );
        itemsToBeTransferred.push(item._id);
      }

      // updating the requestingTransaction with the given itemType to approved
      requestingTransaction.requestedItems = requestingTransaction.requestedItems.map((item) => {
        if (item.itemType == itemTypeId) {
          return { ...item, status: "approved" };
        }
        return item;
      });
      await requestingTransaction.save({ session: session });

      let transaction = await TransferringTransactionCollection.create(
        [
          {
            receiptNumber: nanoid(),
            user,
            department,
            requestingTransaction: requestingTransactionId,
            transferredItems: {
              itemType: itemTypeId,
              items: itemsToBeTransferred,
              quantity,
            },
          },
        ],
        { session: session }
      );
      // refetching the transaction created with the lean() option,
      // so it's smaller in size and benefit JSON.stringify()
      let tPopulated = await TransferringTransactionCollection.findById(transaction[0]._id)
        .lean()
        .populate("department transferredItems.itemType", "name")
        .session(session);
      //not populated document (useful for hashing)

      let tNormal = await TransferringTransactionCollection.findById(transaction[0]._id).lean().session(session);
      await smartContractInteraction.createTransferringTransaction(tPopulated, tNormal);
      // only at this point the changes are saved in DB. Anything goes wrong, everything will be rolled back
      await session.commitTransaction();
      return res.status(200).json({ msg: "Item(s) added to department successfully" });
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

export default transferringTransactionCtrl;
