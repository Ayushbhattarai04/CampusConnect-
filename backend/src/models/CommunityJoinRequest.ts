import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export type CommunityJoinRequestStatus = "pending" | "accepted" | "rejected";

interface CommunityJoinRequestAttributes {
  requestId?: number;
  communityId: number;
  userId: number;
  status: CommunityJoinRequestStatus;
  reviewedBy?: number | null;
  reviewedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommunityJoinRequestCreationAttributes = Optional<
  CommunityJoinRequestAttributes,
  "requestId" | "status" | "reviewedBy" | "reviewedAt"
>;

class CommunityJoinRequest
  extends Model<
    CommunityJoinRequestAttributes,
    CommunityJoinRequestCreationAttributes
  >
  implements CommunityJoinRequestAttributes
{
  requestId?: number;
  communityId!: number;
  userId!: number;
  status!: CommunityJoinRequestStatus;
  reviewedBy?: number | null;
  reviewedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

CommunityJoinRequest.init(
  {
    requestId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "requestid",
    },
    communityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "communities",
        key: "communityid",
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
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reviewedby",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewedat",
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
    modelName: "CommunityJoinRequest",
    tableName: "community_join_requests",
    indexes: [
      {
        unique: true,
        fields: ["communityId", "userId"],
        name: "uniq_community_join_request",
      },
    ],
  },
);

CommunityJoinRequest.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

export default CommunityJoinRequest;
