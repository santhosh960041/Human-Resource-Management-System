// middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check "Authorization: Bearer TOKEN"
    console.log("Auth middleware enters");
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded → { id, role, type }

  
    //  Admin / HR / Manager (User model)

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = {
      id: user._id,
      role: user.role,    
      email: user.email,
      type: "user"
    };

    return next();

  } catch (err) {
    console.log("Auth error:", err);
    return res.status(401).json({ message: "Not authorized" });
  }
};
