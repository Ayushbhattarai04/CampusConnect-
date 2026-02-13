import sequelize from "../config/database";
import User from "./User";
import { DataTypes, Model, Optional } from "sequelize";

interface PostAttributes {
  postId?: number;
  userId: number;
  content: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type PostCreationAttributes = Optional<PostAttributes, "postId">;

class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  postId?: number;
  userId!: number;
  content!: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

Post.init(
  {
    postId: {
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
    modelName: "Post",
  },
);

Post.belongsTo(User, { foreignKey: "userId" });

export default Post;
