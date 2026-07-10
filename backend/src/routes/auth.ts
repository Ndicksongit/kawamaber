import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// register (restricted — in prod, allow only ADMIN)
router.post("/register", async (req, res) => {
  const { username, password, role = "WORKER", email } = req.body;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ error: "Username exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, passwordHash: hash, role, email } });
  res.json({ id: user.id, username: user.username, role: user.role });
});

export default router;
