const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const secret = process.env.JWT_SECRET || "your_jwt_secret"; // fallback secret
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // attach user payload to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyJwt;
