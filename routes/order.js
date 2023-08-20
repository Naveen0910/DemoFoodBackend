import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  getAllOrdersForAdmin,
  updateOrderToPreparing,
  Delivered,
  ItemsQty,
} from "../controllers/order.js";

const router = express.Router();

router.post("/:venue", /* ProtectedRouteMiddleware ,*/ addOrderItems);
router.get(
  "/:venue/date/:date",
  /* ProtectedRouteMiddleware , AdminRouteMiddleware ,*/ getOrders
);
router.get("/:venue/allOrders", getAllOrdersForAdmin);
router.get("/:venue/myOrders", /* ProtectedRouteMiddleware ,*/ getMyOrders);
router.get(
  "/:venue/Order/:orderId",
  /* ProtectedRouteMiddleware  ,*/ getOrderById
);
router.put(
  "/:venue/pay/:orderId",
  /* ProtectedRouteMiddleware ,*/ updateOrderToPaid
);
router.put(
  "/:venue/deliver/:orderId",
  /* ProtectedRouteMiddleware , AdminRouteMiddleware ,*/ updateOrderToDelivered
);
router.put(
  "/:venue/updateToPreparing/:orderId",
  /* Chef middleware */ updateOrderToPreparing
);

router.put("/:venue/updateToDelivered/:orderId", Delivered);

/* New Routes */

router.get("/:venue/items-qty", ItemsQty);

export default router;
