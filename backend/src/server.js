import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.send("HRMS Backend API Running...");
});


app.use("/api/auth", authRoutes);          // Login routes (user + employee)
app.use("/api/hr", hrRoutes);              // HR routes (create, approve)
//app.use("/api/tasks", taskRoutes);         // Manager/Admin task assign



app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});



app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server Error" });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(` Server running on port ${PORT}`)
);
