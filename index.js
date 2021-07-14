import express from "express";
import mongoose from "mongoose";
import { User } from "./models/pizzaTown.js";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { Authenticate } from "./middleware/authenticate.js";

var corsOptions = {
  origin: true,
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;
const url = process.env.MONGODB_URI || "mongodb://localhost/pizzaTown";
app.use(cors(corsOptions));

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

app.use(express.json());
app.use(cookieParser());

app.get("/", (request, response) => {
  response.send("Welcome to node app!");
});

// Find users
app.get("/users", async (request, response) => {
  const users = await User.find();

  response.send(users);
});

//Add a user
app.post("/register", async (request, response) => {
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
app.post("/login", async (request, response) => {
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

//dashboard
app.get("/dashboard", Authenticate, (request, response) => {
  console.log("Hello to dashboard");
  response.send();
});

app.listen(PORT, () => {
  console.log("The server is started in PORT " + PORT + "...");
});
