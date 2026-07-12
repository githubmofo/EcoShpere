// src/routes/gamification.routes.ts
import { Router } from "express";
import { GamificationController } from "../controllers/gamification.controller";

const router = Router();

router.get("/challenges", GamificationController.getChallenges);
router.get("/participation", GamificationController.getParticipation);
router.get("/badges", GamificationController.getBadges);
router.get("/rewards", GamificationController.getRewards);
router.get("/leaderboard", GamificationController.getLeaderboard);
router.get("/summary", GamificationController.getSummary);

router.post("/participation/:id/approve", GamificationController.approveParticipation);
router.post("/participation/:id/reject", GamificationController.rejectParticipation);
router.post("/rewards/:id/redeem", GamificationController.redeemReward);
router.patch("/challenges/:id/status", GamificationController.updateChallengeStatus);
router.post("/challenges", GamificationController.createChallenge);

export default router;
