import express from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/", requireRole("ADMIN","ACCOUNTANT"), async (req, res) => {
  const { borrowerId, type, amount, item, dueDate } = req.body;
  const loan = await prisma.loan.create({ data: {
    borrowerId, type, amount, outstanding: amount, item, dueDate: dueDate ? new Date(dueDate) : null
  }});
  res.json(loan);
});

router.post("/:id/repay", requireRole("ADMIN","ACCOUNTANT"), async (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  await prisma.repayment.create({ data: { loanId: id, amount, notes }});
  const newOutstanding = Math.max(0, loan.outstanding - amount);
  await prisma.loan.update({ where: { id }, data: { outstanding: newOutstanding, status: newOutstanding === 0 ? "CLOSED" : loan.status }});
  res.json({ ok: true });
});

router.get("/", requireRole("ADMIN","ACCOUNTANT"), async (req, res) => {
  const loans = await prisma.loan.findMany({ include: { repayments: true, borrower: true }});
  res.json(loans);
});

export default router;
