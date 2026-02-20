import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface TutionAttributes {
  tutionId?: number;
  userId: number;
  tutor?: string;
  subject: string;
  location?: string;
  fee?: string;
  description?: string;
  schedules?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type TutionCreationAttributes = Optional<TutionAttributes, "tutionId">;

class Tution
  extends Model<TutionAttributes, TutionCreationAttributes>
  implements TutionAttributes
{
  tutionId?: number;
  userId!: number;
  tutor!: string;
  subject!: string;
  location?: string;
  fee?: string;
  description?: string;
  schedules?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

Tution.init(
  {
    tutionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "tutionid",
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
    tutor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fee: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    schedules: {
      type: DataTypes.DATE,
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
    modelName: "Tution",
    tableName: "tutions",
  },
);

Tution.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Tution;
