import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import fast2sms from 'fast-two-sms';

dotenv.config();

export const generateOTP = (otp_length) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export const sendMessage = async (phoneNumber, message) => {
  try {
    const response = await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS,
      message: message,
      numbers: [phoneNumber],
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (req, res) => {
  try {
    const { userName, phoneNumber, emailId } = req.body;
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP(6); // Change 6 to the desired OTP length
    const message = `Your OTP is ${otp}. Do not share it with anyone.`;

    // Send OTP via SMS
    try {
      await sendMessage(phoneNumber, message);
    } catch (error) {
      return res.status(500).json({ error: "Error sending OTP" });
    }

    const user = await User.create({
      userName,
      emailId,
      phoneNumber,
      OTP: otp, // Store OTP in the user schema
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
      // Generate OTP
      const otp = generateOTP(6); // Change 6 to the desired OTP length
      const message = `Your OTP is ${otp}. Do not share it with anyone.`;
      // console.log(message)
      // Send OTP via SMS
      try {
        await sendMessage(phoneNumber, message);
      } catch (error) {
        return res.status(500).json({ error: "Error sending OTP" });
      }

      // Store the OTP in the user schema
      await User.updateOne({ phoneNumber }, { OTP: otp });

      return res.status(200).json(doesUserExist);
    }
    return res.status(404).json({ message: "User Not Found" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const verifyOtp = (enteredOtp, storedOtp) => {
  // return enteredOtp === storedOtp;
  console.log("loki",enteredOtp,storedOtp)
  return String(enteredOtp) === String(storedOtp);
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const otpVerified = verifyOtp(otp, user.OTP);

    if (otpVerified) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({ userInfo: user, token });
    }

    return res.status(401).json({ message: "Invalid OTP" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// export const createUser = async (req, res) => {
//   try {
//     const { userName, phoneNumber, emailId } = req.body;
//     const existingUser = await User.findOne({ phoneNumber });

//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     const user = await User.create({
//       userName,
//       emailId,
//       phoneNumber,
//     });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       res.status(201).json({ userInfo: user, token });
//     } else {
//       res.status(400).json({ message: "Invalid User Data" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// };

// export const verifyMobileNumber = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     console.log(phoneNumber);
//     const doesUserExist = await User.findOne({ phoneNumber });
//     if (doesUserExist) {
//       return res.status(200).json(doesUserExist);
//     }
//     return res.status(404).json({ message: "User Not Found" });
//   } catch (error) {
//     return res.status(500).json(error); // Throw the error to be handled higher up the call stack
//   }
// };

// export const verifyOtp = (otp) => {
//   if (otp === "521232") {
//     return true;
//   } else {
//     return false;
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     const user = await User.findOne({ phoneNumber });

//     const otpVerified = verifyOtp(otp);
//     if (otpVerified) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       return res.status(200).json({ userInfo: user, token });
//     }
//     return res.status(401).json({ message: "Invalid Otp" });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal server error" });
//   }
// };
