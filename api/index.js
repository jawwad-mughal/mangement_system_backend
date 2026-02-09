import express from "express";
import connectdb from "../databaseConfig/db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
// Middlewares
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { sectionAccess } from "../middleware/accessMiddleware.js";

// Routers
import loginSignUpRouter from "../routers/loginSignUpRoutes.js";
import logoutRouter from "../routers/logoutRoutes.js";
import employeeRouter from "../routers/employeeRoutes.js";
import branchRouter from "../routers/branchRoutes.js";
import categoryRouter from "../routers/categoryRoutes.js";
import stockRouter from "../routers/stockRoutes.js";
import productRouter from "../routers/productRoutes.js";
import bankAccountRoutes from "../routers/bankAccountRoutes.js";
import transactionRoutes from "../routers/transactionRoutes.js";
import accountSummaryRoutes from "../routers/accountSummaryRoutes.js";

import cors from "cors";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000
// ------------------------
// MongoDB connection
// ------------------------
let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;
  try {
    await connectdb();
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}

connectDatabase();

// ------------------------
// Global middleware
// ------------------------
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------------
// CORS options
// ------------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ------------------------
// Test route
// ------------------------
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// ------------------------
// Token & Section middleware
// ------------------------
app.get("/verifyToken", verifyAccessToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post("/checkSection", verifyAccessToken, sectionAccess);
app.get("/", (req, res) => res.json({ message: "Server running" }));
// ------------------------
// Routers with route-level CORS (Vercel-safe)
// ------------------------
app.use("/api", loginSignUpRouter); // login/signup routes
app.use("/logout", logoutRouter);

app.use("/employee", verifyAccessToken, employeeRouter);
app.use("/branch", verifyAccessToken, branchRouter);
app.use("/category", verifyAccessToken, categoryRouter);
app.use("/inventory", verifyAccessToken, stockRouter);
app.use("/products", verifyAccessToken, productRouter);

app.use("/api/bankaccount", bankAccountRoutes);
app.use("/api/transactions", transactionRoutes);

app.use("/summary", accountSummaryRoutes);

// ------------------------
// Export for Vercel
// ------------------------
export default app;


