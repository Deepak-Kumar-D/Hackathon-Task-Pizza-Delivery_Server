import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRouter.js";
import { adminRouter } from "./routes/adminRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { orderRouter } from "./routes/orderRouter.js";
import { productRouter } from "./routes/productRouter.js";
import { cartRouter } from "./routes/cartRouter.js";
import { checkoutRouter } from "./routes/checkoutRouter.js";
import dotenv from "dotenv";
import { passRouter } from "./routes/forgotPassword.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const url = process.env.MONGODB_URI || "mongodb://localhost/pizzaTown";

var corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

app.use(express.json());
app.use(cookieParser());

app.use("/", userRouter);
app.use("/", adminRouter);
app.use("/", orderRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", checkoutRouter);
app.use("/", passRouter);

app.listen(PORT, () => {
  console.log("The server is started in PORT " + PORT + "...");
});
