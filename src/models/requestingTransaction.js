import mongoose from "mongoose";

const requestingTransactionSchema = mongoose.Schema(
  {
    requestorName: {
      type: String,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    requiredDate:Date,
  },
  { timestamps: true }
);

export default mongoose.model("Eequesting_Transaction", requestingTransactionSchema);
