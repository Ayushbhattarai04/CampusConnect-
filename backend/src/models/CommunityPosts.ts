import sequelize from "../config/database";
import Community from "./Communities";
import User from "./User";

import { DataTypes, Model, Optional } from "sequelize";

interface CommunityPostAttributes {
  communityPostsId?: number;
  communityId: number;
  userId: number;
  content: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommunityPostCreationAttributes = Optional<
  CommunityPostAttributes,
  "communityPostsId"
>;

class CommunityPost
  extends Model<CommunityPostAttributes, CommunityPostCreationAttributes>
  implements CommunityPostAttributes
{
  communityPostsId?: number;
  communityId!: number;
  userId!: number;
  content!: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

CommunityPost.init(
  {
    communityPostsId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
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
    modelName: "CommunityPost",
    tableName: "communityposts",
  },
);

CommunityPost.belongsTo(Community, {
  foreignKey: "communityId",
  onDelete: "CASCADE",
});
CommunityPost.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default CommunityPost;
