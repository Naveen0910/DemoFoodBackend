import Order from "../models/OrderModel.js";

// Create new Order
// Route POST /api/orders
// Access only for Admin nd Chef
export const addOrderItems = async (req, res) => {
  const { orderItems, totalPrice } = req.body;
  console.log(orderItems);
  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ error: "No Order Items" });
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      // user: req.user._id, implement this once login is Done
      totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
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
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name mobileNumber"
  );
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
  res.send("Update order to Paid");
};

// Updating Order to Delivered
// PUT /api/orders/:id/delivered
// Access to Admin or Chef
export const updateOrderToDelivered = async (req, res) => {
  res.send("Update Order to Delivered");
};

// Updatind Order To Delivered
// Route GET /api/orders
// Access Admin or Chef
export const getOrders = async (req, res) => {
  res.send("Orders of all Users to Chef or Admin");
};
