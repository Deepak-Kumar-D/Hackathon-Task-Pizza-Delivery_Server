import mongoose from "mongoose";

const veggiesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

export const Veggies = mongoose.model("Veggies", veggiesSchema);
