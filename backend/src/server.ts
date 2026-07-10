import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth";
import farmersRoutes from "./routes/farmers";
import fieldsRoutes from "./routes/fields";
import loansRoutes from "./routes/loans";
import plantingsRoutes from "./routes/plantings";
import processingsRoutes from "./routes/processings";
import purchasesRoutes from "./routes/purchases";
import exportsRoutes from "./routes/exports";
import lotsRoutes from "./routes/lots";
import stockRoutes from "./routes/stock";
import { authMiddleware } from "./middleware/auth";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/farmers", authMiddleware, farmersRoutes);
app.use("/api/fields", authMiddleware, fieldsRoutes);
app.use("/api/loans", authMiddleware, loansRoutes);
app.use("/api/plantings", authMiddleware, plantingsRoutes);
app.use("/api/processings", authMiddleware, processingsRoutes);
app.use("/api/purchases", authMiddleware, purchasesRoutes);
app.use("/api/exports", authMiddleware, exportsRoutes);
app.use("/api/lots", authMiddleware, lotsRoutes);
app.use("/api/stock", authMiddleware, stockRoutes);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening ${port}`));
