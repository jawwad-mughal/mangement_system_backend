import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateAccessToken = async (payload) => {
  return await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRE,
  });
};

export const generateRefreshToken = async (payload) => {
  return await jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};
