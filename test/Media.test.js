const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");

describe("Media endpoints", () => {
  let authToken;
  let adminUser;
  let server;

  beforeAll(async () => {
    server = app.listen(0);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    // Clean up any existing test users
    await User.deleteMany({ email: "testadmin@example.com" });

    // Create a test admin user
    const hashedPassword = await bcrypt.hash("password123", 10);
    adminUser = await User.create({
      username: "testadmin",
      email: "testadmin@example.com",
      password: hashedPassword,
      phoneNumber: "1234567890",
      address: "Test Address",
      cpf: "12345678900",
      role: "admin",
    });

    authToken = jwt.sign(
      {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Clean up test user
    await User.deleteMany({ email: "testadmin@example.com" });
    await server.close();
    await mongoose.disconnect();
    await new Promise((r) => setTimeout(r, 500));
  });

  it("should upload a media file", async () => {
    const res = await request(app)
      .post("/media/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("category", "Coleta")
      .attach("file", `${__dirname}/test-file.jpg`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("filename");
    expect(res.body.category).toBe("Coleta");
  });

  it("should list media filtered by category", async () => {
    const res = await request(app)
      .get("/media?category=Coleta&limit=5&page=1")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((media) => {
      expect(media.category).toBe("Coleta");
      expect(media).toHaveProperty("filename");
      expect(media).toHaveProperty("path");
    });
  });

  it("should reject upload without authorization", async () => {
    const res = await request(app)
      .post("/media/upload")
      .field("category", "Coleta")
      //.attach('file', `${__dirname}/test-file.jpg`);
      .expect(401);

    expect(res.statusCode).toBe(401);
  });
});
