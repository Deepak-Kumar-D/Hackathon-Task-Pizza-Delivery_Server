import jwt from "jsonwebtoken";

const createJWT = (email, userId, duration) => {
  const payload = { email, userId, duration };

  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: duration,
  });
};

export default createJWT;
