import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/users.js";

const userRouter = express.Router();

//Add a user
userRouter.post("/register", async (request, response) => {
  const { name, email, phone, address, password } = request.body;

  if ((!name, !email, !phone, !address, !password)) {
    return response
      .status(422)
      .json({ error: "Please don't leave the field empty!" });
  }

  try {
    const isExist = await User.findOne({ email: email });

    if (isExist) {
      return response.status(422).json({ error: "Email-Id already exists!" });
    }

    let token = jwt.sign({ _id: User._id }, process.env.SECRET_KEY);

    const newUser = new User({ name, email, phone, address, password, token });
    await newUser.save();

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
        <h3>Click <a href="http://localhost:3000/verify/${ele.token}">here</a> to verify your account.</h3>\n
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

    sendMail(newUser);

    response.status(201).json({ message: "User Added!" });
  } catch (err) {
    response.send(err);
  }
});

// Verifying the user
userRouter.get("/verify/:token", async (request, response) => {
  const { token } = request.params;

  const user = await User.findOne({ token: token });

  if (user) {
    if (user.verified) {
      response.json("Email is already verified");
    } else if (user) {
      user.verified = true;
      await user.save();

      response.json("User registered!");
    } else {
      response.json("User not found!");
    }
  }
});

//Login
userRouter.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ error: "Please fill the fields!" });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      if (user.verified) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return response.status(400).json({ error: "Invalid Credentials!" });
        } else {
          const newToken = jwt.sign(
            { email: user.email, _id: user._id, type: user.type },
            process.env.SECRET_KEY
          );

          return response.json({ user: newToken });
        }
      } else {
        return response.status(400).json({ error: "Email-Id not verified!" });
      }
    } else {
      return response.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (error) {
    console.log(error);
  }
});

//Dashboard
userRouter.get("/dashboard", async (request, response) => {
  const token = request.headers["x-access-token"];

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const email = decode.email;
    const user = await User.findOne({ email: email });

    response.json(user);
  } catch (error) {
    response.json(error);
  }
  response.status(200);
});

export { userRouter };
