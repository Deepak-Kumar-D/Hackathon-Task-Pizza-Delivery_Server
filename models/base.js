import mongoose from "mongoose";

const baseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

export const Base = mongoose.model("Base", baseSchema);
