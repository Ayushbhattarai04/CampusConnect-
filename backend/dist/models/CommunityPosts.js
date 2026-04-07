"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const Communities_1 = __importDefault(require("./Communities"));
const User_1 = __importDefault(require("./User"));
const sequelize_1 = require("sequelize");
class CommunityPost extends sequelize_1.Model {
}
CommunityPost.init({
    communityPostsId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
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
    modelName: "CommunityPost",
    tableName: "communityposts",
});
CommunityPost.belongsTo(Communities_1.default, {
    foreignKey: "communityId",
    onDelete: "CASCADE",
});
CommunityPost.belongsTo(User_1.default, { foreignKey: "userId", onDelete: "CASCADE" });
exports.default = CommunityPost;
