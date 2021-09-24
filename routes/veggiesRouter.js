import express from "express";
import { Veggies } from "../models/veggies.js";
import { Admin } from "../models/admin.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const veggiesRouter = express.Router();

veggiesRouter.get("/veggies", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const veggies = await Veggies.find();

    if (veggies.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ veggies: veggies, user: user });
    }
  }
});

veggiesRouter.get("/admin-veggies", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const admin = await Admin.findOne({ _id: id });

  if (admin) {
    const veggies = await Veggies.find();

    if (veggies.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ veggies: veggies, admin: admin });
    }
  }
});

veggiesRouter.get("/user-veggies", async (request, response) => {
  const token = request.headers["x-access-token"];

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const id = decode._id;

  const user = await User.findOne({ _id: id });

  if (user) {
    const veggies = await Veggies.find();

    if (veggies.length === 0) {
      response.status(200).json("Stock is empty.");
    } else {
      response.status(200).json({ veggies: veggies });
    }
  }
});

veggiesRouter.post("/remove-veggiesQty", async (request, response) => {
  const { items } = request.body;

  {
    items.forEach(async (ele) => {
      ele.extras.veggies.forEach(async (veg) => {
        const veggies = await Veggies.findOne({ name: veg });
        veggies.quantity = veggies.quantity - 1;
        await veggies.save();

        if (veggies.quantity < 10) {
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
            <h3>The stock for ${veggies.name} is very low. Please update the stocks.</h3>\n
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
  response.json("Veggies list updated.");
});

veggiesRouter.post("/add-veggiesQty", async (request, response) => {
  const { id, qty } = request.body;

  const veggies = await Veggies.findOne({ _id: id });
  veggies.quantity = qty;
  await veggies.save();

  response.json("Stock updated!");
});

veggiesRouter.post("/add-veggies", async (request, response) => {
  const { name, quantity } = request.body;

  const veggies = await Veggies.findOne({ name: name });

  if (veggies) {
    return response.status(400).json("Veggies already exists.");
  } else {
    const newVeggies = new Veggies({ name, quantity });
    newVeggies.save();

    response.status(200).json("Veggies added successfully.");
  }
});

export { veggiesRouter };
