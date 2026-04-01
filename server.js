require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const corsOptions = require('./config/cors.config');

const uploadDir = path.join(__dirname, "uploads"); // -> create upload folder locally
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "development") {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  );

  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const donationRoutes = require("./routes/donation");
app.use("/api/donation", donationRoutes);

const mediaRoutes = require("./routes/media");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/media", mediaRoutes);

const rolesRoutes = require("./routes/roles");
app.use("/api/roles", rolesRoutes);

const pickupRoutes = require("./routes/pickups");
app.use("/api/pickups", pickupRoutes);

// Import Error Handlers (DEVE SER DEPOIS DAS ROTAS)
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

// 404 Handler - Captura rotas não encontradas
app.use(notFoundHandler);

// Global Error Handler - Captura TODOS os erros
app.use(errorHandler);

// Connect to MongoDB
connectDB();

if (process.env.NODE_ENV === "development") {
  require("./seeds/rolesSeeder");
}

module.exports = app;

if (require.main === module) {
  // Start the server
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );

  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}