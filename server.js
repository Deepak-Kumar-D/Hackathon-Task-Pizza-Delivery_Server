import express from "express";
import mongoose from "mongoose";
import { User } from "./models/pizzaTown.js";

const app = express();
const PORT = process.env.PORT || 5000;

const url =
  "mongodb+srv://deepakkumard:password1234@cluster0.pkrwz.mongodb.net/pizzaTown";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

app.use(express.json());

app.get("/", (request, response) => {
  console.log("Deepak it's done!");
  response.send("Welcome to node app!");
});

app.get("/users", async (request, response) => {
  const users = await User.find();
  console.log(users);
  response.send(users);
});

app.listen(PORT, () => {
  console.log("The server is started in PORT " + PORT + "...");
});
