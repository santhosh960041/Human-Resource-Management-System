import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";


// HR Creates a New User (Manager or Employee)

export const CreateUser = async (req, res) => {
  try {
    const { name, email, managerId, role, password } = req.body;


    const requesterRole = req.user.role?.toLowerCase();
    const newUserRole = role?.toLowerCase();



      // HR should NOT be able to create admin
    if (requesterRole === "hr" && newUserRole === "admin") {
      return res.status(403).json({
        message: "HR does not have permission to create an Admin.",
      });
    }

  
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      role: role?.toLowerCase(),
      manager: managerId || null, 
      password: encryptedPassword,
      createdBy: req.user.id
    });

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




// HR Gets ALL Employees (optional dashboard)

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




// Manager Gets Employees Assigned Under Him

export const getEmployeesByManager = async (req, res) => {
  try {
    // Only manager, HR, admin can see
    const role = req.user.role.toLowerCase();

    if (!["manager", "hr", "admin"].includes(role)) {
      return res.status(403).json({
        message: "Access denied. Only managers or HR/admin can view employees."
      });
    }

    const managerId = req.user.id;

    const manager = await User.findById(managerId)
      .populate({
        path: "employeesUnderManager",
        select: "name email role manager"
      });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    return res.json({
      message: "Employees under this manager",
      employees: manager.employeesUnderManager || []
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};



// HR Assigns or Changes Manager for an Employee Manually

import mongoose from "mongoose";

export const assignManager = async (req, res) => {
  try {
    const empId = req.params.empId;
    const { managerId } = req.body;

    // Convert to ObjectId
    const empObjectId = new mongoose.Types.ObjectId(empId);

    // 1. Find employee
    const employee = await User.findById(empId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2. Find manager
    const newManager = await User.findById(managerId);
    if (!newManager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // 3. Remove employee from OLD manager
    if (employee.manager) {
      const oldManager = await User.findById(employee.manager);

      if (oldManager) {
        oldManager.employeesUnderManager = oldManager.employeesUnderManager.filter(
          (id) => id.toString() !== empId.toString()
        );
        await oldManager.save();
      }
    }

    // 4. Add employee to NEW manager (Avoid duplicates)
    const alreadyExists = newManager.employeesUnderManager.some(
      (id) => id.toString() === empId.toString()
    );

    if (!alreadyExists) {
      newManager.employeesUnderManager.push(empObjectId);
    }

    await newManager.save();

    // 5. Update employee record
    employee.manager = managerId;
    await employee.save();

    return res.json({
      message: "Manager assigned successfully",
      employee
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
