import EventEmitter from "events";
import dotenv from "dotenv";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const contractJson = require("../contracts/AuditTrail.json"); // use the require method
import { ethers } from "ethers";
dotenv.config();

const { CONTRACT_ADDRESS, ALCHEMY_URL, PRIVATE_KEY } = process.env;
const provider = new ethers.providers.AlchemyProvider("rinkeby", ALCHEMY_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const auditTrailContract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, signer);

const trails = [];
const transactionsList = []; // store a list of transactions
const trailsUpdate = new EventEmitter();

const smartContractInteraction = {
  createReceiveTransaction: async (id, receiptNumber, user, source, itemsofinterest, newitems, tid, dataHash) => {
    console.log("found auditTrailContract ", auditTrailContract);
    return;
    // const tx = await auditTrailContract.receivedTransaction(id, receiptNumber, user, source, itemsofinterest, newitems);
    // console.log(tx.hash);
    // hash = tx.hash;
    // trails.push({ id: tid, data: dataHash, hash: hash });
    // trailsUpdate.emit("NewTrail", trails[trails.length - 1]);
    // await tx.wait();
    // trailsUpdate.emit("StatusChanged", "Complete");
    // console.log("completed");
  },
};
export default smartContractInteraction;
