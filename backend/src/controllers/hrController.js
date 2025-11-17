import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";


// ======================================================
// HR Creates a New User (Manager or Employee)
// ======================================================
export const CreateUser = async (req, res) => {
  try {
    const { name, email, managerId, role, password } = req.body;

    // 1. Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Password validation
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 3. Encrypt password
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = await User.create({
      name,
      email,
      role: role?.toLowerCase(),
      manager: managerId || null,  // HR chooses manager manually
      password: encryptedPassword,
      createdBy: req.user.id
    });

    // 5. Only assign employee under manager IF HR selected a manager
    if (managerId) {
      const manager = await User.findById(managerId);

      if (!manager) {
        return res.status(404).json({ message: "Selected manager not found" });
      }

      // Avoid duplicate pushes
      if (!manager.employeesUnderManager.includes(newUser._id)) {
        manager.employeesUnderManager.push(newUser._id);
      }

      await manager.save();
    }

    res.json({
      message: "User created successfully",
      user: newUser
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// ======================================================
// HR Gets ALL Employees (optional dashboard)
// ======================================================
export const getAllEmployees = async (req, res) => {
  try {
    const users = await User.find()
      .populate("manager", "name email role")
      .populate("createdBy", "name email")
      .populate("employeesUnderManager", "name email role");

    res.json(users);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// ======================================================
// Manager Gets Employees Assigned Under Him
// ======================================================
export const getEmployeesByManager = async (req, res) => {
  try {
    const managerId = req.user.id; // Manager ID from JWT token

    const manager = await User.findById(managerId)
      .populate({
        path: "employeesUnderManager",
        select: "name email role manager"
      });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.json({
      message: "Employees under this manager",
      employees: manager.employeesUnderManager || []
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// ======================================================
// HR Assigns or Changes Manager for an Employee Manually
// ======================================================
export const assignManager = async (req, res) => {
  try {
    const empId = req.params.empId;
    const { managerId } = req.body;

    // 1. Check employee exists
    const employee = await User.findById(empId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2. Check manager exists
    const newManager = await User.findById(managerId);
    if (!newManager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // 3. Remove employee from old manager list (if any)
    if (employee.manager) {
      const oldManager = await User.findById(employee.manager);
      if (oldManager) {
        oldManager.employeesUnderManager = oldManager.employeesUnderManager.filter(
          (id) => id.toString() !== empId.toString()
        );
        await oldManager.save();
      }
    }

    // 4. Add employee to new manager's list (avoid duplicates)
    if (!newManager.employeesUnderManager.includes(empId)) {
      newManager.employeesUnderManager.push(empId);
    }
    await newManager.save();

    // 5. Update employee's manager field
    employee.manager = managerId;
    await employee.save();

    res.json({
      message: "Manager assigned successfully",
      employee
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
