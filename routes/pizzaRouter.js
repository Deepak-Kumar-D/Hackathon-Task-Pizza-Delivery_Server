import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { User } from "../models/pizzaTown.js";
import { Authenticate } from "../middleware/authenticate.js";

const pizzaRouter = express.Router();

// Find users
pizzaRouter.get("/users", Authenticate, async (request, response) => {
  const users = await User.find();

  response.send(users);
});

//Add a user
pizzaRouter.post("/register", async (request, response) => {
  const { name, email, phone, address, password } = request.body;

  if ((!name, !email, !phone, !address, !password)) {
    return response
      .status(422)
      .json({ error: "Please don't leave the field empty!" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
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
        html: `<p>Hi ${ele.name},</p>\n<h3>Click <a href="http://localhost:3000/verify/${ele.token}">here</a> to verify your account.</h3>\n
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
pizzaRouter.get("/verify/:token", async (request, response) => {
  const { token } = request.params;

  const user = await User.findOne({ token: token });

  if (user.verified) {
    response.json("Email is already verified");
  } else if (user) {
    user.verified = true;
    await user.save();

    response.send("User registered!");
  } else {
    response.json("User not found!");
  }
});

//Login
pizzaRouter.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ error: "Please fill the fields!" });
    }

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      const token = await userLogin.generateAuthToken();

      response.cookie("jwttoken", token, {
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      if (!isMatch) {
        response.status(400).json({ error: "Invalid Credentials!" });
      } else {
        response.json({ message: "User Login Success!" });
      }
    } else {
      response.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (error) {
    console.log(error);
  }
});

//Dashboard
pizzaRouter.get("/dashboard", Authenticate, (request, response) => {
  console.log("Hello to dashboard");
  response.send(request.isUser);
});

//Logout
pizzaRouter.get("/logout", (request, response) => {
  console.log("You're logged out!");
  response.clearCookie("jwttoken", { path: "/" });
  response.status(200).send("User logout!");
});

export { pizzaRouter };
