import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Post from "./Posts";

interface LikeAttributes {
  likeId?: number;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type LikeCreationAttributes = Optional<LikeAttributes, "likeId">;

class Like
  extends Model<LikeAttributes, LikeCreationAttributes>
  implements LikeAttributes
{
  likeId?: number;
  userId!: number;
  postId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

Like.init(
  {
    likeId: {
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
    modelName: "Like",
  },
);
Like.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Like.belongsTo(Post, { foreignKey: "postId", onDelete: "CASCADE" });
export default Like;
