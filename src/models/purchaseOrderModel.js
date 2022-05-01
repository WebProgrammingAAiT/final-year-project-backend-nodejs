import mongoose from "mongoose";

const purchaseOrderSchema = mongoose.Schema(
  {
    purchaseOrderNumber: Number,
    purchasedItems: [
      {
        itemType: { type: mongoose.Schema.Types.ObjectId, ref: "Item_Type" },
        quantity: {
          type: Number,
          default: 1,
        },
        unitCost: {
          type: Number,
          default: 1,
        },
        totalCost: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Purchase_Order", purchaseOrderSchema);
