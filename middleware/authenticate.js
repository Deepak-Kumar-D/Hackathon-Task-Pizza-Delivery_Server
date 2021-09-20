import jwt from "jsonwebtoken";
import { User } from "../models/users.js";

const Authenticate = async (request, response, next) => {
  try {
    const token = request.cookies.jwttoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    const isUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!isUser) {
      throw new Error("User not found!");
    }

    request.token = token;
    request.isUser = isUser;
    request.userId = isUser._id;

    next();
  } catch (err) {
    response.status(401).send("Unauthorized: No Token Provided!");
    console.log(err);
  }
};

export { Authenticate };
