const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./src/config/database");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Smart Restaurant API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes will be added here
// app.use('/api/auth', require('./src/routes/auth.routes'));
// app.use('/api/menu', require('./src/routes/menu.routes'));
// app.use('/api/orders', require('./src/routes/order.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// Socket.IO setup (will be configured later)
// const io = require('socket.io')(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     credentials: true
//   }
// });

module.exports = { app, server };
