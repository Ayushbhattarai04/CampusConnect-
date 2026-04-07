"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Jobs_1 = __importDefault(require("./Jobs"));
class JobApplied extends sequelize_1.Model {
}
JobApplied.init({
    appliedId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "appliedid",
    },
    jobId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Jobs_1.default, key: "jobid" },
        onDelete: "CASCADE",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: User_1.default, key: "id" },
        onDelete: "CASCADE",
    },
    cv: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    cvOriginalName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    cvType: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    applierdescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    appliersemail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("accepted", "rejected", "pending"),
        allowNull: false,
        defaultValue: "rejected",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    modelName: "JobApplied",
    tableName: "jobapplied",
});
JobApplied.belongsTo(User_1.default, { foreignKey: "userId", onDelete: "CASCADE" });
JobApplied.belongsTo(Jobs_1.default, { foreignKey: "jobId", onDelete: "CASCADE" });
exports.default = JobApplied;
