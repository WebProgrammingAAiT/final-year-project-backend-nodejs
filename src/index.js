import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from './routes/authRoute.js';
import departmentRoute from './routes/departmentRoute.js';
import userRoute from './routes/userRoute.js';
import transactionRoute from './routes/transactionRoute.js';
import subinventoryRoute from './routes/subinventoryRoute.js';
import itemTypeRoute from './routes/itemTypeRoute.js';

// *Useful for getting environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
//TODO: set origin to the hosted site
app.use(cors({ credentials: true,  }));
app.use(cookieParser());

app.get("/", (req, res) => res.json("Online"));

app.use('/api',authRoute);
app.use('/api',departmentRoute);
app.use('/api',userRoute);
app.use('/api',transactionRoute);
app.use('/api',subinventoryRoute);
app.use('/api',itemTypeRoute);

//db connection
mongoose
  .connect(process.env.MONGODB_URL_ONLINE, { useNewUrlParser: true })
  .then(() => console.log("Connected to db"))
  .catch((error) => console.log(error));

  

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


