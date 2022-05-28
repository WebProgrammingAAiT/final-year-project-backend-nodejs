import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import userRoute from "./routes/userRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import subinventoryRoute from "./routes/subinventoryRoute.js";
import itemTypeRoute from "./routes/itemTypeRoute.js";
import itemRoute from "./routes/itemRoute.js";
import transferringTransactionRoute from "./routes/transferringTransactionRoute.js";
import requestingTransactionRoute from "./routes/requestingTransactionRoute.js";
import receivingTransactionRoute from "./routes/receivingTransactionRoute.js";
import returningTransactionRoute from "./routes/returningTransactionRoute.js";
import purchaseOrderRoute from "./routes/purchaseOrderRoute.js";
import inquiryRoute from "./routes/inquiryRoute.js";
import auditTrailRoute from "./routes/auditTrailRoute.js";

// *Useful for getting environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
//TODO: set origin to the hosted site
app.use(cors({ credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => res.json("Online"));

app.use("/api", authRoute);
app.use("/api", departmentRoute);
app.use("/api", userRoute);
app.use("/api", transactionRoute);
app.use("/api", subinventoryRoute);
app.use("/api", itemTypeRoute);
app.use("/api", itemRoute);
app.use("/api", receivingTransactionRoute);
app.use("/api", requestingTransactionRoute);
app.use("/api", transferringTransactionRoute);
app.use("/api", returningTransactionRoute);
app.use("/api", purchaseOrderRoute);
app.use("/api", inquiryRoute);
app.use("/api", auditTrailRoute);

//db connection
mongoose
  .connect(process.env.MONGODB_URL_ONLINE, { useNewUrlParser: true })
  .then(() => console.log("Connected to db"))
  .catch((error) => console.log(error));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
