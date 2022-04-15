import mongoose from "mongoose";
import TransactionCollection from "./transactionModel.js";

const returningTransactionSchema = mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    returnedDate: Date,
    returnedItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "pending",
        },
      },
    ],
  },
  { discriminatorKey: "type" }
);

export default TransactionCollection.discriminator(
  "Returning_Transaction",
  returningTransactionSchema
);
