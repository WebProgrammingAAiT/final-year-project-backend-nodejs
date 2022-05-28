import dotenv from "dotenv";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const contractJson = require("../contracts/TransactionFactory.json"); // use the require method
import { ethers } from "ethers";
import hash from "object-hash";
import BlockchainTransactionCollection from "../models/blockchainTransactionModel.js";
dotenv.config();

const { CONTRACT_ADDRESS, ALCHEMY_KEY, PRIVATE_KEY } = process.env;
const provider = new ethers.providers.AlchemyProvider("rinkeby", ALCHEMY_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const auditTrailContract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, signer);

const smartContractInteraction = {
  createReceiveTransaction: async (transaction) => {
    let receivingTransaction = JSON.parse(JSON.stringify(transaction));
    let itemsOfInterest = [];
    let newItems = [];
    let id = receivingTransaction._id;
    let { receiptNumber, user, source } = receivingTransaction;

    for (let i = 0; i < receivingTransaction.receivedItems.length; i++) {
      let receivedItem = receivingTransaction.receivedItems[i];
      let { itemType, subinventory, quantity, unitCost, _id: objId } = receivedItem;
      itemsOfInterest.push([objId, itemType, quantity.toString(), unitCost.toString(), subinventory]);
      newItems.push(receivedItem.items);
    }

    let dataHash = hash(receivingTransaction);

    const tx = await auditTrailContract.createReceivingTransaction(
      dataHash,
      id,
      source,
      receiptNumber,
      user,
      "Receiving_Transaction",
      itemsOfInterest,
      newItems
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  createRequestingTransaction: async (transaction) => {
    let requestingTransaction = JSON.parse(JSON.stringify(transaction));

    let itemsOfInterest = [];
    let id = requestingTransaction._id;
    let { receiptNumber, user, department, requiredDate } = requestingTransaction;
    for (let i = 0; i < requestingTransaction.requestedItems.length; i++) {
      let requestedItem = requestingTransaction.requestedItems[i];
      let { itemType, status, quantity, _id: objId } = requestedItem;
      itemsOfInterest.push([objId, itemType, status, quantity.toString()]);
    }
    let dataHash = hash(requestingTransaction);

    const tx = await auditTrailContract.createRequestingTransaction(
      dataHash,
      id,
      department,
      requiredDate,
      receiptNumber,
      user,
      "Requesting_Transaction",
      itemsOfInterest
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  createTransferringTransaction: async (transaction) => {
    let transferringTransaction = JSON.parse(JSON.stringify(transaction));
    let itemsOfInterest = [
      transferringTransaction.transferredItems["itemType"],
      transferringTransaction.transferredItems["quantity"].toString(),
    ];
    let newItems = transferringTransaction.transferredItems.items;

    let id = transferringTransaction._id;
    let { requestingTransaction, department, receiptNumber, user } = transferringTransaction;

    let dataHash = hash(transferringTransaction);

    const tx = await auditTrailContract.createTransferringTransaction(
      dataHash,
      id,
      requestingTransaction,
      department,
      receiptNumber,
      user,
      "Transferring_Transaction",
      itemsOfInterest,
      newItems
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  createReturningTransaction: async (transaction) => {
    let returningTransaction = JSON.parse(JSON.stringify(transaction));
    let itemsOfInterest = [];

    let id = returningTransaction._id;
    let { receiptNumber, user, department, returnedDate } = returningTransaction;

    for (let i = 0; i < returningTransaction.returnedItems.length; i++) {
      let returnedItem = returningTransaction.returnedItems[i];
      let { item, itemType, status, _id: objId } = returnedItem;
      itemsOfInterest.push([objId, item, itemType, status]);
    }
    let dataHash = hash(returningTransaction);

    const tx = await auditTrailContract.createReturningTransaction(
      dataHash,
      id,
      department,
      returnedDate,
      receiptNumber,
      user,
      "Returning_Transaction",
      itemsOfInterest
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
};
export default smartContractInteraction;
