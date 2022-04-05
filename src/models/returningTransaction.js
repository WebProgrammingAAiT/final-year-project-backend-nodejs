import mongoose from "mongoose";

const returningTransactionSchema = mongoose.Schema(
  {
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    returnerName: {
      type: String,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Returning_Transaction",
  returningTransactionSchema
);
