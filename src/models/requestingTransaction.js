import mongoose from "mongoose";
import TransactionCollection from './transactionModel.js'

const requestingTransactionSchema = mongoose.Schema(
  {
    requestorName: {
      type: String,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    requiredDate: Date,
    requestedItems: [
      {
        itemType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "pending",
        },
      },
    ],
  },
  { discriminatorKey: 'type' }

);

export default TransactionCollection.discriminator(
  "Requesting_Transaction",
  requestingTransactionSchema
);
