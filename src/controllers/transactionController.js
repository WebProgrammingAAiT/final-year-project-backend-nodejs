import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import TransferringTransactionCollection from "../models/transferringTransactionModel.js";
import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import DepartmentCollection from "../models/departmentModel.js";
import ItemTypeCollection from "../models/itemTypeModel.js";
import TransactionCollection from "../models/transactionModel.js";

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
  getRecentRequestingAndReturningTransactions: async (req, res) => {
    try {
      let now = new Date();
      let startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const recentTransactions = await TransactionCollection.aggregate([
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
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);

      const pendingReturningTransactionsGroupedByDepartments = await ReturningTransactionCollection.aggregate([
        {
          $match: {
            returnedItems: {
              $elemMatch: {
                status: "pending",
              },
            },
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $project: {
            _id: 1,
            department: 1,
            returnedDate: 1,
            returnedItems: {
              $filter: {
                input: "$returnedItems",
                as: "returnedItems",
                cond: {
                  $eq: ["$$returnedItems.status", "pending"],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$department",
            totalItemsReturned: {
              $sum: {
                $cond: {
                  if: {
                    $isArray: "$returnedItems",
                  },
                  then: {
                    $size: "$returnedItems",
                  },
                  else: "NA",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $unwind: {
            path: "$department",
          },
        },
        {
          $project: {
            _id: 0,
            "department._id": 1,
            "department.name": 1,
            totalItemsReturned: 1,
          },
        },
      ]);
      const pendingRequestingTransactions = await RequestingTransactionCollection.aggregate([
        {
          $match: {
            requestedItems: {
              $elemMatch: {
                status: "pending",
              },
            },
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $project: {
            _id: 1,
            department: 1,
            requiredDate: 1,
            requestedItems: {
              $filter: {
                input: "$requestedItems",
                as: "requestedItems",
                cond: {
                  $eq: ["$$requestedItems.status", "pending"],
                },
              },
            },
          },
        },
      ]);
      await ItemTypeCollection.populate(pendingRequestingTransactions, {
        path: "requestedItems.itemType",
        select: "name itemCode",
      });
      await DepartmentCollection.populate(pendingRequestingTransactions, {
        path: "department",
        select: "name",
      });

      let numberOfReceivedTransactionsToday = await ReceivingTransactionCollection.aggregate([
        {
          // useful to set the default of isReturn to false
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  isReturn: false,
                },
                "$$ROOT",
              ],
            },
          },
        },
        {
          $match: {
            type: "Receiving_Transaction",
            isReturn: false,
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $count: "value",
        },
      ]);
      let numberOfTransferredTransactionsToday = await TransferringTransactionCollection.aggregate([
        {
          $match: {
            type: "Transferring_Transaction",
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $count: "value",
        },
      ]);
      let numberOfReturnedTransactionsToday = await ReturningTransactionCollection.aggregate([
        {
          $match: {
            type: "Returning_Transaction",
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $count: "value",
        },
      ]);
      let numberOfRequestedTransactionsToday = await RequestingTransactionCollection.aggregate([
        {
          $match: {
            type: "Requesting_Transaction",
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $count: "value",
        },
      ]);
      if (!numberOfReceivedTransactionsToday[0]) {
        numberOfReceivedTransactionsToday = 0;
      } else {
        numberOfReceivedTransactionsToday = numberOfReceivedTransactionsToday[0].value;
      }
      if (!numberOfTransferredTransactionsToday[0]) {
        numberOfTransferredTransactionsToday = 0;
      } else {
        numberOfTransferredTransactionsToday = numberOfTransferredTransactionsToday[0].value;
      }
      if (!numberOfReturnedTransactionsToday[0]) {
        numberOfReturnedTransactionsToday = 0;
      } else {
        numberOfReturnedTransactionsToday = numberOfReturnedTransactionsToday[0].value;
      }
      if (!numberOfRequestedTransactionsToday[0]) {
        numberOfRequestedTransactionsToday = 0;
      } else {
        numberOfRequestedTransactionsToday = numberOfRequestedTransactionsToday[0].value;
      }

      return res.status(200).json({
        numberOfReceivedTransactionsToday,
        numberOfTransferredTransactionsToday,
        numberOfReturnedTransactionsToday,
        numberOfRequestedTransactionsToday: numberOfRequestedTransactionsToday,
        pendingReturningTransactionsGroupedByDepartments,
        pendingRequestingTransactions,
        recentTransactions,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default transactionCtrl;
