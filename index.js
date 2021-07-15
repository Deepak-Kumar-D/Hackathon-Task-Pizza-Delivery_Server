import express from "express";
import mongoose from "mongoose";
import { pizzaRouter } from "./routes/pizzaRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;
const url = process.env.MONGODB_URI || "mongodb://localhost/pizzaTown";

var corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

app.use(express.json());
app.use(cookieParser());

app.use("/", pizzaRouter);

app.listen(PORT, () => {
  console.log("The server is started in PORT " + PORT + "...");
});
