import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface CommunityAttributes {
  communityId?: number;
  userId: number;
  name: string;
  description?: string;
  affiliation: string;
  verified?: "verified" | "unverified";
  comProfileUrl?: string;
  BannerUrl?: string;
  isPublic: "Public" | "Private";
  membersCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommunityCreationAttributes = Optional<CommunityAttributes, "communityId">;

class Community
  extends Model<CommunityAttributes, CommunityCreationAttributes>
  implements CommunityAttributes
{
  communityId?: number;
  userId!: number;
  name!: string;
  description?: string;
  affiliation!: string;
  verified!: "verified" | "unverified";
  comProfileUrl?: string;
  BannerUrl?: string;
  isPublic!: "Public" | "Private";
  membersCount!: number;
  createdAt?: Date;
  updatedAt?: Date;
}

Community.init(
  {
    communityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "communityid",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    affiliation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.ENUM("verified", "unverified"),
      allowNull: true,
    },
    BannerUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comProfileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.ENUM("Public", "Private"),
        allowNull: false,
    },
    membersCount: {
      type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    modelName: "Community",
    tableName: "communities",
  },
);

Community.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Community;
