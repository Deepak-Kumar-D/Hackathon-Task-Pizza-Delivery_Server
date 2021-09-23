import express from "express";
import { Meat } from "../models/meat.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const meatRouter = express.Router();

meatRouter.get("/meat", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const meat = await Meat.find();

    if (meat.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ meat: meat, user: user });
    }
  }
});

meatRouter.get("/user-meats", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const meats = await Meat.find();

    if (meats.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ meats: meats });
    }
  }
});

meatRouter.post("/remove-meatQty", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      ele.extras.meat.forEach(async (nonveg) => {
        const meat = await Meat.findOne({ name: nonveg });
        meat.quantity = meat.quantity - 1;
        await meat.save();

        if (meat.quantity < 10) {
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
            <h3>The stock for ${meat.name} is very low. Please update the stocks.</h3>\n
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
    });
  }
  response.json("Meat list updated.");
});

meatRouter.post("/add-meatQty", async (request, response) => {
  const { id, qty } = request.body;

  const meat = await Meat.findOne({ _id: id });
  meat.quantity = qty;
  await meat.save();

  response.json("Stock updated!");
});

meatRouter.post("/add-meat", async (request, response) => {
  const { name, quantity } = request.body;

  const meat = await Meat.findOne({ name: name });

  if (meat) {
    return response.status(400).json("Meat already exists.");
  } else {
    const newMeat = new Meat({ name, quantity });
    newMeat.save();

    response.status(200).json("Meat added successfully.");
  }
});

export { meatRouter };
