"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class Community extends sequelize_1.Model {
}
Community.init({
    communityId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "communityid",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    affiliation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    verified: {
        type: sequelize_1.DataTypes.ENUM("verified", "unverified"),
        allowNull: true,
    },
    BannerUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    comProfileUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isPublic: {
        type: sequelize_1.DataTypes.ENUM("Public", "Private"),
        allowNull: false,
    },
    membersCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    modelName: "Community",
    tableName: "communities",
});
Community.belongsTo(User_1.default, { foreignKey: "userId", onDelete: "CASCADE" });
exports.default = Community;
