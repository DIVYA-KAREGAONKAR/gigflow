const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};
