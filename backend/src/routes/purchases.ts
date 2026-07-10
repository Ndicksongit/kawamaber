import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/", requireRole("ADMIN","MANAGER","ACCOUNTANT"), async (req, res) => {
  const { supplier, date, kilos, pricePerKg, lotCode } = req.body;
  try {
    // create or fetch lot
    let lotId: string | null = null;
    if (lotCode) {
      let lot = await prisma.lot.findUnique({ where: { lotCode } });
      if (!lot) {
        lot = await prisma.lot.create({ data: { lotCode, origin: `purchase:${supplier}` } });
      }
      lotId = lot.id;
    }
    const total = (kilos || 0) * (pricePerKg || 0);
    const purchase = await prisma.purchase.create({
      data: { supplier, date: date ? new Date(date) : new Date(), kilos, pricePerKg, total, lotId: lotId ?? undefined },
    });
    // stock IN
    await prisma.stock.create({ data: { lotId: lotId ?? undefined, kilos, movement: "IN", source: `purchase:${purchase.id}` } });
    res.json(purchase);
  } catch (err) {
    res.status(400).json({ error: "Erreur création purchase", details: (err as any).message });
  }
});

router.get("/", async (req, res) => {
  const list = await prisma.purchase.findMany({ include: { lot: true } });
  res.json(list);
});

export default router;
