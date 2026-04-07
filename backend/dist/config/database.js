"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || "auth_db", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
});
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
        const shouldAlter = process.env.DB_SYNC_ALTER === "true";
        const shouldForce = process.env.DB_SYNC_FORCE === "true";
        await sequelize.sync({ alter: shouldAlter, force: shouldForce });
        console.log("Database synchronized");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = sequelize;
