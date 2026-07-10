import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/", requireRole("ADMIN","MANAGER","ACCOUNTANT"), async (req, res) => {
  const { customerName, date, kilosExported, value, documentation, lotId } = req.body;
  try {
    const ex = await prisma.export.create({
      data: {
        customerName,
        date: date ? new Date(date) : new Date(),
        kilosExported,
        value,
        documentation,
        lotId: lotId ?? undefined,
      },
    });
    // stock OUT
    await prisma.stock.create({ data: { lotId: lotId ?? undefined, kilos: kilosExported, movement: "OUT", source: `export:${ex.id}` } });
    res.json(ex);
  } catch (err) {
    res.status(400).json({ error: "Erreur création export", details: (err as any).message });
  }
});

router.get("/", async (req, res) => {
  const list = await prisma.export.findMany({ include: { lot: true } });
  res.json(list);
});

export default router;
