"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateProfile = exports.getProfileByUserId = void 0;
const Profile_1 = __importDefault(require("../models/Profile"));
const User_1 = __importDefault(require("../models/User"));
const database_1 = __importDefault(require("../config/database"));
// Get profile by user ID
const getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await Profile_1.default.findOne({
            where: { userId },
            include: [
                {
                    model: User_1.default,
                    attributes: ["id", "username", "email", "institution", "studId"],
                },
            ],
        });
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};
exports.getProfileByUserId = getProfileByUserId;
// Create or update profile
const createOrUpdateProfile = async (req, res) => {
    const transaction = await database_1.default.transaction();
    try {
        const { userId } = req.params;
        const { username, email, institution, studId, bio, profilePic } = req.body;
        const user = await User_1.default.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: "User not found" });
        }
        if (username !== undefined)
            user.username = username;
        if (email !== undefined)
            user.email = email;
        if (institution !== undefined)
            user.institution = institution;
        if (studId !== undefined)
            user.studId = studId;
        await user.save({ transaction });
        let profile = await Profile_1.default.findOne({ where: { userId }, transaction });
        if (profile) {
            profile.bio = bio ?? profile.bio;
            profile.profilePic = profilePic ?? profile.profilePic;
            await profile.save({ transaction });
        }
        else {
            profile = await Profile_1.default.create({
                userId: parseInt(userId, 10),
                bio: bio ?? "",
                profilePic: profilePic ?? "",
            }, { transaction });
        }
        await transaction.commit();
        const profileWithUser = await Profile_1.default.findOne({
            where: { profileId: profile.profileId },
            include: [
                {
                    model: User_1.default,
                    attributes: ["id", "username", "email", "institution", "studId"],
                },
            ],
        });
        res.json(profileWithUser ?? profile);
    }
    catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: "Failed to create or update profile" });
    }
};
exports.createOrUpdateProfile = createOrUpdateProfile;
