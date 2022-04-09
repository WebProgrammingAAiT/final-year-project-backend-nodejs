import mongoose from "mongoose";
import UserCollection from "./userModel.js";

const departmentUserSchema = mongoose.Schema(
  {
    
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    
  },
  { discriminatorKey: "type" }
);

export default UserCollection.discriminator(
  "Department_User",
  departmentUserSchema
);
