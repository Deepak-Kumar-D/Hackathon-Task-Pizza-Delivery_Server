import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  type: { type: String, default: "admin", required: true },
  token: { type: String, required: true },
});

//Hashing Password
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

export const Admin = mongoose.model("Admin", adminSchema);
