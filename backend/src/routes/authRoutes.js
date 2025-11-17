// routes/authRoutes.js

import express from "express";
import { userLogin } from "../controllers/authController.js";

const router = express.Router();

/**
 * LOGIN ROUTES
 * /user/login     → Admin, HR, Manager login
 * /employee/login → Employee login (after HR approves)
 */

// Admin / HR / Manager Login
router.post("/user/login", userLogin);

export default router;
