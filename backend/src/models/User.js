import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "hr", "manager", "employee"],
    required: true
  },

  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",    // manager is always a User
    required: false
  },

  // Optional: For manager → list of employees under them
  employeesUnderManager: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }] ,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }


}, { timestamps: true });

export default mongoose.model("User", userSchema);
