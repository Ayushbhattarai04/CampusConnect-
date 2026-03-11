import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface EventAttributes {
  eventId?: number;
  userId: number;
  organizer?: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  schedules?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type EventCreationAttributes = Optional<EventAttributes, "eventId">;

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  eventId?: number;
  userId!: number;
  organizer?: string;
  title!: string;
  description?: string;
  date!: Date;
  location?: string;
  fee?: string;
  schedules?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

Event.init(
  {
    eventId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "eventid",
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
    organizer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    schedules: {
      type: DataTypes.TIME,
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
    modelName: "Event",
    tableName: "events",
  },
);

Event.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Event;
