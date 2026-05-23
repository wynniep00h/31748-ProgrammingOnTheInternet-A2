import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// Helper — create JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Helper — log activity
const logActivity = async (userId, username, action, details = "", ipAddress = "") => {
  try {
    await Activity.create({ user: userId, username, action, details, ipAddress });
  } catch { }
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please provide username, email and password." });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      return res.status(400).json({ error: `${field} already exists, please choose another.` });
    }

    const user = await User.create({ username, email, password });

    await logActivity(user._id, user.username, "register", `New user registered: ${username}`, req.ip);

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide username and password." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    await logActivity(user._id, user.username, "login", "User logged in", req.ip);

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (userId && username) {
      await logActivity(userId, username, "logout", "User logged out", req.ip);
    }

    res.json({ message: "Logged out successfully." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CURRENT USER 
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    res.json({ id: user._id, username: user.username, email: user.email, role: user.role });

  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;