import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      default: 'Tech-M'
    },
    quantity: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
    },
    photo: {
      // data: Buffer,
      // contentType: String,
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to automatically generate productId
// productSchema.pre("save", function (next) {
//   if (!this.productId) {
//     let count = 1;
//     const self = this;
//     mongoose.models["Product"].countDocuments(function (err, res) {
//       if (err) {
//         return next(err);
//       }
//       count = res + 1;
//       self.productId = `item${count}`;
//       next();
//     });
//   } else {
//     next();
//   }
// });

export default mongoose.model("Product", productSchema);

