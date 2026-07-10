import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// Create processing: optionally link to lot or create new lot
router.post("/", requireRole("ADMIN","MANAGER","AGRONOMIST"), async (req, res) => {
  const { batchCode, lotCode, farmerId, date, kilosIn, kilosOut, quality, notes } = req.body;
  try {
    // ensure unique lot if provided lotCode
    let lotId: string | null = null;
    if (lotCode) {
      let lot = await prisma.lot.findUnique({ where: { lotCode } });
      if (!lot) {
        lot = await prisma.lot.create({ data: { lotCode, origin: `processing:${batchCode}` } });
      }
      lotId = lot.id;
    }
    const processing = await prisma.processing.create({
      data: {
        batchCode,
        lotId,
        date: date ? new Date(date) : new Date(),
        farmerId,
        kilosIn,
        kilosOut,
        quality,
        notes,
      },
    });

    // create stock movements: IN for kilosOut (processed ready) and OUT for kilosIn consumed (raw)
    if (kilosOut && kilosOut > 0) {
      await prisma.stock.create({ data: { lotId: lotId ?? undefined, kilos: kilosOut, movement: "IN", source: `processing:${processing.id}` } });
    }
    if (kilosIn && kilosIn > 0) {
      // raw consumed is considered OUT of raw inventory (optional)
      await prisma.stock.create({ data: { lotId: lotId ?? undefined, kilos: kilosIn, movement: "OUT", source: `processing:${processing.id}` } });
    }

    res.json(processing);
  } catch (err) {
    res.status(400).json({ error: "Erreur création processing", details: (err as any).message });
  }
});

router.get("/", async (req, res) => {
  const list = await prisma.processing.findMany({ include: { lot: true, originFarm: true } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const p = await prisma.processing.findUnique({ where: { id }, include: { lot: true, originFarm: true } });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

router.delete("/:id", requireRole("ADMIN","MANAGER"), async (req, res) => {
  const { id } = req.params;
  // Note: consider reversing related stock movements or marking void
  await prisma.processing.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
