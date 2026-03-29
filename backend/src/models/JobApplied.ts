import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Job from "./Jobs";

interface AppliedAttributes {
  appliedId?: number;
  jobId: number;
  userId: number;
  applierdescription?: string;
  cv?: string;
  cvOriginalName?: string;
  cvType?: string;
  appliersemail?: string;
  status: "accepted" | "rejected" | "pending";
  createdAt?: Date;
  updatedAt?: Date;
}

type AppliedCreationAttributes = Optional<AppliedAttributes, "appliedId">;

class JobApplied
  extends Model<AppliedAttributes, AppliedCreationAttributes>
  implements AppliedAttributes
{
  declare appliedId: number;
  declare jobId: number;
  declare userId: number;
  declare applierdescription?: string;
  declare cv?: string;
  declare cvOriginalName?: string;
  declare cvType?: string;
  declare appliersemail?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare status: "accepted" | "rejected" | "pending";
}

JobApplied.init(
  {
    appliedId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "appliedid",
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Job, key: "jobid" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    cv: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    cvOriginalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cvType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    applierdescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appliersemail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("accepted", "rejected", "pending"),
      allowNull: false,
      defaultValue: "rejected",
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
    modelName: "JobApplied",
    tableName: "jobapplied",
  },
);

JobApplied.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
JobApplied.belongsTo(Job, { foreignKey: "jobId", onDelete: "CASCADE" });

export default JobApplied;
