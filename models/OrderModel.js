import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   // required: true, implement this once user Login is Done
    //   ref: "User",
    // },
    orderItems: [
      {
        item: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        photo: { type: String },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      default: "justPlaced",
    },
    cookingInstructions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
