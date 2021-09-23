import mongoose from "mongoose";

const cheeseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

export const Cheese = mongoose.model("Cheese", cheeseSchema);
