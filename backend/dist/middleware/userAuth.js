"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeAdmin = (req, res, next) => {
    (async () => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            const user = await User_1.default.findByPk(req.user.userId, {
                attributes: ["id", "role"],
            });
            if (!user) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            if (user.role !== "admin") {
                return res.status(403).json({ message: "Forbidden: admin only" });
            }
            return next();
        }
        catch {
            return res.status(500).json({ message: "Authorization failed" });
        }
    })();
};
exports.authorizeAdmin = authorizeAdmin;
