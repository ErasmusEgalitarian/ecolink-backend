const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); // ajuste se for outro arquivo
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Conecta ao banco antes de tudo
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/test_db"
  );
});

// Limpa usuários antes de cada teste
beforeEach(async () => {
  await User.deleteMany({});
});

// Fecha conexão após os testes
afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  it("deve registrar usuário com dados válidos", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "12345678",
      phoneNumber: "1234567890",
      address: "Rua Teste, 123",
      cpf: "12345678900",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");

    const user = await User.findOne({ email: "testuser@example.com" });
    expect(user).not.toBeNull();
    expect(user.role).toBe("external");
  });

  it("deve retornar erro com dados inválidos (sem email)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "baduser",
      password: "12345678",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid input or missing fields");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const hashed = await bcrypt.hash("password123", 10);
    await User.create({
      username: "loginuser",
      email: "login@example.com",
      password: hashed,
      role: "external",
    });
  });

  it("deve logar com credenciais válidas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("external");
  });

  it("deve falhar com credenciais inválidas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
