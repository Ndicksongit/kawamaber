import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// Create planting
router.post("/", requireRole("ADMIN","MANAGER","AGRONOMIST"), async (req, res) => {
  const { fieldId, date, species, densityPerHa, notes } = req.body;
  try {
    const planting = await prisma.planting.create({
      data: {
        fieldId,
        date: date ? new Date(date) : new Date(),
        species,
        densityPerHa,
        notes,
      },
    });
    res.json(planting);
  } catch (err) {
    res.status(400).json({ error: "Erreur création plantation", details: (err as any).message });
  }
});

router.get("/", async (req, res) => {
  const list = await prisma.planting.findMany({ include: { field: true } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const p = await prisma.planting.findUnique({ where: { id }, include: { field: true } });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

router.delete("/:id", requireRole("ADMIN","MANAGER"), async (req, res) => {
  const { id } = req.params;
  await prisma.planting.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
