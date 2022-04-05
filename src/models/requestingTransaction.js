import mongoose from "mongoose";

const requestingTransactionSchema = mongoose.Schema(
  {
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
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
  { timestamps: true }
);

export default mongoose.model(
  "Requesting_Transaction",
  requestingTransactionSchema
);
