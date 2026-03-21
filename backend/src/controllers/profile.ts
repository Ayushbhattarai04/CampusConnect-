import { Request, Response } from "express";
import Profile from "../models/Profile";
import User from "../models/User";
import sequelize from "../config/database";

// Get profile by user ID
export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email", "institution", "studId"],
        },
      ],
    });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Create or update profile
export const createOrUpdateProfile = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { username, email, institution, studId, bio, profilePic } = req.body;

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (institution !== undefined) user.institution = institution;
    if (studId !== undefined) user.studId = studId;
    await user.save({ transaction });

    let profile = await Profile.findOne({ where: { userId }, transaction });
    if (profile) {
      profile.bio = bio ?? profile.bio;
      profile.profilePic = profilePic ?? profile.profilePic;
      await profile.save({ transaction });
    } else {
      profile = await Profile.create(
        {
          userId: parseInt(userId, 10),
          bio: bio ?? "",
          profilePic: profilePic ?? "",
        },
        { transaction },
      );
    }

    await transaction.commit();

    const profileWithUser = await Profile.findOne({
      where: { profileId: profile.profileId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email", "institution", "studId"],
        },
      ],
    });
    res.json(profileWithUser ?? profile);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to create or update profile" });
  }
};
