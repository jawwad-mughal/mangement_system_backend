import express from "express";
import connectdb from "../databaseConfig/db.js";
import cookieParser from "cookie-parser";

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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------------
// CORS options
// ------------------------
const corsOptions = {
  origin: "https://mangement-system-frontend.vercel.app",
  credentials: true, // cookies allow
};

// ------------------------
// Test route
// ------------------------
app.get("/", cors(corsOptions), (req, res) => {
  res.json({ ok: true });
});

// ------------------------
// Token & Section middleware
// ------------------------
app.get("/verifyToken", cors(corsOptions), verifyAccessToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post("/checkSection", cors(corsOptions), verifyAccessToken, sectionAccess);

// ------------------------
// Routers with route-level CORS (Vercel-safe)
// ------------------------
app.use("/api", cors(corsOptions), loginSignUpRouter); // login/signup routes
app.use("/logout", cors(corsOptions), logoutRouter);

app.use("/employee", cors(corsOptions), verifyAccessToken, employeeRouter);
app.use("/branch", cors(corsOptions), verifyAccessToken, branchRouter);
app.use("/category", cors(corsOptions), verifyAccessToken, categoryRouter);
app.use("/inventory", cors(corsOptions), verifyAccessToken, stockRouter);
app.use("/products", cors(corsOptions), verifyAccessToken, productRouter);

app.use("/api/bankaccount", cors(corsOptions), bankAccountRoutes);
app.use("/api/transactions", cors(corsOptions), transactionRoutes);

app.use("/summary", cors(corsOptions), accountSummaryRoutes);

// ------------------------
// Export for Vercel
// ------------------------
export default app;


