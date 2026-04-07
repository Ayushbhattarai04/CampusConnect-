import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface CommunityMemberAttributes {
  memberId?: number;
  communityId?: number;
  userId: number;
  role: "admin" | "moderator" | "member";
  createdAt?: Date;
  updatedAt?: Date;
}

type CommunityMemberCreationAttributes = Optional<
  CommunityMemberAttributes,
  "memberId"
>;

class CommunityMember
  extends Model<CommunityMemberAttributes, CommunityMemberCreationAttributes>
  implements CommunityMemberAttributes
{
  memberId?: number;
  communityId?: number;
  userId!: number;
  role!: "admin" | "moderator" | "member";
  createdAt?: Date;
  updatedAt?: Date;
}

CommunityMember.init(
  {
    memberId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "memberid",
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
    role: {
      type: DataTypes.ENUM("admin", "moderator", "member"),
      allowNull: false,
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
    modelName: "CommunityMember",
    tableName: "community_members",
  },
);

CommunityMember.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default CommunityMember;
