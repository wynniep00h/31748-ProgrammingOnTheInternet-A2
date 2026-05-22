import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from "./routes/expenses.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use('/api/expenses', expenseRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "ok" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected!!");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(" MongoDB NOT connection :<:", err.message);
    process.exit(1);
  });
