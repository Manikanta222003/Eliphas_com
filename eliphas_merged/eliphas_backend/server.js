import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Load environment variables FIRST
dotenv.config();

const app = express();


// ✅ Proper CORS configuration for React frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// ✅ Middleware
app.use(express.json());


// ✅ Connect Database
connectDB();


// ✅ Routes
app.use("/api/auth", authRoutes);

app.use("/api/billing", billingRoutes);

app.use("/api/reports", reportRoutes);


// ✅ Root test route
app.get("/", (req, res) => {
  res.status(200).send("ELIPHAS Backend Running Successfully");
});


// ✅ Health check route (optional but useful)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend working",
    port: process.env.PORT
  });
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend URL: http://localhost:${PORT}`);
  console.log(`Health URL: http://localhost:${PORT}/api/health`);
  console.log("=================================");

});
