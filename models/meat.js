import mongoose from "mongoose";

const meatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

export const Meat = mongoose.model("Meat", meatSchema);
