import mongoose from "mongoose";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import TransactionCollection from "../models/transactionModel.js";

const inquiryCtrl = {
  onHandInquiry: async (req, res) => {
    try {
      const { subinventory, endDate } = req.query;
      const items = await ReceivingTransactionCollection.aggregate([
        {
          $match: {
            type: "Receiving_Transaction",
          },
        },
        {
          $project: {
            _id: 1,
            receivedItems: {
              $filter: {
                input: "$receivedItems",
                as: "receivedItems",
                cond: {
                  $eq: ["$$receivedItems.subinventory", mongoose.Types.ObjectId("6252bbf785093e0c778f0621")],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: [
                {
                  $size: "$receivedItems",
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            "receivedItems.items": 1,
          },
        },
        {
          $unwind: {
            path: "$receivedItems",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$receivedItems",
          },
        },
        {
          $unwind: {
            path: "$items",
          },
        },
      ]);
      console.log(items.length);
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  trackItem: async (req, res) => {
    try {
      let { tagNumber } = req.query;
      if (!tagNumber) {
        return res.sendStatus(400);
      }
      tagNumber = mongoose.Types.ObjectId(tagNumber);
      const itemHistory = await TransactionCollection.aggregate([
        {
          $match: {
            $or: [
              {
                "receivedItems.items": tagNumber,
              },
              {
                "transferredItems.items": tagNumber,
              },
              {
                $and: [
                  {
                    "returnedItems.item": tagNumber,
                  },
                  {
                    "returnedItems.status": "approved",
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            receivedItems: 0,
            transferredItems: 0,
            returnedItems: 0,
          },
        },
      ]);
      return res.status(200).json({ itemHistory });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default inquiryCtrl;
