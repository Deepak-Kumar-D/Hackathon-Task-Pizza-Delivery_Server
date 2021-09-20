import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  order: {
    orderId: { type: String, required: true },
    total_quantity: {
      type: Number,
      default: 0,
      required: true,
    },
    total_price: {
      type: Number,
      default: 0,
      required: true,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
      },
    ],
  },
  status: {
    type: String,
    default: "Order Placed",
    required: true,
  },
  address: {
    type: Object,
  },
  payment: { type: String, default: "Paid(RazorPay)", required: true },
  time: {
    type: Date,
    default: Date.now(),
  },
});

export const Order = mongoose.model("Order", orderSchema);
