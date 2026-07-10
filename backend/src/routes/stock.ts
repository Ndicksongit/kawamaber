import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// register manual stock movement
router.post("/", requireRole("ADMIN","ACCOUNTANT","MANAGER"), async (req, res) => {
  const { lotId, kilos, movement, source } = req.body;
  try {
    const s = await prisma.stock.create({
      data: {
        lotId: lotId ?? undefined,
        kilos,
        movement,
        source,
      },
    });
    res.json(s);
  } catch (err) {
    res.status(400).json({ error: (err as any).message });
  }
});

// get aggregated stock per lot
router.get("/summary", async (req, res) => {
  const raw = await prisma.$queryRaw<
    Array<{ lotId: string | null; total_in: number | null; total_out: number | null }>
  >`SELECT "lotId",
      SUM(CASE WHEN movement='IN' THEN kilos ELSE 0 END) as total_in,
      SUM(CASE WHEN movement='OUT' THEN kilos ELSE 0 END) as total_out
    FROM "Stock"
    GROUP BY "lotId"`;
  // compute balance
  const summary = raw.map(r => ({
    lotId: r.lotId,
    in: Number(r.total_in ?? 0),
    out: Number(r.total_out ?? 0),
    balance: Number((r.total_in ?? 0) - (r.total_out ?? 0)),
  }));
  res.json(summary);
});

router.get("/", async (req, res) => {
  const list = await prisma.stock.findMany({ include: { lot: true }, orderBy: { createdAt: "desc" } });
  res.json(list);
});

export default router;
