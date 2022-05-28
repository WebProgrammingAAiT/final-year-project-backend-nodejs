import TransactionCollection from "../models/transactionModel.js";
import BlockchainTransactionCollection from "../models/blockchainTransactionModel.js";
import smartContractInteraction from "./smartContractInteractionController.js";

const auditTrailCtrl = {
  validateTransactions: async (req, res) => {
    try {
      const transactions = await TransactionCollection.find({}).lean().limit(15).sort({ createdAt: -1 });
      let validTransactions = [];
      let invalidTransactions = [];
      let missingTransactions = [];
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        let blockchainTransaction = await BlockchainTransactionCollection.findOne({ transactionId: transaction._id }).lean();
        let result = await smartContractInteraction.validateTransaction(transaction);

        if (result == "valid") {
          validTransactions.push({ ethereumTxId: blockchainTransaction?.ethereumTxId, transactionId: transaction._id });
        } else if (result == "invalid") {
          invalidTransactions.push({ ethereumTxId: blockchainTransaction?.ethereumTxId, transactionId: transaction._id });
        } else {
          missingTransactions.push({ ethereumTxId: blockchainTransaction?.ethereumTxId, transactionId: transaction._id });
        }
      }
      return res.json({ validTransactions, invalidTransactions, missingTransactions });
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
      if (!transactionFromDb) {
        return res.status(404).json({ msg: "No transaction found" });
      }

      let transactionFromBlockchain = await smartContractInteraction.getTransaction(
        transactionFromDb._id,
        transactionFromDb.type
      );
      return res.json({ transactionFromDb, transactionFromBlockchain });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
export default auditTrailCtrl;
