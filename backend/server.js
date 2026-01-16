const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { connectDB, disconnectDB } = require("./src/config/database");
const { jwtStrategy, googleStrategy } = require("./src/config/passport");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express app
const app = express();

// Middleware
// Serve uploads folder as static files
app.use('/uploads', express.static('uploads'));
app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins for development/testing
    credentials: true,
  })
);
app.use(morgan("dev"));

// DEBUG: Log all incoming requests
app.use((req, res, next) => {
  console.log(`🌍 INCOMING REQUEST: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport Config
passport.use(jwtStrategy);
passport.use(googleStrategy);
app.use(passport.initialize());

// Swagger Config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Restaurant API",
      version: "1.0.0",
      description: "API Documentation for Smart Restaurant System",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5001}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve uploaded files with CORS headers
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Smart Restaurant API",
    version: "1.0.0",
    status: "running",
    docs: "/api-docs",
  });
});

// API Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/restaurants", require("./src/routes/restaurant.routes"));
app.use("/api/menu", require("./src/routes/menu.routes"));
app.use("/api/admin/menu", require("./src/routes/menu.routes"));
app.use("/api/tables", require("./src/routes/table.routes"));
app.use("/api/orders", require("./src/routes/order.routes"));
app.use("/api/kitchen", require("./src/routes/kitchen.routes"));
app.use("/api/payments", require("./src/routes/payment.routes"));
app.use("/api/reviews", require("./src/routes/review.routes"));
app.use("/api/reports", require("./src/routes/report.routes"));
app.use("/api/carts", require("./src/routes/cart.routes"));
app.use("/api/users", require("./src/routes/user.routes"));

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
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
  console.log(`📑 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

// Socket.IO setup (placeholder for now)
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_restaurant", (restaurantId) => {
    socket.join(restaurantId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

// Export io to be used in services
app.set("io", io);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectDB();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = { app, server };
