import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food & Dining",
        "Transport",
        "Shopping",
        "Entertainment",
        "Health",
        "Housing",
        "Education",
        "Travel",
        "Utilities",
        "Gifts",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
