import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    itemTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item_Type",
    },
    subinventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subinventory",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
