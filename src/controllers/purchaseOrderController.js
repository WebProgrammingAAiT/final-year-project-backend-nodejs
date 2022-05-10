import PurchaseOrderCollection from "../models/purchaseOrderModel.js";

const purchaseOrderCtrl = {
  addPurchaseOrder: async (req, res) => {
    try {
      const { purchaseOrderNumber, purchasedItems } = req.body;
      if (!purchaseOrderNumber || !purchasedItems || purchasedItems.length === 0) {
        return res.sendStatus(400);
      }
      const purchaseOrder = await PurchaseOrderCollection.create({
        purchaseOrderNumber,
        purchasedItems,
      });
      return res.status(201).json({ msg: " Purchase order created successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPurchaseOrders: async (req, res) => {
    try {
      const purchaseOrders = await PurchaseOrderCollection.find().populate("purchasedItems.itemType", "name itemCode");
      return res.status(200).json({ purchaseOrders });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPurchaseOrder: async (req, res) => {
    try {
      const { purchaseOrderNumber } = req.params;
      if (!purchaseOrderNumber) {
        return res.sendStatus(400);
      }
      const purchaseOrder = await PurchaseOrderCollection.findOne({ purchaseOrderNumber }).populate(
        "purchasedItems.itemType",
        "name itemCode"
      );
      if (!purchaseOrder) return res.status(404).json({ msg: "No purchase order with the specified purchase number found." });

      return res.status(200).json({ purchaseOrder });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default purchaseOrderCtrl;
