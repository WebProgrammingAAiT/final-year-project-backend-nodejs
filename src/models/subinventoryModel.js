import mongoose from "mongoose";

const subinventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subinventory", subinventorySchema);
