import express from "express";
import {
  createDemoUser,
  login,
  verifyMobileNumber,
} from "../controllers/auth.js";

const router = express.Router();

// router.post("/login", verifyMobileNumber)
// router.post("/login", verifyOtp)
router.post("/verifyNumber", verifyMobileNumber);
router.post("/register", createDemoUser);
router.post("/login", login);

export default router;
