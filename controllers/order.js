import Order from "../models/OrderModel.js";
import Menu from "../models/menu.js";
import { format, startOfDay, parseISO, endOfDay } from "date-fns";
import { sse } from "../routes/sseRoute.js";
// import { sendMessage } from "./auth.js";

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

// export const addOrderItems = async (req, res) => {
//   const { venue } = req.params;
//   const { orderItems, totalPrice, phoneNumber } = req.body;
//   console.log(orderItems);
//   if (!orderItems || orderItems.length === 0) {
//     res.status(400).json({ error: "No Order Items" });
//     return;
//   }
//   try {
//     // Get the current date and format it as "dd-MM-yyyy"
//     const currentDate = new Date();
//     const formattedDate = format(currentDate, "dd-MM-yyyy");

//     // Get the count of orders for the current date
//     const getOrderCountForDateAndVenue = async (date, venue) => {
//       const orderCount = await Order.countDocuments({
//         venue: venue,
//         createdAt: {
//           $gte: new Date(date.setHours(0, 0, 0, 0)),
//           $lt: new Date(date.setHours(23, 59, 59, 999)),
//         },
//       });
//       return orderCount;
//     };
//     const orderCount = await getOrderCountForDateAndVenue(currentDate, venue);

//     // Generate the orderId based on the current date and orderCount
//     const orderId = `${formattedDate}_${venue}_order${orderCount + 1}`;

//     const order = new Order({
//       orderItems: orderItems.map((x) => ({
//         ...x,
//         product: x._id,
//         _id: undefined,
//       })),
//       totalPrice,
//       orderId,
//       phoneNumber,
//       venue,
//     });

//     const createdOrder = await order.save();
//     console.log(createdOrder);
//     sse.send(createdOrder, "newOrder");
//     res.status(201).json(createdOrder);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// };

const extractOrderNumber = (orderId) => {
  const parts = orderId.split("_");
  if (parts.length > 0) {
    return parts[parts.length - 1]; // Extract the last part of the split string
  }
  return orderId; // If splitting doesn't work, return the original orderId
};

export const addOrderItems = async (req, res) => {
  const { venue } = req.params;
  let { orderItems } = req.body;
  const { totalPrice, phoneNumber, cookingInstructions } = req.body;
  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ error: "No Order Items" });
    return;
  }
  orderItems = orderItems.map((orderItem) => {
    const { productId } = orderItem;

    if (!productId.endsWith(`_${venue}`)) {
      orderItem.productId = `${productId}_${venue}`;
    }

    return orderItem;
  });
  let canPlaceOrder = true;
  try {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "dd-MM-yyyy");

    const getOrderCountForDateAndVenue = async (date, venue) => {
      const orderCount = await Order.countDocuments({
        venue: venue,
        createdAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      });
      return orderCount;
    };

    const orderCount = await getOrderCountForDateAndVenue(currentDate, venue);
    const orderId = `${formattedDate}_${venue}_order${orderCount + 1}`;

    const updatedOrderItems = [];

    for (const orderItem of orderItems) {
      const { productId, qty } = orderItem;
      console.log(productId, qty);
      const menuEntry = await Menu.findOne({ productId: productId }); // Assuming you have a Menu model

      if (!menuEntry) {
        canPlaceOrder = false;
        res.status(400).json({
          error: `Product with productId ${productId} not found in menu`,
        });
        break;
      }

      if (menuEntry.plates < qty) {
        canPlaceOrder = false;
        res.status(400).json({
          error: `Not enough plates available for product ${productId}`,
        });
        break;
      }

      // Update the plates value in the menu collection
      //   await Menu.updateOne(
      //     { productId },
      //     { $inc: { plates: -qty } }
      //   );

      updatedOrderItems.push({
        ...orderItem,
        product: productId,
      });
    }

    if (canPlaceOrder) {
      for (const updatedOrderItem of updatedOrderItems) {
        const { productId, qty } = updatedOrderItem;

        await Menu.updateOne({ productId }, { $inc: { plates: -qty } });
      }
      const order = new Order({
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x._id,
          _id: undefined,
        })),
        totalPrice,
        phoneNumber,
        cookingInstructions,
        orderId,
        venue,
      });

      // send message to the user
      // const orderNumber = extractOrderNumber(orderId);
      // const message = `Order placed successfully! Your order Id is ${orderNumber}.`;
      // try {
      //   await sendMessage(phoneNumber, message);
      // } catch (error) {
      //   return res.status(500).json({ error: "Error sending Message" });
      // }

      // Save the order to the database
      await order.save();
      sse.send(order, "newOrder");
      res
        .status(201)
        .json({ message: "Order placed successfully", data: order });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the order" + error });
  }
};

// Updatind Order To Delivered
// Route GET /api/orders
// Access Admin or Chef
export const getOrders = async (req, res) => {
  try {
    const urlEncodedDate = req.params.date;
    const venue = req.params.venue;
    console.log(venue);
    console.log(urlEncodedDate);
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
    console.log(startOfDay, endOfDay);
    const orders = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      venue: venue,
    });
    if (orders) res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrdersForAdmin = async (req, res) => {
  const { venue } = req.params;
  console.log(venue);
  try {
    const orders = await Order.find({ venue });
    res.status(200).json(orders);
  } catch (er) {
    res.status(500).json({ message: er });
  }
};

// Getting logged in User all Orders
// Route GET /api/orders/myorders
// Access only for user
export const getMyOrders = async (req, res) => {
  const { venue } = req.params;
  const { phoneNumber } = req.body;
  const orders = await Order.find({ phoneNumber: phoneNumber, venue: venue });
  if (!orders || orders.length === 0) {
    res.status(400).json({ error: "No Order" });
    return;
  }
  res.status(200).json(orders);
};

// Getting Loggedin User Specific Order
// Route GET /api/orders/:id
// access User
export const getOrderById = async (req, res) => {
  const { venue, orderId } = req.params;
  const order = await Order.findOne({ venue: venue, orderId: orderId });
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
  const { venue, orderId } = req.params;
  const order = await Order.findOne({ venue: venue, orderId: orderId });
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
  const { venue, orderId } = req.params;
  const order = await Order.findOne({ venue: venue, orderId: orderId });
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
    const { venue, orderId } = req.params;
    const orderDetails = await Order.find({ orderId });
    const phoneNumber = orderDetails[0].phoneNumber;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId, venue: venue },
      { orderStatus: "preparing" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    sse.send(updatedOrder, "preparingOrder");

    // send message to the user
    const orderNumber = extractOrderNumber(orderId);
    const message = `Order confirmed!\nOrderID: ${orderNumber}\nStarted preparing, Thank you.`;
    try {
      // await sendMessage(phoneNumber, message);
    } catch (error) {
      return res.status(500).json({ error: "Error sending Message" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const Delivered = async (req, res) => {
  try {
    const { venue, orderId } = req.params;
    const orderDetails = await Order.find({ orderId });
    const phoneNumber = orderDetails[0].phoneNumber;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId, venue: venue },
      { orderStatus: "delivered" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    sse.send(updatedOrder, "deliveredOrder");

    // send message to the user
    const orderNumber = extractOrderNumber(orderId);
    const message = `OrderID: ${orderNumber}\nYour order is ready for pickup. Please collect. Thank you..`;
    try {
      // await sendMessage(phoneNumber, message);
    } catch (error) {
      return res.status(500).json({ error: "Error sending Message" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const ItemsQty = async (req, res) => {
  try {
    const { venue } = req.params;
    const preparingOrders = await Order.find({
      orderStatus: "preparing",
      venue: venue,
    });
    console.log(preparingOrders);
    const itemMap = new Map(); // Map to store item names and their quantities

    preparingOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const itemName = item.item;
        const itemQty = item.qty;

        if (itemMap.has(itemName)) {
          itemMap.set(itemName, itemMap.get(itemName) + itemQty);
        } else {
          itemMap.set(itemName, itemQty);
        }
      });
    });

    const distinctItemsWithQty = Array.from(itemMap.entries()).map(
      ([item, qty]) => ({
        item,
        qty,
      })
    );

    res.json(distinctItemsWithQty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
