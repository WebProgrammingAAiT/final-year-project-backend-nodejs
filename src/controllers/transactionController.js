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
      const transaction = await TransactionCollection.findById(id);

      if (!transaction) return res.status(404).json({ msg: "No transaction found" });

      return res.status(200).json({ transaction });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default transactionCtrl;
