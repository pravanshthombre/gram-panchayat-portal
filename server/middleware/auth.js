/**
 * auth.js — JWT Authentication Middleware
 * 
 * Verifies JWT tokens from the Authorization header and 
 * provides role-based access control for protected routes.
 */

const jwt = require('jsonwebtoken');

// Secret key for JWT signing (in production, use environment variable)
const JWT_SECRET = 'gram_panchayat_secret_key_2026';

/**
 * Middleware: Verify JWT token
 * Attaches decoded user data to req.user if valid
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware: Require admin role
 * Must be used after authenticateToken
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

/**
 * Helper: Generate JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, village_id: user.village_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { authenticateToken, requireAdmin, generateToken, JWT_SECRET };
