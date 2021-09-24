import express from "express";
import { Sauce } from "../models/sauce.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const sauceRouter = express.Router();

sauceRouter.get("/sauce", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const sauce = await Sauce.find();

    if (sauce.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ sauce: sauce, user: user });
    }
  }
});

sauceRouter.get("/admin-sauce", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const admin = await Admin.findOne({ _id: id });

  if (admin) {
    const sauce = await Sauce.find();

    if (sauce.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ sauce: sauce, admin: admin });
    }
  }
});

sauceRouter.get("/user-sauces", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const sauces = await Sauce.find();

    if (sauces.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ sauces: sauces });
    }
  }
});

sauceRouter.post("/remove-sauceQty", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      const sauce = await Sauce.findOne({ name: ele.extras.sauce });
      sauce.quantity = sauce.quantity - 1;
      await sauce.save();

      if (sauce.quantity < 10) {
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
            <h3>The stock for ${sauce.name} is very low. Please update the stocks.</h3>\n
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
  response.json("Sauce list updated.");
});

sauceRouter.post("/add-sauceQty", async (request, response) => {
  const { id, qty } = request.body;

  const sauce = await Sauce.findOne({ _id: id });
  sauce.quantity = qty;
  await sauce.save();

  response.json("Stock updated!");
});

sauceRouter.post("/add-sauce", async (request, response) => {
  const { name, quantity } = request.body;

  const sauce = await Sauce.findOne({ name: name });

  if (sauce) {
    return response.status(400).json("Sauce already exists.");
  } else {
    const newSauce = new Sauce({ name, quantity });
    newSauce.save();

    response.status(200).json("Sauce added successfully.");
  }
});

export { sauceRouter };
