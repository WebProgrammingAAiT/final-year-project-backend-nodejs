import mongoose from "mongoose";
import ItemCollection from "./itemModel.js";

const subinventoryItemSchema = mongoose.Schema(
  {
    
    subinventory: { type: mongoose.Schema.Types.ObjectId, ref: "Subinventory" },
    
  },
  { discriminatorKey: "type" }
);

export default ItemCollection.discriminator(
  "Subinventory_Item",
  subinventoryItemSchema
);
