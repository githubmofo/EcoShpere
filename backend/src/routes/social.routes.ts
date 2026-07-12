// src/routes/social.routes.ts
import { Router } from "express";
import { SocialController } from "../controllers/social.controller";

const router = Router();

router.get("/dashboard", SocialController.getDashboardMetrics);

router.get("/csr-activities", SocialController.getCsrActivities);
router.get("/participation", SocialController.getParticipation);
router.get("/diversity-summary", SocialController.getDiversitySummary);

export default router;
