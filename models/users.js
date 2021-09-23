import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  type: { type: String, default: "user", required: true },
  token: { type: String, required: true },
  cart: {
    total_quantity: { type: Number, default: 0, required: true },
    total_price: { type: Number, default: 0, required: true },
    items: [
      {
        name: { type: String, required: true },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        extras: {
          base: { type: String, default: "default", required: true },
          sauce: { type: String, default: "default", required: true },
          cheese: { type: String, default: "default", required: true },
          veggies: [{ type: String, default: "default", required: true }],
          meat: [{ type: String, default: "No meat", required: true }],
        },
      },
    ],
  },
  orders: [
    {
      orderId: { type: String, required: true },
      total_quantity: { type: Number, default: 0, required: true },
      total_price: { type: Number, default: 0, required: true },
      payment: { type: String, default: "Paid(RazorPay)", required: true },
      items: [
        {
          name: { type: String, required: true },
          price: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            required: true,
          },
          extras: {
            base: { type: String, default: "default", required: true },
            sauce: { type: String, default: "default", required: true },
            cheese: { type: String, default: "default", required: true },
            veggies: [{ type: String, default: "default", required: true }],
            meat: [{ type: String, default: "No meat", required: true }],
          },
        },
      ],
      status: { type: String, default: "Order Placed", required: true },
    },
  ],
});

//Hashing Password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

export const User = mongoose.model("User", userSchema);
