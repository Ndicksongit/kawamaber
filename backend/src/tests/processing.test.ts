import request from "supertest";
import { prisma } from "../prisma";
import app from "../testApp"; // see note: testApp exports an express app instance without listen()

let token: string;

beforeAll(async () => {
  // clean db or use test DB
  await prisma.$connect();
  await prisma.user.deleteMany();
  const hashed = await require("bcrypt").hash("password", 10);
  const user = await prisma.user.create({ data: { username: "admin", passwordHash: hashed, role: "ADMIN" }});
  const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "password" });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("create processing and stock movements", async () => {
  const payload = {
    batchCode: "BATCH-001",
    lotCode: "LOT-001",
    farmerId: null,
    kilosIn: 100,
    kilosOut: 90
  };
  const res = await request(app).post("/api/processings").set("Authorization", `Bearer ${token}`).send(payload);
  expect(res.status).toBe(200);
  expect(res.body.batchCode).toBe("BATCH-001");

  const stocks = await request(app).get("/api/stock").set("Authorization", `Bearer ${token}`);
  expect(stocks.status).toBe(200);
  // at least one IN created
  const foundIn = stocks.body.find((s: any) => s.movement === "IN" && s.kilos === 90);
  expect(foundIn).toBeDefined();
});
