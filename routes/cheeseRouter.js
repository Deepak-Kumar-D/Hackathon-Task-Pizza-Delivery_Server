import express from "express";
import { Cheese } from "../models/cheese.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const cheeseRouter = express.Router();

cheeseRouter.get("/cheese", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const cheese = await Cheese.find();

    if (cheese.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ cheese: cheese, user: user });
    }
  }
});

cheeseRouter.get("/admin-cheese", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const admin = await Admin.findOne({ _id: id });

  if (admin) {
    const cheese = await Cheese.find();

    if (cheese.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ cheese: cheese, admin: admin });
    }
  }
});

cheeseRouter.get("/user-cheese", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const cheese = await Cheese.find();

    if (cheese.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ cheese: cheese });
    }
  }
});

cheeseRouter.post("/remove-cheeseQty", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      const cheese = await Cheese.findOne({ name: ele.extras.cheese });
      cheese.quantity = cheese.quantity - 1;
      await cheese.save();

      if (cheese.quantity < 10) {
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
            <h3>The stock for ${cheese.name} is very low. Please update the stocks.</h3>\n
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
  response.json("Cheese list updated.");
});

cheeseRouter.post("/add-cheeseQty", async (request, response) => {
  const { id, qty } = request.body;

  const cheese = await Cheese.findOne({ _id: id });
  cheese.quantity = qty;
  await cheese.save();

  response.json("Stock updated!");
});

cheeseRouter.post("/add-cheese", async (request, response) => {
  const { name, quantity } = request.body;

  const cheese = await Cheese.findOne({ name: name });

  if (cheese) {
    return response.status(400).json("Cheese already exists.");
  } else {
    const newCheese = new Cheese({ name, quantity });
    newCheese.save();

    response.status(200).json("Cheese added successfully.");
  }
});

export { cheeseRouter };
