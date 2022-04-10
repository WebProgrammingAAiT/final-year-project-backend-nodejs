import mongoose from "mongoose";
import TransactionCollection from "./transactionModel.js";

const receivingTransactionSchema = mongoose.Schema(
  {
    source: {
      type: String,
    },
    receivedItems: [
      {
        itemType: { type: mongoose.Schema.Types.ObjectId, ref: "Item_Type" },
        items: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
          },
        ],
        quantity: {
          type: Number,
          default: 1,
        },
        unitCost: {
          type: Number,
          default: 1,
        },
        subinventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subinventory",
        },
      },
    ],
  },
  { discriminatorKey: "type" }
);

export default TransactionCollection.discriminator(
  "Receiving_Transaction",
  receivingTransactionSchema
);
