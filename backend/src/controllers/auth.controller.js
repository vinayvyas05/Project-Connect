import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Register new user
 * Steps:
 * 1. Validate input
 * 2. Check if email exists
 * 3. Create user
 * 4. Return safe user object
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // create new user (password hashing happens in model)
    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: "User registered successfully.",
      user: user.toJSON()
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user._id },           // payload
      process.env.JWT_SECRET,         // secret key
      { expiresIn: process.env.JWT_EXPIRES_IN }  // expiration
    );

    // 5. Return response
    return res.status(200).json({
      message: "Login successful.",
      user: user.toJSON(),   // password removed automatically
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};