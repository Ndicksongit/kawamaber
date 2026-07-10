import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/", requireRole("ADMIN","MANAGER","IT"), async (req, res) => {
  const { name, phone, email, documents } = req.body;
  const farmer = await prisma.farmer.create({ data: { name, phone, email, documents } });
  res.json(farmer);
});

router.get("/", async (req, res) => {
  const list = await prisma.farmer.findMany({ include: { fields: true } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const farmer = await prisma.farmer.findUnique({ where: { id }, include: { fields: true } });
  if (!farmer) return res.status(404).json({ error: "Not found" });
  res.json(farmer);
});

export default router;
