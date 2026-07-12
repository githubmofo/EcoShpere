import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller";

const router = Router();

// Departments
router.get("/departments", SettingsController.getDepartments);
router.post("/departments", SettingsController.createDepartment);
router.patch("/departments/:id", SettingsController.updateDepartment);
router.delete("/departments/:id", SettingsController.deleteDepartment);

// Categories
router.get("/categories", SettingsController.getCategories);
router.post("/categories", SettingsController.createCategory);
router.patch("/categories/:id", SettingsController.updateCategory);

// ESG Config
router.get("/esg-config", SettingsController.getEsgConfig);
router.patch("/esg-config", SettingsController.updateEsgConfig);

// Notification Settings
router.get("/notification-settings", SettingsController.getNotifications);
router.patch("/notification-settings", SettingsController.updateNotifications);

export default router;
