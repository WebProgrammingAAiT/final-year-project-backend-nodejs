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
  createUser: async (user, createdBy) => {
    let createdUser = JSON.parse(JSON.stringify(user));
    const tx = await auditTrailContract.createUser(createdUser._id, createdUser.username, createdBy, createdUser.createdAt);
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: createdUser._id });
  },
  getUser: async (userId) => {
    const user = await auditTrailContract.getUser(userId);
    let { id, username, createdBy, timestamp } = user;
    return { id, username, createdBy, timestamp };
  },
  createReceiveTransaction: async (transactionPopulated, transactionNormal) => {
    let receivingTransactionNormal = JSON.parse(JSON.stringify(transactionNormal));
    let receivingTransaction = JSON.parse(JSON.stringify(transactionPopulated));
    let itemsOfInterest = [];
    let newItems = [];
    let id = receivingTransaction._id;
    let { isReturn, receiptNumber, user, source, createdAt, updatedAt } = receivingTransaction;

    for (let i = 0; i < receivingTransaction.receivedItems.length; i++) {
      let receivedItem = receivingTransaction.receivedItems[i];
      let { itemType, subinventory, quantity, unitCost, _id: objId } = receivedItem;
      let itemTypeId = itemType._id;
      let itemTypeName = itemType.name;
      let subinventoryId = subinventory._id;
      let subinventoryName = subinventory.name;
      itemsOfInterest.push([
        objId,
        itemTypeId,
        itemTypeName,
        quantity.toString(),
        unitCost.toString(),
        subinventoryId,
        subinventoryName,
      ]);
      newItems.push(receivedItem.items);
    }
    //removing updated at field from data hash as it can change
    delete receivingTransactionNormal.updatedAt;
    delete receivingTransactionNormal.__v;

    let dataHash = hash(receivingTransactionNormal);

    const tx = await auditTrailContract.createReceivingTransaction(
      dataHash,
      id,
      isReturn.toString(),
      source,
      receiptNumber,
      user,
      "Receiving_Transaction",
      itemsOfInterest,
      newItems,
      createdAt,
      updatedAt
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  createRequestingTransaction: async (transactionPopulated, transactionNormal) => {
    let requestingTransactionNormal = JSON.parse(JSON.stringify(transactionNormal));
    let requestingTransaction = JSON.parse(JSON.stringify(transactionPopulated));

    let itemsOfInterest = [];
    let id = requestingTransaction._id;
    let { receiptNumber, user, department, requiredDate, createdAt, updatedAt } = requestingTransaction;
    let departmentId = department._id;
    let departmentName = department.name;

    for (let i = 0; i < requestingTransaction.requestedItems.length; i++) {
      let requestedItem = requestingTransaction.requestedItems[i];
      let { itemType, status, quantity, _id: objId } = requestedItem;
      let itemTypeId = itemType._id;
      let itemTypeName = itemType.name;
      // the empty strings are for resolvedBy and remarks
      itemsOfInterest.push([objId, itemTypeId, itemTypeName, status, "", "", quantity.toString()]);
      //removing status so as to not include it in the hash
      delete requestingTransactionNormal.requestedItems[i].status;
    }
    //removing updated at field from data hash as it can change
    delete requestingTransactionNormal.updatedAt;
    delete requestingTransactionNormal.__v;
    let dataHash = hash(requestingTransactionNormal);

    const tx = await auditTrailContract.createRequestingTransaction(
      dataHash,
      id,
      departmentId,
      departmentName,
      requiredDate,
      receiptNumber,
      user,
      "Requesting_Transaction",
      itemsOfInterest,
      createdAt,
      updatedAt
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  updateStatus: async (txId, transactionType, index, status, remark, resolvedBy, updatedAt) => {
    await auditTrailContract.updateStatus(
      txId,
      transactionType,
      index.toString(),
      status,
      remark,
      resolvedBy.toString(),
      JSON.parse(JSON.stringify(updatedAt))
    );
  },
  createTransferringTransaction: async (transactionPopulated, transactionNormal) => {
    let transferringTransactionNormal = JSON.parse(JSON.stringify(transactionNormal));
    let transferringTransaction = JSON.parse(JSON.stringify(transactionPopulated));
    let itemsOfInterest = [
      transferringTransaction.transferredItems["itemType"]._id,
      transferringTransaction.transferredItems["itemType"].name,
      transferringTransaction.transferredItems["quantity"].toString(),
    ];
    let newItems = transferringTransaction.transferredItems.items;

    let id = transferringTransaction._id;
    let { requestingTransaction, department, receiptNumber, user, createdAt, updatedAt } = transferringTransaction;
    let departmentId = department._id;
    let departmentName = department.name;
    //removing updated at field from data hash as it can change
    delete transferringTransactionNormal.updatedAt;
    delete transferringTransactionNormal.__v;
    let dataHash = hash(transferringTransactionNormal);

    const tx = await auditTrailContract.createTransferringTransaction(
      dataHash,
      id,
      requestingTransaction,
      departmentId,
      departmentName,
      receiptNumber,
      user,
      "Transferring_Transaction",
      itemsOfInterest,
      newItems,
      createdAt,
      updatedAt
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  createReturningTransaction: async (transactionPopulated, transactionNormal) => {
    let returningTransactionNormal = JSON.parse(JSON.stringify(transactionNormal));
    let returningTransaction = JSON.parse(JSON.stringify(transactionPopulated));
    let itemsOfInterest = [];

    let id = returningTransaction._id;
    let { receiptNumber, user, department, returnedDate, createdAt, updatedAt } = returningTransaction;
    let departmentId = department._id;
    let departmentName = department.name;

    for (let i = 0; i < returningTransaction.returnedItems.length; i++) {
      let returnedItem = returningTransaction.returnedItems[i];
      let { item, itemType, status, _id: objId } = returnedItem;
      let itemTypeId = itemType._id;
      let itemTypeName = itemType.name;
      // the empty string is for resolvedBy
      itemsOfInterest.push([objId, item, itemTypeId, itemTypeName, status, ""]);
      //removing status so as to not include it in the hash
      delete returningTransactionNormal.returnedItems[i].status;
    }
    //removing updated at field from data hash as it can change
    delete returningTransactionNormal.updatedAt;
    delete returningTransactionNormal.__v;
    let dataHash = hash(returningTransactionNormal);

    const tx = await auditTrailContract.createReturningTransaction(
      dataHash,
      id,
      departmentId,
      departmentName,
      returnedDate,
      receiptNumber,
      user,
      "Returning_Transaction",
      itemsOfInterest,
      createdAt,
      updatedAt
    );
    await BlockchainTransactionCollection.create({ ethereumTxId: tx.hash, transactionId: id });
  },
  validateTransaction: async (transaction) => {
    transaction = JSON.parse(JSON.stringify(transaction));
    let statuses = [];
    if (transaction.type == "Requesting_Transaction") {
      for (let i = 0; i < transaction.requestedItems.length; i++) {
        statuses.push(transaction.requestedItems[i].status);
        delete transaction.requestedItems[i].status;
        delete transaction.requestedItems[i].resolvedBy;
        delete transaction.requestedItems[i].remark;
      }
    } else if (transaction.type == "Returning_Transaction") {
      for (let i = 0; i < transaction.returnedItems.length; i++) {
        statuses.push(transaction.returnedItems[i].status);
        delete transaction.returnedItems[i].status;
        delete transaction.returnedItems[i].resolvedBy;
      }
    }
    delete transaction.updatedAt;
    delete transaction.__v;

    let dataHash = hash(transaction);
    const validate = await auditTrailContract.validateTransaction(transaction._id, dataHash, transaction.type, statuses);
    return validate;
  },
  getTransaction: async (transactionId, type) => {
    transactionId = transactionId.toString();
    if (type == "Receiving_Transaction") {
      const received = await auditTrailContract.getReceivingTransaction(transactionId);

      let {
        id,
        source,
        isReturn,
        user,
        receiptNumber,
        transactionType,
        receivedItems: receivedItemsFromBlockchain,
        createdAt,
        updatedAt,
      } = received;
      let receivedItems = [];
      for (let i = 0; i < receivedItemsFromBlockchain.length; i++) {
        let receivedItem = receivedItemsFromBlockchain[i];
        let { id, itemTypeId, itemTypeName, quantity, unitCost, subinventoryId, subinventoryName, items } = receivedItem;
        receivedItems.push({ id, itemTypeId, itemTypeName, quantity, unitCost, subinventoryId, subinventoryName, items });
      }
      let transaction = { id, source, isReturn, user, receiptNumber, transactionType, receivedItems, createdAt, updatedAt };

      return transaction;
    } else if (type == "Requesting_Transaction") {
      const request = await auditTrailContract.getRequestingTransaction(transactionId);

      let {
        id,
        departmentId,
        departmentName,
        requiredDate,
        user,
        receiptNumber,
        transactionType,
        requestedItems: requestedItemsFromBlockchain,
      } = request;
      let requestedItems = [];
      for (let i = 0; i < requestedItemsFromBlockchain.length; i++) {
        let requestedItem = requestedItemsFromBlockchain[i];
        let { id, itemTypeId, itemTypeName, quantity, status } = requestedItem;
        requestedItems.push({ id, itemTypeId, itemTypeName, quantity, status });
      }
      let transaction = { id, user, departmentId, departmentName, requiredDate, receiptNumber, transactionType, requestedItems };
      return transaction;
    } else if (type == "Transferring_Transaction") {
      const transfer = await auditTrailContract.getTransferTransaction(transactionId);
      let {
        id,
        departmentId,
        departmentName,
        requestingTransaction,
        user,
        receiptNumber,
        transactionType,
        transferredItems: transferredItemsFromBlockchain,
      } = transfer;

      let { itemTypeId, itemTypeName, quantity, items } = transferredItemsFromBlockchain;
      let transferredItems = { itemTypeId, itemTypeName, quantity, items };

      let transaction = {
        id,
        user,
        departmentId,
        departmentName,
        requestingTransaction,
        receiptNumber,
        transactionType,
        transferredItems,
      };
      return transaction;
    } else {
      const returned = await auditTrailContract.getReturningTransaction(transactionId);
      let {
        id,
        departmentId,
        departmentName,
        returnedDate,
        user,
        receiptNumber,
        transactionType,
        returnedItems: returnedItemsFromBlockchain,
      } = returned;
      let returnedItems = [];
      for (let i = 0; i < returnedItemsFromBlockchain.length; i++) {
        let returnedItem = returnedItemsFromBlockchain[i];
        let { id, item, itemTypeId, itemTypeName, status } = returnedItem;
        returnedItems.push({ id, item, itemTypeId, itemTypeName, status });
      }
      let transaction = { id, departmentId, departmentName, user, returnedDate, receiptNumber, transactionType, returnedItems };
      return transaction;
    }
  },
  getAuditedTransactions: async () => {
    const audited = await auditTrailContract.getAllTransactions();
    return audited;
  },
};
export default smartContractInteraction;
