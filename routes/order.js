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
import {
  protect,
  isAdmin,
  isChef,
  adminOrChef,
  adminOrUser,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/:venue", protect, adminOrUser, addOrderItems);
router.get("/:venue/date/:date", protect, adminOrChef, getOrders);
router.get("/:venue/allOrders", protect, isAdmin, getAllOrdersForAdmin);
router.post("/:venue/myOrders", protect, getMyOrders);
router.get("/:venue/Order/:orderId", protect, adminOrUser, getOrderById);
router.put("/:venue/pay/:orderId", protect, adminOrUser, updateOrderToPaid);
router.put("/:venue/deliver/:orderId", protect, isChef, updateOrderToDelivered);
router.put(
  "/:venue/updateToPreparing/:orderId",
  protect,
  isChef,
  updateOrderToPreparing
);

router.put("/:venue/updateToDelivered/:orderId", protect, Delivered);

/* New Routes */

router.get("/:venue/items-qty", protect, adminOrChef, ItemsQty);

export default router;
