// routes/authRoutes.js

import express from "express";
import { userLogin } from "../controllers/authController.js";
import { loginSchema} from "../validations/auth.validation.js"; 
import {  validate } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * LOGIN ROUTES
 * /user/login     → Admin, HR, Manager login
 * /employee/login → Employee login (after HR approves)
 */

// Admin / HR / Manager Login
router.post("/user/login",validate(loginSchema), userLogin);

export default router;
