import mongoose from "mongoose";
import TransactionCollection from "./transactionModel.js";

const returningTransactionSchema = mongoose.Schema(
  {
    
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { discriminatorKey: "type" }
);

export default TransactionCollection.discriminator(
  "Returning_Transaction",
  returningTransactionSchema
);
