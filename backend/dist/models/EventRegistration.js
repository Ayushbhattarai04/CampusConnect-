"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Events_1 = __importDefault(require("./Events"));
class EventRegistration extends sequelize_1.Model {
}
EventRegistration.init({
    registrationId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "registrationid",
    },
    eventId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Events_1.default,
            key: "eventid",
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
    registeredname: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    registeredemail: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    numberoftickets: {
        type: sequelize_1.DataTypes.INTEGER,
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
    modelName: "EventRegistration",
    tableName: "eventregistrations",
});
EventRegistration.belongsTo(Events_1.default, { foreignKey: "eventId" });
EventRegistration.belongsTo(User_1.default, { foreignKey: "userId" });
exports.default = EventRegistration;
