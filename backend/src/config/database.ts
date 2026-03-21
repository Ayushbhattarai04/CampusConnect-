import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "auth_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    const shouldAlter = process.env.DB_SYNC_ALTER === "true";
    const shouldForce = process.env.DB_SYNC_FORCE === "true";

    await sequelize.sync({ alter: shouldAlter, force: shouldForce });
    console.log("Database synchronized");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default sequelize;
