"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommunityMembershipStatus = exports.joinCommunity = exports.getCommunityDetails = exports.getUserCommunities = exports.deleteCommunity = exports.updateCommunity = exports.getCommunityById = exports.getAllCommunities = exports.createCommunity = void 0;
const Communities_1 = __importDefault(require("../models/Communities"));
const CommunityMember_1 = __importDefault(require("../models/CommunityMember"));
// Create a community
const createCommunity = async (req, res) => {
    try {
        const { userId, name, description, affiliation, isPublic } = req.body;
        const community = await Communities_1.default.create({
            userId,
            name,
            description,
            affiliation,
            isPublic: isPublic ? "Public" : "Private",
            membersCount: 1,
        });
        // Add creator as admin in CommunityMember
        await CommunityMember_1.default.create({
            communityId: community.communityId,
            userId,
            role: "admin",
        });
        res.status(201).json(community);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create community" });
    }
};
exports.createCommunity = createCommunity;
// Get all communities
const getAllCommunities = async (req, res) => {
    try {
        const communities = await Communities_1.default.findAll();
        res.json(communities);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch communities" });
    }
};
exports.getAllCommunities = getAllCommunities;
// Get a community by ID
const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Communities_1.default.findByPk(id);
        if (!community)
            return res.status(404).json({ error: "Community not found" });
        res.json(community);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch community" });
    }
};
exports.getCommunityById = getCommunityById;
// Update a community
const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, affiliation, isPublic } = req.body;
        const community = await Communities_1.default.findByPk(id);
        if (!community)
            return res.status(404).json({ error: "Community not found" });
        await community.update({ name, description, affiliation, isPublic });
        res.json(community);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update community" });
    }
};
exports.updateCommunity = updateCommunity;
// Delete a community
const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Communities_1.default.findByPk(id);
        if (!community)
            return res.status(404).json({ error: "Community not found" });
        await community.destroy();
        res.json({ message: "Community deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete community" });
    }
};
exports.deleteCommunity = deleteCommunity;
// Get all communities a user is a member of
const getUserCommunities = async (req, res) => {
    try {
        const { userId } = req.params;
        const memberships = await CommunityMember_1.default.findAll({
            where: { userId },
        });
        const communityIds = memberships
            .map((membership) => membership.communityId)
            .filter((communityId) => communityId !== undefined);
        const communities = await Communities_1.default.findAll({
            where: { communityId: communityIds },
        });
        res.json(communities);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user communities" });
    }
};
exports.getUserCommunities = getUserCommunities;
// Get a community by ID with member count
const getCommunityDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await Communities_1.default.findByPk(id, {
            include: [{ model: CommunityMember_1.default, attributes: [] }],
            attributes: {
                include: [
                    [
                        Communities_1.default.sequelize.fn("COUNT", Communities_1.default.sequelize.col("CommunityMembers.memberId")),
                        "membersCount",
                    ],
                ],
            },
            group: ["Community.communityId"],
        });
        if (!community)
            return res.status(404).json({ error: "Community not found" });
        res.json(community);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch community details" });
    }
};
exports.getCommunityDetails = getCommunityDetails;
// Join a community
const joinCommunity = async (req, res) => {
    try {
        const communityId = Number(req.params.id);
        const userId = Number(req.body?.userId);
        if (!Number.isFinite(communityId) || communityId <= 0) {
            return res.status(400).json({ error: "Invalid community id" });
        }
        if (!Number.isFinite(userId) || userId <= 0) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        const community = await Communities_1.default.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }
        const existing = await CommunityMember_1.default.findOne({
            where: { communityId, userId },
        });
        if (existing) {
            const count = await CommunityMember_1.default.count({ where: { communityId } });
            await community.update({ membersCount: count });
            return res.status(200).json({
                message: "Already a member",
                membership: existing,
                membersCount: count,
            });
        }
        const membership = await CommunityMember_1.default.create({
            communityId,
            userId,
            role: "member",
        });
        const count = await CommunityMember_1.default.count({ where: { communityId } });
        await community.update({ membersCount: count });
        return res.status(201).json({
            message: "Joined community",
            membership,
            membersCount: count,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to join community" });
    }
};
exports.joinCommunity = joinCommunity;
// Check if a user is a member of a community
const getCommunityMembershipStatus = async (req, res) => {
    try {
        const communityId = Number(req.params.id);
        const userId = Number(req.params.userId);
        if (!Number.isFinite(communityId) || communityId <= 0) {
            return res.status(400).json({ error: "Invalid community id" });
        }
        if (!Number.isFinite(userId) || userId <= 0) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        const membership = await CommunityMember_1.default.findOne({
            where: { communityId, userId },
            attributes: ["memberId", "communityId", "userId", "role"],
        });
        return res.json({
            isMember: Boolean(membership),
            role: membership?.role ?? null,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch membership status" });
    }
};
exports.getCommunityMembershipStatus = getCommunityMembershipStatus;
