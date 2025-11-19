import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

import {
  createTask,
  getMyTasks,
  updateTaskStatus,
  getTasksAssignedByMe
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * ==========================
 *  TASK ROUTES
 * ==========================
 */

// ----------------------------------------
// Admin / HR / Manager → Assign Task
// ----------------------------------------
router.post("/assign",protect,allowRoles(["admin", "hr", "manager"]),createTask);

// ----------------------------------------
// Admin / HR / Manager → View tasks they assigned
// ----------------------------------------
router.get("/assigned",protect,allowRoles(["admin", "hr", "manager"]),getTasksAssignedByMe);

// ----------------------------------------
// Employee → View only their own tasks
// ----------------------------------------
router.get("/my-tasks",protect,allowRoles(["employee", "manager", "hr", "admin"]),getMyTasks);

// ----------------------------------------
// Employee → Update their task status only
// ----------------------------------------
router.put("/update-status/:taskId",protect,allowRoles(["employee"]),updateTaskStatus);

export default router;
