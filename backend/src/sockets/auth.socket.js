import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("_id email");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
}
