import Task from "../models/Task.js";
import User from "../models/User.js";

// CREATE TASK (Admin, HR, Manager)
// Supports: mode = "single" or "all"

export const createTask = async (req, res) => {
  console.log("🔥 CREATE TASK HIT ONCE");

  try {
    const assignerId = req.user.id;
    const assignerRole = req.user.role.toLowerCase();

    const { mode, assignedTo, title, description, priority, dueDate } = req.body;

    let tasksCreated = [];

    //  ADMIN LOGIC 
    if (assignerRole === "admin") {

      // SINGLE USER
      if (mode === "single") {
        const user = await User.findById(assignedTo);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newTask = await Task.create({
          title,
          description,
          priority,
          dueDate,
          assignedTo,
          assignedBy: assignerId,
          owner: assignerId     
        });

        return res.json({ message: "Task assigned", task: newTask });
      }

      // ALL USERS
      if (mode === "all") {
        const users = await User.find();

        for (let u of users) {
          const t = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo: u._id,
            assignedBy: assignerId,
            owner: assignerId   
          });
          tasksCreated.push(t);
        }

        return res.json({
          message: "Task assigned to ALL users",
          tasks: tasksCreated
        });
      }
    }

    // ========== HR LOGIC ==========
    if (assignerRole === "hr") {

      // SINGLE
      if (mode === "single") {
        const user = await User.findById(assignedTo);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!["manager", "employee"].includes(user.role.toLowerCase())) {
          return res.status(403).json({ message: "HR can assign only to managers or employees" });
        }

        const task = await Task.create({
          title,
          description,
          priority,
          dueDate,
          assignedTo,
          assignedBy: assignerId,
          owner: assignerId   
        });

        return res.json({ message: "Task assigned", task });
      }

      // ALL managers + employees
      if (mode === "all") {
        const users = await User.find({ role: { $in: ["manager", "employee"] } });

        for (let u of users) {
          const t = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo: u._id,
            assignedBy: assignerId,
            owner: assignerId     // ⭐ AUTO OWNER
          });
          tasksCreated.push(t);
        }

        return res.json({
          message: "Task assigned to ALL managers & employees",
          tasks: tasksCreated
        });
      }
    }

    // ========== MANAGER LOGIC ==========
    if (assignerRole === "manager") {

      // SINGLE EMPLOYEE ONLY
      if (mode === "single") {
        const employee = await User.findById(assignedTo);

        if (!employee) return res.status(404).json({ message: "Employee not found" });
        if (employee.role !== "employee") {
          return res.status(403).json({ message: "Managers can assign only to employees" });
        }
        if (!employee.manager || employee.manager.toString() !== assignerId.toString()) {
          return res.status(403).json({
            message: "You can assign task only to employees under you"
          });
        }

        const task = await Task.create({
          title,
          description,
          priority,
          dueDate,
          assignedTo,
          assignedBy: assignerId,
          owner: assignerId       // ⭐ AUTO OWNER
        });

        return res.json({
          message: "Task assigned to employee",
          task
        });
      }

      // ALL EMPLOYEES UNDER THIS MANAGER
      if (mode === "all") {
        const employees = await User.find({ manager: assignerId });

        for (let emp of employees) {
          const t = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo: emp._id,
            assignedBy: assignerId,
            owner: assignerId      
          });
          tasksCreated.push(t);
        }

        return res.json({
          message: "Task assigned to ALL employees under this manager",
          tasks: tasksCreated
        });
      }
    }

    // EMPLOYEE cannot assign tasks
    if (assignerRole === "employee") {
      return res.status(403).json({
        message: "Employees cannot assign tasks"
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// EMPLOYEE: VIEW ONLY THEIR TASKS

export const getMyTasks = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const tasks = await Task.find({ assignedTo: employeeId })
      .populate("assignedBy", "name email role");

    res.json({ tasks });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// EMPLOYEE: UPDATE STATUS ONLY (in-progress, completed)

export const updateTaskStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status (allowed: in-progress, completed)"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== employeeId) {
      return res.status(403).json({ message: "You cannot update someone else's task" });
    }

    task.status = status;
    await task.save();

    res.json({ message: "Status updated", task });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};



// MANAGER / HR / ADMIN → VIEW TASKS THEY ASSIGNED

export const getTasksAssignedByMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ assignedBy: userId })
      .populate("assignedTo", "name email role");

    res.json({ tasks });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
