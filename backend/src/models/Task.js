import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "low"
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

const Task = mongoose.model.task || mongoose.model("Task", taskSchema);
export default Task;
