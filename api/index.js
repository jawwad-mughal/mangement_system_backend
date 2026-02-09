import express from "express";
import connectdb from "../databaseConfig/db.js"; // ✅ correct path
import cors from "cors";
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

const app = express();

// ------------------------
// ✅ MongoDB Connection
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
    throw err; // important for Vercel
  }
}

connectDatabase();

// ------------------------
// ✅ CORS Config
// ------------------------
const allowedOrigins = [
  "https://mangement-system-frontend.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server & Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject silently (important for Vercel)
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// ✅ Preflight must use SAME options
app.options("*", cors(corsOptions));


// ------------------------
// ✅ Middleware
// ------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ❌ Vercel serverless cannot serve local folders reliably
// app.use("/uploads", express.static("uploads"));

// ------------------------
// ✅ Test Route
// ------------------------
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// ------------------------
// ✅ Token & Section Middleware
// ------------------------
app.get("/verifyToken", verifyAccessToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post("/checkSection", verifyAccessToken, sectionAccess);

// ------------------------
// ✅ Routers
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
// ✅ Export for Vercel
// ------------------------
export default app;

