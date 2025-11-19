// middlewares/roleMiddleware.js


export const allowRoles = (allowedRoles = []) => {
  
  return (req, res, next) => {
    // No user found
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // User role from authMiddleware
    const userRole = req.user.role.toLowerCase();


    // Check allowed roles
    if (!allowedRoles.includes(userRole)) {
      console.log(allowRoles);
      return res.status(403).json({
        message: "Access denied. You do not have permission."
      });
    }

    next();
  };
};
