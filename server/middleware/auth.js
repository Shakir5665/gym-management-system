// middleware/auth.js
import jwt from "jsonwebtoken";

export default async function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, gymId, role }

    if (decoded.role === "SUPER_ADMIN") return next();

    if (decoded.gymId) {
      const Gym = (await import("../models/Gym.js")).default;
      const gym = await Gym.findById(decoded.gymId).select("isActive isApproved");
      if (gym && (gym.isActive === false || gym.isApproved === false)) {
        return res.status(403).json({ message: "Gym account deactivated or pending approval" });
      }
    }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}