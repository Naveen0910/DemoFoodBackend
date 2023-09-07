import jwt, { decode } from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    console.log("Token:", token);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(error);
  }
};

export const adminOrUser = async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user.id);

  if (user || user.isAdmin === true) {
    next();
  } else {
    res.status(401).json({ error: "Not Authorised as Admin or Not User" });
  }
};

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user && user.isAdmin === true) {
    next();
  } else {
    res.status(401).json({ error: "Not Authorised as Admin" });
  }
};

export const isChef = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user && user.isChef === true) {
    next();
  } else {
    res.status(401).json({ error: "Not Authorised as Chef" });
  }
};

export const adminOrChef = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user && (user.isChef === true || user.isAdmin === true)) {
    next();
  } else {
    res.status(401).json({ error: "Only Chef or Admin can have access" });
  }
};

export const adminOrChefOrUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user || user.isChef === true || user.isAdmin === true) {
    next();
  } else {
    res.status(401).json({ error: "Please Login" });
  }
};
