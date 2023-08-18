import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const menuSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      required: true,
    },
    item: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
    },
    photo: {
      type: String,
    },
    venue: {
      type: String,
      required: true,
    },
    plates: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// export default menuSchema;
export default mongoose.model("Menu", menuSchema);
