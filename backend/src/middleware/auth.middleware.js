import jwt from 'jsonwebtoken';

/**
 * REST API Authentication Middleware
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using the secret from your .env
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const userId = decoded.userId || decoded._id;

    // FIX: Standardize to req.user object to match your controllers
    // Use decoded.userId because that is what your login controller saves
    req.user = { id: userId };

    // Also keep req.userId if your existing routes (like /profile) specifically need it
    req.userId = userId;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
