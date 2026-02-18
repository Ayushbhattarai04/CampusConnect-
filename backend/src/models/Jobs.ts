import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface JobAttributes {
  jobId?: number;
  userId: number;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type JobCreationAttributes = Optional<JobAttributes, "jobId">;

class Job
  extends Model<JobAttributes, JobCreationAttributes>
  implements JobAttributes
{
  jobId?: number;
  userId!: number;
  title!: string;
  company!: string;
  location?: string;
  salary?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

Job.init(
  {
    jobId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "jobid",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salary: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    modelName: "Job",
    tableName: "jobs",
  },
);

Job.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Job;
