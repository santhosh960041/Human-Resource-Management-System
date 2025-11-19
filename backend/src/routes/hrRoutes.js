// routes/hrRoutes.js

import express from "express";
import { protect, validate } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { createUserSchema } from "../validations/auth.validation.js";
import {
  CreateUser,
  getAllEmployees,
  getEmployeesByManager,
  assignManager
} from "../controllers/hrController.js";

const router = express.Router();


 // HR & ADMIN ROUTES ONLY


// Create new user (HR + Admin)
router.post("/create-user",protect,allowRoles(["hr", "admin"]),validate(createUserSchema),CreateUser);

// Get all employees (HR + Admin)
router.get("/all",protect,allowRoles(["hr", "admin"]),getAllEmployees);

// Assign / Change Manager (HR + Admin)
router.post("/assign-manager/:empId",protect,allowRoles(["hr", "admin"]),assignManager);



   // MANAGER ROUTES


// Manager can see ONLY employees under him
router.get("/my-employees",protect,allowRoles(["manager", "hr", "admin"]), getEmployeesByManager);

export default router;
