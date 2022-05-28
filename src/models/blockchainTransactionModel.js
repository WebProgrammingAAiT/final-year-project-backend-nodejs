import mongoose from "mongoose";

const blockchainTransactionModel = mongoose.Schema(
  {
    ethereumTxId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blockchain_Transaction", blockchainTransactionModel);
