import mongoose from "mongoose";

const itemTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    itemCode:{
        type: String,
        unique: true,
        required: true,
    }
    
  },
  { timestamps: true }
);

export default mongoose.model("Item_Type", itemTypeSchema);
