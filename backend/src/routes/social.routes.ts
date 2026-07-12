// src/routes/social.routes.ts
import { Router } from "express";
import { SocialController } from "../controllers/social.controller";

const router = Router();

router.get("/csr-activities", SocialController.getCsrActivities);
router.post("/csr-activities", SocialController.createCsrActivity);
router.get("/participation", SocialController.getParticipation);
router.post("/participation", SocialController.joinActivity);
router.get("/diversity-training", SocialController.getDiversityTraining);

export default router;
