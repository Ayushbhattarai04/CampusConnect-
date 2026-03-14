import { Request, Response } from "express";
import Profile from "../models/Profile";
import User from "../models/User";

// Get profile by user ID
export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({
      where: { userId },
        include: [{ model: User, attributes: ["username"] }],
    });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Create or update profile
export const createOrUpdateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { bio, profilePic } = req.body;
    let profile = await Profile.findOne({ where: { userId } });
    if (profile) {
      profile.bio = bio ?? profile.bio;
        profile.profilePic = profilePic ?? profile.profilePic;
        await profile.save();
    } else {
      profile = await Profile.create({ userId: parseInt(userId), bio, profilePic });
    }
    const profileWithUser = await Profile.findOne({
        where: { profileId: profile.profileId },
        include: [{ model: User, attributes: ["username"] }],
    });
    res.json(profileWithUser ?? profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to create or update profile" });
  }
};

