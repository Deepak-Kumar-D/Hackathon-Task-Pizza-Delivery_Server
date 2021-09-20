import express from "express";
import { Product } from "../models/product.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const productRouter = express.Router();

productRouter.get("/products", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const admin = await Admin.findOne({ _id: id });

  if (admin) {
    const products = await Product.find();

    if (products.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ products: products, admin: admin });
    }
  }
});

productRouter.get("/user-products", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const products = await Product.find();

    if (products.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ products: products });
    }
  }
});

// productRouter.post("/add-products", async (request, response) => {
//   const { name, src, price, quantity } = request.body;

//   const product = await Product.findOne({ name: name });

//   if (product) {
//     return response.status(400).json("Product already exists.");
//   }

//   const newProduct = new Product({ name, src, price, quantity });
//   newProduct.save();

//   response.status(200).json("Product added successfully.");
// });

productRouter.post("/remove-quantity", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      const product = await Product.findOne({ _id: ele.productId });
      product.quantity = product.quantity - ele.quantity;
      await product.save();

      if (product.quantity < 10) {
        const sendMail = () => {
          let Transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
            },
          });

          let mailOptions = {
            from: `"PIZZA TOWN"` + "<" + process.env.MAIL_USERNAME + ">",
            to: { name: "Automated", address: process.env.MAIL_USERNAME },
            subject: "Stock Update",
            html: `<p>Dear Admin,</p>\n
            <h3>The stock for ${product.name} is very low. Please update the stocks.</h3>\n
            <p>Regards,</p>\n
            <p>Pizza Town</p>\n
            <p>India</p>`,
          };

          Transport.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log(error);
            } else {
              console.log("Stock maintainance mail sent!");
            }
          });
        };

        sendMail();
      }
    });
  }
  response.json("Product list updated.");
});

productRouter.post("/add-quantity", async (request, response) => {
  const { id, qty } = request.body;

  const product = await Product.findOne({ _id: id });
  product.quantity = qty;
  await product.save();

  response.json("Stock updated!");
});

export { productRouter };
