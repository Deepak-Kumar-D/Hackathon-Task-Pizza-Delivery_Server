import express from "express";
import { User } from "../models/users.js";
import { Admin } from "../models/admin.js";
import { ForgotPassword } from "../models/forgotPassword.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const passRouter = express.Router();

passRouter.post("/forgot-password", async (request, response) => {
  const { email } = request.body;

  try {
    const isUser = await User.findOne({ email: email });
    const isAdmin = await Admin.findOne({ email: email });

    let isCheck = undefined;

    if (isUser) {
      isCheck = isUser;
    } else {
      isCheck = isAdmin;
    }

    if (!isCheck) {
      return response.status(422).json({ error: "Email not valid!" });
    }

    let token = jwt.sign({ _id: isCheck._id }, process.env.SECRET_KEY);

    const newToken = new ForgotPassword({ userId: isCheck._id, token: token });

    newToken.save();

    const sendMail = (ele) => {
      let transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: '"Pizza Town"' + `"<"${process.env.MAIL_USERNAME}>`,
        to: { name: ele.name + " " + ele.name, address: email },
        subject: "Password Reset",
        html: `<p>Dear ${ele.name},</p>\n
          <h3>Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your account password.</h3>\n
          <p style="margin: 0;">Regards,</p>\n
          <p style="margin: 0;">Pizza Town</p>\n
          <p style="margin: 0;">India</p>\n`,
      };

      transport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Password reset mail sent!");
        }
      });
    };

    sendMail(isCheck);

    response.status(201).json({ message: "Email sent for password change!" });
  } catch (error) {
    console.log(error);
  }
});

passRouter.post("/reset-password/:token", async (request, response) => {
  const { token } = request.params;
  const { password } = request.body;

  const verifyToken = await ForgotPassword.findOne({ token: token });

  if (verifyToken) {
    const isUser = await User.findById({ _id: verifyToken.userId });
    const isAdmin = await Admin.findById({ _id: verifyToken.userId });

    let isCheck = undefined;

    if (isUser) {
      isCheck = isUser;
    } else {
      isCheck = isAdmin;
    }

    isCheck.password = password;
    await isCheck.save();
    await verifyToken.delete();

    response.status(201).json({ message: "Password reset success!" });
  } else {
    response.status(422).json({ error: "Invalid attemp!" });
  }
});

export { passRouter };
