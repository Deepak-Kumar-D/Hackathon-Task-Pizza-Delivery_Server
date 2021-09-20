import express from "express";
import { Order } from "../models/orders.js";
import { User } from "../models/users.js";
import { Admin } from "../models/admin.js";
import jwt from "jsonwebtoken";

const orderRouter = express.Router();

orderRouter.get("/orders", async (request, response) => {
  const orders = await Order.find();
  const token = request.headers["x-access-token"];

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const email = decode.email;
    const admin = await Admin.findOne({ email: email });

    if (orders.length === 0) {
      response.status(200).json("No orders placed.");
    } else {
      response.status(200).json({ orders: orders, user: admin });
    }
  } catch (error) {
    response.json(error);
  }
});

orderRouter.post("/add-order", async (request, response) => {
  const { total_quantity, total_price, items, userId, orderId } = request.body;

  const newCart = {};
  newCart.total_quantity = 0;
  newCart.total_price = 0;
  newCart.items = [];

  const newOrder = {};
  newOrder.orderId = orderId;
  newOrder.total_quantity = total_quantity;
  newOrder.total_price = total_price;
  newOrder.items = items;

  await User.findByIdAndUpdate(userId, {
    cart: newCart,
    $push: { orders: newOrder },
  });

  const user = await User.findOne({ _id: userId });

  const addOrder = new Order({
    user: userId,
    order: newOrder,
    address: user.address,
  });
  await addOrder.save();

  response.json("Order list updated!");
});

orderRouter.get("/user-orders", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  response.json(user);
});

orderRouter.get("/get-orders", async (request, response) => {
  const orders = await Order.find();
  response.json(orders);
});

orderRouter.post("/update-status", async (request, response) => {
  const { userId, listId, status, orderId } = request.body;

  const order = await Order.findOne({ _id: orderId });
  order.status = status;
  order.save();

  await User.updateOne(
    { _id: userId, "orders.orderId": listId },
    { $set: { "orders.$.status": status } }
  );

  response.json({ msg: "Order status updated" });
});

export { orderRouter };
