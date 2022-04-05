import ReceivingTransactionCollection from "../models/receivingTransactionModel.js";
import RequestingTransactionCollection from "../models/requestingTransaction.js";
import ReturningTransactionCollection from "../models/returningTransaction.js";
import { customAlphabet } from 'nanoid';
const alphabet = '0123456789-';
const nanoid = customAlphabet(alphabet, 21);

const transactionCtrl = {
  addRecievingTransaction: async (req, res) => {
    try {
      const {
        
        user,
        source,
        itemType,
        quantity,
        unitCost,
        subinventory,
      } = req.body;
      
      //TODO: uncomment the below once itemmodel and subinventory are added
    //   if (
       
    //     !user ||
    //     !source ||
    //     !itemType ||
    //     !quantity ||
    //     !unitCost ||
    //     !subinventory
    //   ) {
    //     return res.sendStatus(400);
    //   }

      await ReceivingTransactionCollection.create({
        receiptNumber:nanoid(),
        user,
        source,
        itemType,
        quantity,
        unitCost,
        subinventory,
      });

      return res
        .status(201)
        .json({ msg: "Receiving Transaction added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addReturningTransaction: async (req, res) => {
    try {
      const {
        user,
        returnerName,
        department,
        item,
        
      } = req.body;

      //TODO: uncomment the below once itemmodel and subinventory are added
    //   if (
       
    //     !user||
    //     !item ||
    //     !returnerName ||
    //     !department
    //   ) {
    //     return res.sendStatus(400);
    //   }

      await ReturningTransactionCollection.create({
          user,
        receiptNumber:nanoid(),
        returnerName,
        department,
        item,
      });

      return res
        .status(201)
        .json({ msg: "Returning Transaction added successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getReceivingTransactions: async (req, res) => {

    try {
      const receivingTransactions = await ReceivingTransactionCollection.find();
      return res.status(200).json({ receivingTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getReturningTransactions: async (req, res) => {

    try {
      const returningTransactions = await ReturningTransactionCollection.find();
      return res.status(200).json({ returningTransactions });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

export default transactionCtrl