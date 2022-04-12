import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item_Type",
    },
    price:{
      type:Number,
      required:true,
    }
  },
  { timestamps: true,discriminatorKey: "type"  }
);

export default mongoose.model("Item", itemSchema);
