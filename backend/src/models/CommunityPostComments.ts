import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import CommunityPost from "./CommunityPosts";

interface CommunityPostCommentAttributes {
  communityPostCommentId?: number;
  userId: number;
  communityPostsId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommunityPostCommentCreationAttributes = Optional<
  CommunityPostCommentAttributes,
  "communityPostCommentId"
>;

class CommunityPostComment
  extends Model<
    CommunityPostCommentAttributes,
    CommunityPostCommentCreationAttributes
  >
  implements CommunityPostCommentAttributes
{
  communityPostCommentId?: number;
  userId!: number;
  communityPostsId!: number;
  content!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

CommunityPostComment.init(
  {
    communityPostCommentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    communityPostsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CommunityPost,
        key: "communityPostsId",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
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
    modelName: "CommunityPostComment",
    tableName: "community_post_comments",
  },
);

CommunityPostComment.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
CommunityPostComment.belongsTo(CommunityPost, {
  foreignKey: "communityPostsId",
  onDelete: "CASCADE",
});

export default CommunityPostComment;
