import mongoose from "mongoose";

const departmentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        itemType:{
          type: mongoose.Schema.Types.ObjectId, ref: "Item_Type" ,
          ref:'Item_Type',
        }
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
