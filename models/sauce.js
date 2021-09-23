import mongoose from "mongoose";

const sauceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

export const Sauce = mongoose.model("Sauce", sauceSchema);
