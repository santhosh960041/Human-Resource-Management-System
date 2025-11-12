import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; 

// Load environment variables
dotenv.config();

const app = express();
// Test route
app.get("/", (req, res) => {
  res.send("HRMS Backend Running ");
});

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
});
