const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Secret key for signing and verifying JWT tokens
const secretKey = process.env.JWT_SECRET_KEY || 'your-default-secret-key';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ status: "error", message: "Unauthorized: Missing token" });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ status: "error", message: "Unauthorized: Invalid token format" });
  }

  const token = tokenParts[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: "error", message: "Unauthorized: Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
}

module.exports = {
  verifyToken,
};