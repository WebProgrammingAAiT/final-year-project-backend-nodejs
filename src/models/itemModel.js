import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item_Type",
    },
    subinventory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subinventory",
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
