import express from "express";
import connectdb from "./databaseConfig/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Middlewares
import { verifyAccessToken } from "./middleware/verifyAccessToken.js";
import { sectionAccess } from "./middleware/accessMiddleware.js";

// Routers
import loginSignUpRouter from "./routers/loginSignUpRoutes.js";
import logoutRouter from "./routers/logoutRoutes.js";
import employeeRouter from "./routers/employeeRoutes.js";
import branchRouter from "./routers/branchRoutes.js";
import categoryRouter from "./routers/categoryRoutes.js";
import stockRouter from "./routers/stockRoutes.js";
import productRouter from "./routers/productRoutes.js";
import bankAccountRoutes from "./routers/bankAccountRoutes.js";
import transactionRoutes from "./routers/transactionRoutes.js";
import accountSummaryRoutes from "./routers/accountSummaryRoutes.js";

const app = express();

// ------------------------
// MongoDB connection (serverless-safe)
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
// CORS (Vercel-safe)
// ------------------------
const allowedOrigins = [
  "https://mangement-system-frontend.vercel.app",
  "http://localhost:5173", // local dev
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200); // respond to preflight
  next();
});

// ------------------------
// Test route
// ------------------------
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

// ------------------------
// Token & Section middleware
// ------------------------
app.get("/verifyToken", verifyAccessToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post("/checkSection", verifyAccessToken, sectionAccess);

// ------------------------
// Routers
// ------------------------
app.use("/api", loginSignUpRouter);
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




