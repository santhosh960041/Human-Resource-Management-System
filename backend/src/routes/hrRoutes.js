// routes/hrRoutes.js

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

import {
  CreateUser,
  getAllEmployees,
  getEmployeesByManager,
  assignManager
} from "../controllers/hrController.js";

const router = express.Router();

// ------------------------------
// HR + Admin Routes (ONLY)
// ------------------------------
router.use(protect);             
router.use(allowRoles(["hr", "admin"]));     

// Create employee
router.post("/create-employee", CreateUser);

// Get all employees
router.get("/all", getAllEmployees);

// Assign manager
router.post("/assign-manager/:empId", assignManager);

// ------------------------------
// Manager Routes
// ------------------------------
router.get(
  "/my-employees", 
  allowRoles(["manager", "hr", "admin"]), 
  getEmployeesByManager
);

export default router;
