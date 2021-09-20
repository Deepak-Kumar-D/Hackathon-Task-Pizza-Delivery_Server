import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Admin } from "../models/admin.js";

const adminRouter = express.Router();

//add admin
adminRouter.post("/admin-register", async (request, response) => {
  const { name, email, phone, address, password } = request.body;

  if ((!name, !email, !phone, !address, !password)) {
    return response
      .status(422)
      .json({ error: "Please don't leave the field empty!" });
  }

  try {
    const isExist = await Admin.findOne({ email: email });

    if (isExist) {
      return response.status(422).json({ error: "Email-Id already exists!" });
    }

    let token = jwt.sign({ _id: Admin._id }, process.env.SECRET_KEY);

    const newAdmin = new Admin({
      name,
      email,
      phone,
      address,
      password,
      token,
    });
    await newAdmin.save();

    const sendMail = (ele) => {
      let Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: `"PIZZA TOWN"` + "<" + process.env.MAIL_USERNAME + ">",
        to: { name: ele.name, address: ele.email },
        subject: "Email Verification",
        html: `<p>Hi ${ele.name},</p>\n
          <h3>Click <a href="http://localhost:3000/admin-verify/${token}">here</a> to verify your account.</h3>\n
          <p>Regards,</p>\n
          <p>Pizza Town</p>\n
          <p>India</p>`,
      };

      Transport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Verification email sent!");
        }
      });
    };

    sendMail(newAdmin);

    response.status(201).json({ message: "Admin Added!" });
  } catch (err) {
    response.send(err);
  }
});

// Verifying the user
adminRouter.get("/admin-verify/:token", async (request, response) => {
  const { token } = request.params;

  const admin = await Admin.findOne({ token: token });

  if (admin) {
    if (admin.verified) {
      return response.json("Email is already verified");
    } else if (admin) {
      admin.verified = true;
      await admin.save();

      return response.json("Admin registered!");
    } else {
      return response.json("Admin not found!");
    }
  }
});

//Login
adminRouter.post("/admin-login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ error: "Please fill the fields!" });
    }

    const admin = await Admin.findOne({ email: email });

    if (admin) {
      if (admin.verified) {
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
          return response.status(400).json({ error: "Invalid Credentials!" });
        } else {
          const newToken = jwt.sign(
            { email: admin.email, _id: admin._id, type: admin.type },
            process.env.SECRET_KEY
          );

          return response.json({ admin: newToken });
        }
      } else {
        return response.status(400).json({ error: "Email-id not verified!" });
      }
    } else {
      return response.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (error) {
    console.log(error);
  }
});

//Dashboard
adminRouter.get("/admin-dashboard", async (request, response) => {
  const token = request.headers["x-access-token"];

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const email = decode.email;
    const admin = await Admin.findOne({ email: email });

    response.json(admin);
  } catch (error) {
    response.json(error);
  }
});

//Logout
adminRouter.get("/admin-logout", async (request, response) => {
  //   const isToken = request.cookies.jwtadmintoken;
  //   await Token.findOneAndRemove({ token: isToken });
  //   response.clearCookie("jwtadmintoken", { path: "token" });
  //   response.status(200).json("Admin logged out!");
});

export { adminRouter };
