import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
});

export const ForgotPassword = mongoose.model("ForgotPassword", tokenSchema);
