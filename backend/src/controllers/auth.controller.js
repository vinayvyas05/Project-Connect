import User from "../models/User.js";

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
