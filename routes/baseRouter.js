import express from "express";
import { Base } from "../models/base.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const baseRouter = express.Router();

baseRouter.get("/base", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const base = await Base.find();

    if (base.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ base: base, user: user });
    }
  }
});

baseRouter.get("/admin-base", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const admin = await Admin.findOne({ _id: id });

  if (admin) {
    const base = await Base.find();

    if (base.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ base: base, admin: admin });
    }
  }
});

baseRouter.get("/user-baseQty", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const base = await Base.find();

    if (base.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ base: base });
    }
  }
});

baseRouter.post("/remove-baseQty", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      const base = await Base.findOne({ name: ele.extras.base });
      base.quantity = base.quantity - 1;
      await base.save();

      if (base.quantity < 10) {
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
              <h3>The stock for ${base.name} is very low. Please update the stocks.</h3>\n
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
  response.json("Base list updated.");
});

baseRouter.post("/add-baseQty", async (request, response) => {
  const { id, qty } = request.body;

  const base = await Base.findOne({ _id: id });
  base.quantity = qty;
  await base.save();

  response.json("Stock updated!");
});

baseRouter.post("/add-base", async (request, response) => {
  const { name, quantity } = request.body;

  const base = await Base.findOne({ name: name });

  if (base) {
    return response.status(400).json("Base already exists.");
  } else {
    const newBase = new Base({ name, quantity });
    newBase.save();

    response.status(200).json("Base added successfully.");
  }
});

export { baseRouter };
