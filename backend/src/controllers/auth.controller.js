import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { signupValidation } from "../validations/auth.validation.js";

export const signup = async (req, res) => {
  try {
    // Validate input
    const { error } = signupValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, roleId, orgId } = req.body;

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: roleId || "user",
      orgId: orgId || null
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        orgId: user.orgId
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
