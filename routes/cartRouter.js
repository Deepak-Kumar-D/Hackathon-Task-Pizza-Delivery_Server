import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/users.js";

const cartRouter = express.Router();

cartRouter.post("/add-cart", async (request, response) => {
  let { userId, items, total, qty } = request.body;

  const newCart = {};
  newCart.total_quantity = qty;
  newCart.total_price = total;
  newCart.items = [];

  items.forEach((item) => {
    newCart.items.push(item);
  });

  try {
    items = await User.findByIdAndUpdate(userId, {
      cart: newCart,
    });

    return response.status(200).json("Cart Saved Successfully");
  } catch (error) {
    console.log(error);
  }
});

cartRouter.get("/get-cart", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  const showCart = {};

  showCart.total_quantity = user.cart.total_quantity;
  showCart.total_price = user.cart.total_price;
  showCart.items = user.cart.items;

  response.json(showCart);
});

// cartRouter.patch("/remove-cart", async (request, response) => {
//   let { userId, items, total, qty } = request.body;

//   const newCart = {};
//   newCart.total_quantity = qty;
//   newCart.total_price = total;
//   newCart.items = [];

//   items.forEach((item) => {
//     newCart.items.push(item);
//   });

//   console.log(items);

//   try {
//     items = await User.findByIdAndUpdate(userId, {
//       cart: newCart,
//     });

//     console.log(items);
//     response.status(200).json("Cart Saved Successfully");
//   } catch (error) {
//     console.log(error);
//   }
// });

export { cartRouter };
