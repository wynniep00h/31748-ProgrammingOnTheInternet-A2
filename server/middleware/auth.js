import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided. Please log in." });
    }
    //remove "bearer" and just extract the token part
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    //attach user to request so routes can use it
    req.user = user;
    next(); //passes constrol to the next function

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token. Please log in again." });
  }
};

//separate middlewarew to check if user is admin
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
};

export default authMiddleware;