import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Post from "./Posts";

interface CommentAttributes {
  commentId?: number;
  userId: number;
  postId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<CommentAttributes, "commentId">;

class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  commentId?: number;
  userId!: number;
  postId!: number;
  content!: string;
}

Comment.init(
  {
    commentId: {
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
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "postId",
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
    modelName: "Comment",
  },
);
Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Post, { foreignKey: "postId" });
export default Comment;
