import express from "express";
import Expense from "../models/Expense.js";
import Activity from "../models/Activity.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Helper for logging activity
const logActivity = async (userId, username, action, details = "") => {
  try {
    await Activity.create({ user: userId, username, action, details });
  } catch { }
};

// GET all expenses — only logged in user's expenses
router.get("/", async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter = { owner: req.user._id };

    if (category && category !== "All") filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET totals grouped by category
router.get("/summary/by-category", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id:   "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET totals grouped by month
router.get("/summary/monthly", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { owner: req.user._id } }, 
      {
        $group: {
          _id: {
            year:  { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new expense
router.post("/", async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      owner: req.user._id,
    });
    await expense.save();

    await logActivity(
      req.user._id,
      req.user.username,
      "create_expense",
      `Created expense: ${expense.title} $${expense.amount}`
    );

    res.status(201).json(expense);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update an existing expense
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate( 
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    await logActivity(
      req.user._id,
      req.user.username,
      "update_expense",
      `Updated expense: ${expense.title} $${expense.amount}` 
    );

    res.json(expense);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE an expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete(
      { _id: req.params.id, owner: req.user._id }
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    await logActivity(
      req.user._id,
      req.user.username,
      "delete_expense",
      `Deleted expense: ${expense.title} $${expense.amount}`
    );

    res.json({ message: "Expense deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;