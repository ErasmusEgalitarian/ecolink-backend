require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const corsOptions = require('./config/cors.config');
const { globalRateLimiter } = require("./middlewares/rateLimiter");

const uploadDir = path.join(__dirname, "uploads"); // -> create upload folder locally
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();

// Em desenvolvimento o app costuma rodar atrás de um proxy (ex.: localtunnel),
// que adiciona o header X-Forwarded-For. Sem isso o express-rate-limit lança
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
if (process.env.NODE_ENV === "development") {
  app.set("trust proxy", 1);
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(cors(corsOptions));
app.use(globalRateLimiter);
app.use(express.json());

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

const semesterRoutes = require("./routes/semester");
app.use("/api/semesters", semesterRoutes);

const mediaRoutes = require("./routes/media");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/media", mediaRoutes);

const rolesRoutes = require("./routes/roles");
app.use("/api/roles", rolesRoutes);

const pickupRoutes = require("./routes/pickups");
app.use("/api/pickups", pickupRoutes);

const ecopointRoutes = require("./routes/ecopoints");
app.use("/api/ecopoints", ecopointRoutes);

const locationRoutes = require("./routes/locations");
app.use("/api/locations", locationRoutes);

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
  require("./seeds/semestersSeeder");
  require("./seeds/locationsSeeder");
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