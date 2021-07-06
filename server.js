import express from "express";
import mongoose from "mongoose";
import { User } from "./models/pizzaTown.js";

const app = express();
const PORT = process.env.PORT || 5000;

const url = process.env.MONGODB_URI || "mongodb://localhost/pizzaTown";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

app.use(express.json());

app.get("/", (request, response) => {
  response.send("Welcome to node app!");
});

// Find users
app.get("/users", async (request, response) => {
  const users = await User.find();
  response.send(users);
});

//Add a user
app.post("/users", async (request, response) => {
  const newUser = request.body;
  console.log(newUser);

  const user = new User(newUser);
  try {
    const cust = await user.save();
    response.send(cust);
  } catch (err) {
    response.send(err);
  }
});

app.listen(PORT, () => {
  console.log("The server is started in PORT " + PORT + "...");
});
