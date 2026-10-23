require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const attemptRoutes = require("./routes/attemptRoutes");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://online-exam-platefrom.vercel.app",
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Exam Platform API is running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "Could not start server:",
      error.message
    );
    process.exit(1);
  });