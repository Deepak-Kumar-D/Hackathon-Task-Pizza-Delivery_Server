import express from "express";
import { Product } from "../models/product.js";
import { Admin } from "../models/admin.js";
import jwt from "jsonwebtoken";

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

productRouter.post("/add-products", async (request, response) => {
  const { name, src, price, quantity } = request.body;

  const product = await Product.findOne({ name: name });

  if (product) {
    return response.status(400).json("Product already exists.");
  }

  const newProduct = new Product({ name, src, price, quantity });
  newProduct.save();

  response.status(200).json("Product added successfully.");
});

export { productRouter };
