import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // transactionType: {
    //   type: String,
    //   enum: ["receive", "request", "return"],
    //   required: true,
    // },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, discriminatorKey: "type" }
);

export default mongoose.model("Transaction", transactionSchema);
