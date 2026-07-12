// src/routes/governance.routes.ts
import { Router } from "express";
import { GovernanceController } from "../controllers/governance.controller";

const router = Router();

router.get("/policies", GovernanceController.getPolicies);
router.post("/policies", GovernanceController.createPolicy);
router.get("/audits", GovernanceController.getAudits);
router.post("/audits", GovernanceController.createAudit);
router.get("/acknowledgements", GovernanceController.getAcknowledgements);
router.get("/compliance-issues", GovernanceController.getComplianceIssues);

export default router;
