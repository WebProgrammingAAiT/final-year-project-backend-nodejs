import mongoose from "mongoose";
import TransactionCollection from "./transactionModel.js";

const transferTransactionSchema = mongoose.Schema(
  {
    //used to get the model 20 receipt from requestingTransaction collection
    requestingTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requesting_Transaction",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    transferredItems: {
      itemType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item_Type",
        required: true,
      },
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
    },
  },
  { discriminatorKey: "type" }
);

export default TransactionCollection.discriminator("Transferring_Transaction", transferTransactionSchema);
