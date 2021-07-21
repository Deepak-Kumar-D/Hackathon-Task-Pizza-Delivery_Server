import express from "express";
import { User } from "../models/pizzaTown.js";
import bcrypt from "bcrypt";
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

    const user = new User({ name, email, phone, address, password });
    await user.save();

    response.status(201).json({ message: "User Registered Successfully!" });
  } catch (err) {
    response.send(err);
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
        sameSite: "strict",
        signed: "true",
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
