import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/", requireRole("ADMIN","MANAGER"), async (req, res) => {
  const { lotCode, origin } = req.body;
  try {
    const existing = await prisma.lot.findUnique({ where: { lotCode } });
    if (existing) return res.status(400).json({ error: "lotCode existe" });
    const lot = await prisma.lot.create({ data: { lotCode, origin } });
    res.json(lot);
  } catch (err) {
    res.status(400).json({ error: (err as any).message });
  }
});

router.get("/", async (req, res) => {
  const lots = await prisma.lot.findMany({ include: { movements: true } });
  res.json(lots);
});

export default router;
