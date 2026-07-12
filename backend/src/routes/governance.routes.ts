// src/routes/governance.routes.ts
import { Router } from "express";
import { GovernanceController } from "../controllers/governance.controller";

const router = Router();

router.get("/dashboard", GovernanceController.getDashboardMetrics);

router.get("/policies", GovernanceController.getPolicies);
router.get("/acknowledgements", GovernanceController.getAcknowledgements);
router.get("/audits", GovernanceController.getAudits);
router.get("/compliance-issues", GovernanceController.getComplianceIssues);

router.post("/acknowledgements", GovernanceController.acknowledgePolicy);
router.post("/policies", GovernanceController.createPolicy);
router.post("/policies/:id/remind", GovernanceController.remindPolicy);

export default router;
