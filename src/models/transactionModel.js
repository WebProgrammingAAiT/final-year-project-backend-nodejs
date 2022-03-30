import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    recieptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum: ["receive", "request", "return"],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
