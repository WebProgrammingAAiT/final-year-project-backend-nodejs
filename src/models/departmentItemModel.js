import mongoose from "mongoose";
import ItemCollection from "./itemModel.js";

const departmentItemSchema = mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    markedForReturn: { type: Boolean, default: false },
  },
  { discriminatorKey: "type" }
);

export default ItemCollection.discriminator("Department_Item", departmentItemSchema);
