import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      trim: true,
      required: true,
    },
    emailId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Check if it's a 10-digit number
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    isChef: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
