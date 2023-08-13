import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  getAllOrdersForAdmin,
} from "../controllers/order.js";

const router = express.Router();

router.post("/", /* ProtectedRouteMiddleware ,*/ addOrderItems);
router.get(
  "/:date",
  /* ProtectedRouteMiddleware , AdminRouteMiddleware ,*/ getOrders
);
router.get("/", getAllOrdersForAdmin);
router.get("/myOrders", /* ProtectedRouteMiddleware ,*/ getMyOrders);
router.get("/:id", /* ProtectedRouteMiddleware  ,*/ getOrderById);
router.put("/:id/pay", /* ProtectedRouteMiddleware ,*/ updateOrderToPaid);
router.put(
  "/:id/deliver",
  /* ProtectedRouteMiddleware , AdminRouteMiddleware ,*/ updateOrderToDelivered
);

export default router;
