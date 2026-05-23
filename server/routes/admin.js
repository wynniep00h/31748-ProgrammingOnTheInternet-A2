import express from 'express';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Expense from '../models/Expense.js';
import authMiddleware, { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware); //only admins can access these routes

// GET ALL USERS 
router.get("/users", async (req, res) => {
    try {
        const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

        //add total expenses for each user
        const userWithStats = await Promise.all(
            users.map(async (user) => {
                const expenseCount = await Expense.countDocuments({ user: user._id });
                const lastActivity = await Activity.findOne({ user: user._id }).sort({ createdAt: -1 });
                return {
                    ...user.toObject(),
                    expenseCount,
                    lastActivity: lastActivity ?.createdAt || null,
                    lastAction: lastActivity ?.action || null,
                };
            })
        );

        res.json(userWithStats);
    } catch (err) {
        res.status(500).json({error: err.message });
    }
});

// GET ALL ACTIVITTY LOGS
router.get("/activity", async (req, res) => {
    try {
        const {userId, action, limit = 50} = req.query;
        const filter = {};

        if (userId) filter.user = userId;
        if (action) filter.action = action;

        const activity = await Activity.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate("user", "username email");
        
        res.json(activity);
    } catch (err) {
        res.status(500).json({error: err.message });
    }
});

//GET ONE USER WITH EXPENSES
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    const expenses = await Expense.find({ owner: req.params.id })
      .sort({ date: -1 });

    const activity = await Activity.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ user, expenses, activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DeLETE USER 
router.delete("/users/:id", async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    await Expense.deleteMany({ owner: req.params.id });

    // Log this action
    await Activity.create({
      user:     req.user._id,
      username: req.user.username,
      action:   "delete_expense",
      details:  `Admin deleted user: ${user.username} and all their expenses`,
    });

    res.json({ message: `User ${user.username} and their data deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


 //CHANGE USER ROLE
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'admin'." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;