import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcrypt";

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  institution?: string | null;
  studId?: string | null;
  password: string;
  role: "user" | "college" | "admin";
  verified: boolean;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "institution" | "studId" | "verified" | "role"
> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public institution!: string | null;
  public studId!: string | null;
  public password!: string;
  public verified!: boolean;
  public role!: "user" | "college" | "admin";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to compare passwords
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    institution: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    studId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "college", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

export default User;
