import Order from "../models/OrderModel.js";
import { format, startOfDay, parseISO, endOfDay } from "date-fns";
import { sse } from "../routes/sseRoute.js";

// Create new Order
// Route POST /api/orders
// Access only for Admin nd Chef
// export const addOrderItems = async (req, res) => {
//   const { orderItems, totalPrice } = req.body;
//   console.log(orderItems);
//   if (orderItems && orderItems.length === 0) {
//     res.status(400).json({ error: "No Order Items" });
//   } else {
//     const order = new Order({
//       orderItems: orderItems.map((x) => ({
//         ...x,
//         product: x._id,
//         _id: undefined,
//       })),
//       // user: req.user._id, implement this once login is Done
//       totalPrice,
//     });
//     const createdOrder = await order.save();
//     res.status(201).json(createdOrder);
//   }
// };

// Helper function to get the count of orders for a specific date
const getOrderCountForDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await Order.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  return count;
};

export const addOrderItems = async (req, res) => {
  const { orderItems, totalPrice, phoneNumber } = req.body;
  console.log(orderItems);
  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ error: "No Order Items" });
    return;
  }
  try {
    // Get the current date and format it as "dd-MM-yyyy"
    const currentDate = new Date();
    const formattedDate = format(currentDate, "dd-MM-yyyy");

    // Get the count of orders for the current date
    const orderCount = await getOrderCountForDate(currentDate);

    // Generate the orderId based on the current date and orderCount
    const orderId = `${formattedDate}_order${orderCount + 1}`;

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      totalPrice,
      orderId, // Assign the generated orderId to the order
      phoneNumber,
    });

    const createdOrder = await order.save();
    console.log(createdOrder);
    sse.send(createdOrder, "newOrder");
    res.status(201).json(createdOrder);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// Getting logged in User all Orders
// Route GET /api/orders/myorders
// Access only for user
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
};

// Getting Loggedin User Specific Order
// Route GET /api/orders/:id
// access User
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  // .populate(
  //   "user",
  //   "name mobileNumber"
  // ); use this once Login Functionality is Done
  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404).json({ error: "Order Not Found" });
  }
};

// Updating Order (info Like Amount Paid)
// Route PUT /api/Orders/:id/pay
// acess Admin or chef
export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
  }
};

// Updating Order to Delivered
// PUT /api/orders/:id/deliver
// Access to Admin or Chef
export const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
  }
};

// Update Order to Preparing
// Route post /api/order
// Access admin or chef
export const updateOrderToPreparing = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "preparing" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const Delivered = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "delivered" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Updatind Order To Delivered
// Route GET /api/orders
// Access Admin or Chef
export const getOrders = async (req, res) => {
  try {
    const urlEncodedDate = req.params.date;
    const decodedDate = decodeURIComponent(urlEncodedDate);

    // Creating a new Date object from the decoded string
    const dateObject = new Date(decodedDate);

    // Converting to ISO string
    const isoDateString = dateObject.toISOString();

    // Construct a date range for the query
    const startOfDay = new Date(isoDateString);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObject);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Find orders placed on the similar date
    const orders = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    if (orders) res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (er) {
    res.status(500).json({ message: er });
  }
};
