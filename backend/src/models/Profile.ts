import sequelize from "../config/database";
import User from "./User";
import { DataTypes, Model, Optional } from "sequelize";

interface ProfileAttributes {
  profileId?: number;
  userId: number;
  bio: string;
  profilePic: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProfileCreationAttributes = Optional<ProfileAttributes, "profileId">;

class Profile
  extends Model<ProfileAttributes, ProfileCreationAttributes>
  implements ProfileAttributes
{
  profileId?: number;
  userId!: number;
  bio!: string;
  profilePic!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

Profile.init(
  {
    profileId: {
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
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePic: {
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
    modelName: "Profile",
  },
);

Profile.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Profile;
