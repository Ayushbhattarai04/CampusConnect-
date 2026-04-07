"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class CommunityMember extends sequelize_1.Model {
}
CommunityMember.init({
    memberId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "memberid",
    },
    communityId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "communities",
            key: "communityid",
        },
        onDelete: "CASCADE",
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
    role: {
        type: sequelize_1.DataTypes.ENUM("admin", "moderator", "member"),
        allowNull: false,
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
    modelName: "CommunityMember",
    tableName: "community_members",
});
CommunityMember.belongsTo(User_1.default, { foreignKey: "userId", onDelete: "CASCADE" });
exports.default = CommunityMember;
