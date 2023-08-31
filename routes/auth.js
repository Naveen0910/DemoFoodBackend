import express from "express";
import {
  createUser,
  login,
  verifyMobileNumber,
} from "../controllers/auth.js";

const router = express.Router();

// router.post("/login", verifyMobileNumber)
// router.post("/login", verifyOtp)
router.post("/verifyNumber", verifyMobileNumber);
router.post("/register", createUser);
router.post("/login", login);

export default router;
