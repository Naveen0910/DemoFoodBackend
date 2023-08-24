import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

dotenv.config();

export const createDemoUser = async (req, res) => {
  try {
    const { userName, phoneNumber, emailId } = req.body;
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      userName,
      emailId,
      phoneNumber,
    });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ userInfo: user, token });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const verifyMobileNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log(phoneNumber);
    const doesUserExist = await User.findOne({ phoneNumber });
    if (doesUserExist) {
      return res.status(200).json(doesUserExist);
    }
    return res.status(404).json({ message: "User Not Found" });
  } catch (error) {
    return res.status(500).json(error); // Throw the error to be handled higher up the call stack
  }
};

export const verifyOtp = (otp) => {
  if (otp === "521232") {
    return true;
  } else {
    return false;
  }
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });

    const otpVerified = verifyOtp(otp);
    if (otpVerified) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({ userInfo: user, token });
    }
    return res.status(401).json({ message: "Invalid Otp" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
