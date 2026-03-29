import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export type Role = "user" | "college" | "admin";

interface JwtPayload {
  userId: number;
  email: string;
  role?: Role;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (async () => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ["id", "role"],
      });

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: admin only" });
      }

      return next();
    } catch {
      return res.status(500).json({ message: "Authorization failed" });
    }
  })();
};
