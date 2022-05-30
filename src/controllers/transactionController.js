import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import TransactionCollection from "../models/transactionModel.js";
import { customAlphabet } from "nanoid";

const alphabet = "0123456789-";
const nanoid = customAlphabet(alphabet, 21);

const transactionCtrl = {
  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.sendStatus(400);
      const transaction = await TransactionCollection.findById(id).populate(
        "user department requestedItems.itemType receivedItems.itemType receivedItems.subinventory transferredItems.itemType returnedItems.itemType",
        "username name"
      );

      if (!transaction) return res.status(404).json({ msg: "No transaction found" });

      return res.status(200).json({ transaction });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getTransactionByReceiptNumber: async (req, res) => {
    try {
      const { receiptNumber } = req.params;
      if (!receiptNumber) return res.sendStatus(400);
      const transaction = await TransactionCollection.findOne({ receiptNumber }).populate(
        "user department requestedItems.itemType receivedItems.itemType receivedItems.subinventory transferredItems.itemType returnedItems.itemType",
        "username name"
      );

      if (!transaction) return res.status(404).json({ msg: "No transaction found" });

      return res.status(200).json({ transaction });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getTransactions: async (req, res) => {
    try {
      const transactions = await TransactionCollection.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            receiptNumber: 1,
            "user.username": 1,
            createdAt: 1,
          },
        },
      ]);

      return res.status(200).json({ transactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default transactionCtrl;
