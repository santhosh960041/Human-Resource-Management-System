import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; 
import authRoutes from "./routes/auth.routes.js";
import { signup } from "./controllers/auth.controller.js";


// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Test route
app.use("/api/auth", authRoutes);

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
});
