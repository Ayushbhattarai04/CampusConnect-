import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface EventRegistrationAttributes {
  registrationId?: number;
  eventId?: number;
  userId: number;
  registeredname: string;
  registeredemail?: string;
  numberoftickets?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type EventRegistrationCreationAttributes = Optional<
  EventRegistrationAttributes,
  "registrationId"
>;

class EventRegistration
  extends Model<
    EventRegistrationAttributes,
    EventRegistrationCreationAttributes
  >
  implements EventRegistrationAttributes
{
  eventId?: number;
  userId!: number;
  registeredname!: string;
  registeredemail?: string;
  numberoftickets?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

EventRegistration.init(
  {
    registrationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "registrationid",
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    registeredname: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registeredemail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    numberoftickets: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "EventRegistration",
    tableName: "eventregistrations",
  },
);

EventRegistration.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
EventRegistration.belongsTo(User, {
  foreignKey: "eventId",
  onDelete: "CASCADE",
});

export default EventRegistration;
