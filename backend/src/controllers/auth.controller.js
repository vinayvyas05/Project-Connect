import User from '../models/User.js';
import jwt from 'jsonwebtoken';

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
  }
}

const genarateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw new ApiError(
      500,
      'Something went wrong while generating access and refresh token'
    );
  }
};

export const generateAccessAndRefreshToken = genarateAccessAndRefreshToken;

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
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // create new user (password hashing happens in model)
    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // 4. Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await genarateAccessAndRefreshToken(
      user._id
    );

    // 5. Return response
    return res.status(200).json({
      message: 'Login successful.',
      user: user.toJSON(),
      token: accessToken, // for backward compatibility with frontend code expecting "token"
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.body.refreshToken || req.headers['x-refresh-token'];

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: 'Refresh token is required.' });
    }

    try {
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
      );

      const user = await User.findById(decoded?._id);

      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      if (incomingRefreshToken !== user.refreshToken) {
        return res
          .status(401)
          .json({ message: 'Refresh token is invalid or already used.' });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await genarateAccessAndRefreshToken(user._id);

      return res.status(200).json({
        message: 'Token refreshed successfully.',
        token: accessToken, // backward compatibility
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (jwtErr) {
      console.error('JWT refresh verification error:', jwtErr.message);
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token.' });
    }
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
