import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    /* Need to add user ref */
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
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
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
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
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
