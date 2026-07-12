// src/routes/reports.routes.ts
import { Router } from "express";
import { ReportsController } from "../controllers/reports.controller";

const router = Router();

router.get("/data", ReportsController.getData);
router.post("/custom", ReportsController.custom);

export default router;
