import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(
      token, 
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
    );

    // FIX: Use decoded.userId or decoded._id
    const user = await User.findById(decoded.userId || decoded._id).select('_id email name');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error('Socket Auth Error:', err.message);
    next(new Error('Unauthorized'));
  }
}
