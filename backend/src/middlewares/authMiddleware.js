// middlewares/authMiddleware.js
// middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {

    let token;

    // Check "Authorization: Bearer TOKEN"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user from decoded id
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    // attach user to req for downstream middlewares
    req.user = {
      id: user._id.toString(),
      role: user.role,    
      email: user.email,
      type: "user"
    };


    return next();

  } catch (err) {
    // Unexpected errors
    console.error("protect: unexpected error", err);
    return res.status(500).json({ message: "Server Error" });
  }
};



export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

