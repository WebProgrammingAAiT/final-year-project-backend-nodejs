import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "propertyAdminUser","departmentUser"],
      default: "departmentUser",
    },
    department:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
