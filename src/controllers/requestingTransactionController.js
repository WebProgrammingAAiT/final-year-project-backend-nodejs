import mongoose from "mongoose";

import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import SubinventoryItemCollection from "../models/subinventoryItemModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import { customAlphabet } from "nanoid";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const requestingTransactionCtrl = {
  requestItems: async (req, res) => {
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
      }
      // useful for setting the requesting transaction data
      let arrayOfRequestedItems = [];
      Object.keys(mapOfItemTypeToItem).map((key) =>
        arrayOfRequestedItems.push({
          itemType: key,
          quantity: mapOfItemTypeToItem[key].quantity,
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
        .json({ msg: "Item(s) requested successfully" });
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

export default requestingTransactionCtrl;
