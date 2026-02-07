import express from "express";
import "dotenv/config";
import connectdb from "./databaseConfig/db.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
import { verifyAccessToken } from "./middleware/verifyAccessToken.js";
import { sectionAccess } from "./middleware/accessMiddleware.js";
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

const app = express()
const port = process.env.PORT || 3000

// Connting database
let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;

  try {
    await connectdb();
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

connectDatabase();


// Default: allows all origins

const allowedOrigins = [
  "https://mangement-system-frontend.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server / vercel internal calls
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// 🔴 THIS LINE IS THE KEY FOR PREFLIGHT
app.options("*", cors(corsOptions));


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// middleware check verify token
app.get("/verifyToken", verifyAccessToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});


// middleware section access
app.post("/checkSection", verifyAccessToken, sectionAccess );

app.use('/api', loginSignUpRouter)
app.use('/logout',logoutRouter)

// employee Routes
app.use("/employee",verifyAccessToken, employeeRouter)

// branch Routes
app.use("/branch", verifyAccessToken, branchRouter)

// category Routes
app.use("/category", verifyAccessToken, categoryRouter)

// inventory Routes
app.use("/inventory", verifyAccessToken,stockRouter )

// Product Routes
app.use("/products", verifyAccessToken, productRouter);

// bankAccount Routes
app.use("/api/bankaccount", bankAccountRoutes); 


app.use("/api/transactions", transactionRoutes);

app.use("/summary",accountSummaryRoutes)


export default app;
