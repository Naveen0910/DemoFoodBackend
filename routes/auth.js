import express from "express";
import {
  createUser,
  login,
  // newUserMobileVerification,
  verifyMobileNumber,
} from "../controllers/auth.js";

const router = express.Router();

// router.post("/login", verifyMobileNumber)
// router.post("/login", verifyOtp)
router.post("/verifyNumber", verifyMobileNumber);
router.post("/register", createUser);
router.post("/login", login);
// router.post("/register/verifyotp", newUserMobileVerification);
export default router;
