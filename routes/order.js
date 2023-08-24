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
router.get("/:venue/date/:date", protect, isChef, getOrders);
router.get("/:venue/allOrders", protect, isAdmin, getAllOrdersForAdmin);
router.get("/:venue/myOrders", protect, getMyOrders);
router.get("/:venue/Order/:orderId", adminOrUser, getOrderById);
router.put("/:venue/pay/:orderId", adminOrUser, updateOrderToPaid);
router.put("/:venue/deliver/:orderId", isChef, updateOrderToDelivered);
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
