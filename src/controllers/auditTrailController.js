import TransactionCollection from "../models/transactionModel.js";
import BlockchainTransactionCollection from "../models/blockchainTransactionModel.js";
import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransactionModel.js";
import TransferringTransactionCollection from "../models/transferringTransactionModel.js";
import ReturningTransactionCollection from "../models/returningTransactionModel.js";
import mongoose from "mongoose";
import smartContractInteraction from "./smartContractInteractionController.js";

const auditTrailCtrl = {
  validateTransactions: async (req, res) => {
    // const transaction = await TransactionCollection.findById("6297e106b0b880eb305ddbf4").lean().sort({ createdAt: -1 });
    // let result = await smartContractInteraction.validateTransaction(transaction);
    // return res.json({ result });
    try {
      const transactions = await TransactionCollection.find({}).lean().sort({ createdAt: -1 }).limit(10);
      let transactionIdsFromDB = [];
      let validTransactions = [];
      let invalidTransactions = [];
      let missingTransactionsFromBlockchain = [];
      let missingTransactionsFromDB = [];
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        transactionIdsFromDB.push(transaction._id.toString());
        let blockchainTransaction = await BlockchainTransactionCollection.findOne({ transactionId: transaction._id }).lean();
        let result = await smartContractInteraction.validateTransaction(transaction);
        if (result == "valid") {
          validTransactions.push({ ethereumTxId: blockchainTransaction?.ethereumTxId, transactionId: transaction._id });
        } else if (result == "invalid" || result == "invalid status") {
          invalidTransactions.push({ ethereumTxId: blockchainTransaction?.ethereumTxId, transactionId: transaction._id });
        } else {
          missingTransactionsFromBlockchain.push({
            ethereumTxId: blockchainTransaction?.ethereumTxId,
            transactionId: transaction._id,
          });
        }
      }
      const transactionsFromBlockchain = await smartContractInteraction.getAuditedTransactions();

      missingTransactionsFromDB = transactionsFromBlockchain.filter((item) => transactionIdsFromDB.indexOf(item) === -1);

      return res.json({ validTransactions, invalidTransactions, missingTransactionsFromBlockchain, missingTransactionsFromDB });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  compareTransactions: async (req, res) => {
    try {
      let transactionId = req.params.transactionId;
      if (!transactionId) {
        return res.sendStatus(400);
      }
      let transactionFromDb = await TransactionCollection.findById(transactionId)
        .lean()
        .populate(
          "user department requestedItems.itemType receivedItems.itemType receivedItems.subinventory transferredItems.itemType returnedItems.itemType",
          "username name"
        );
      let transactionFromBlockchain;
      if (!transactionFromDb) {
        let typesOfTransactions = [
          "Receiving_Transaction",
          "Requesting_Transaction",
          "Transferring_Transaction",
          "Returning_Transaction",
        ];
        let counter = 0;
        do {
          transactionFromBlockchain = await smartContractInteraction.getTransaction(transactionId, typesOfTransactions[counter]);
          counter++;
        } while (transactionFromBlockchain.id == "");

        return res.json({ transactionFromBlockchain, transactionFromDb: {} });
      }

      transactionFromBlockchain = await smartContractInteraction.getTransaction(transactionFromDb._id, transactionFromDb.type);
      return res.json({ transactionFromDb, transactionFromBlockchain });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  restoreTransaction: async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ msg: "Transaction id is required" });
      }
      const transactionInDb = await TransactionCollection.findById(transactionId);
      if (transactionInDb) return res.status(400).json({ msg: "Transaction already exists" });
      let transactionFromBlockchain = {};
      let typesOfTransactions = [
        "Receiving_Transaction",
        "Requesting_Transaction",
        "Transferring_Transaction",
        "Returning_Transaction",
      ];
      let counter = 0;
      do {
        transactionFromBlockchain = await smartContractInteraction.getTransaction(transactionId, typesOfTransactions[counter]);
        counter++;
      } while (transactionFromBlockchain.id == "");

      if (transactionFromBlockchain.transactionType == "Receiving_Transaction") {
        transactionFromBlockchain._id = transactionFromBlockchain.id;
        for (let i = 0; i < transactionFromBlockchain.receivedItems.length; i++) {
          transactionFromBlockchain.receivedItems[i]._id = transactionFromBlockchain.receivedItems[i].id;
          transactionFromBlockchain.receivedItems[i].itemType = transactionFromBlockchain.receivedItems[i].itemTypeId;
          transactionFromBlockchain.receivedItems[i].subinventory = transactionFromBlockchain.receivedItems[i].subinventoryId;
        }
        const receivingTransaction = new ReceivingTransactionCollection(transactionFromBlockchain);
        await receivingTransaction.save();
      } else if (transactionFromBlockchain.transactionType == "Requesting_Transaction") {
        transactionFromBlockchain._id = transactionFromBlockchain.id;
        transactionFromBlockchain.department = transactionFromBlockchain.departmentId;
        for (let i = 0; i < transactionFromBlockchain.requestedItems.length; i++) {
          transactionFromBlockchain.requestedItems[i]._id = transactionFromBlockchain.requestedItems[i].id;
          transactionFromBlockchain.requestedItems[i].itemType = transactionFromBlockchain.requestedItems[i].itemTypeId;
          if (transactionFromBlockchain.requestedItems[i].resolvedBy.length > 0) {
            transactionFromBlockchain.requestedItems[i].resolvedBy = transactionFromBlockchain.requestedItems[i].resolvedBy;
          } else {
            delete transactionFromBlockchain.requestedItems[i].resolvedBy;
          }
        }
        const requestingTransaction = new RequestingTransactionCollection(transactionFromBlockchain);
        await requestingTransaction.save();
      }
      return res.json({ msg: "Successfully restored" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
export default auditTrailCtrl;
