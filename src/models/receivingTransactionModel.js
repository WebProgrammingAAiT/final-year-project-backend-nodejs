import mongoose from "mongoose";

const receivingTransactionSchema = mongoose.Schema(
  {
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    source: {
      type: String,
    },
    itemType: { type: mongoose.Schema.Types.ObjectId, ref: "Item_Type" },
    quantity: {
        type: Number,
        default:1,
    },
    unitCost:{
        type:Number,
        default:1,
    },
    subinventory: { type: mongoose.Schema.Types.ObjectId, ref: "Subinventory" },



  },
  { timestamps: true }
);

export default mongoose.model("Receiving_Transaction", receivingTransactionSchema);
