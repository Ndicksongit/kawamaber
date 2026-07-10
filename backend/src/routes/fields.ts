import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import area from "@turf/area";

const router = express.Router();

router.post("/", requireRole("ADMIN","MANAGER","AGRONOMIST"), async (req, res) => {
  const { farmerId, name, geojson, soilType } = req.body;
  let computedAreaHa: number | null = null;
  if (geojson) {
    try {
      const a = area(geojson); // in m^2
      computedAreaHa = +(a / 10000).toFixed(4);
    } catch (e) {
      console.warn("area compute failed", e);
    }
  }
  const field = await prisma.field.create({
    data: { farmerId, name, geojson, soilType, areaHectare: computedAreaHa as any },
  });
  res.json(field);
});

router.get("/", async (req, res) => {
  const fields = await prisma.field.findMany({ include: { farmer: true } });
  res.json(fields);
});

export default router;
