"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommunityPostById = exports.updateCommunityPost = exports.deleteCommunityPost = exports.getCommunityPosts = exports.createCommunityPost = void 0;
const CommunityPosts_1 = __importDefault(require("../models/CommunityPosts"));
const Communities_1 = __importDefault(require("../models/Communities"));
const User_1 = __importDefault(require("../models/User"));
const CommunityMember_1 = __importDefault(require("../models/CommunityMember"));
// Create a community post
const createCommunityPost = async (req, res) => {
    try {
        const { communityId, userId, content, imageUrl } = req.body;
        const community = await Communities_1.default.findByPk(communityId);
        if (!community)
            return res.status(404).json({ error: "Community not found" });
        // If private, user must be a member
        if (community.isPublic === "Private") {
            const membership = await CommunityMember_1.default.findOne({
                where: { communityId, userId },
            });
            if (!membership) {
                return res
                    .status(403)
                    .json({ error: "User must be a member of the community to post" });
            }
        }
        // If public, anyone can post no membership check needed
        const post = await CommunityPosts_1.default.create({
            communityId,
            userId,
            content,
            imageUrl,
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create community post" });
    }
};
exports.createCommunityPost = createCommunityPost;
// Get posts for a community
const getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;
        const posts = await CommunityPosts_1.default.findAll({
            where: { communityId },
            include: [
                {
                    model: User_1.default,
                    attributes: ["id", "username", "email"],
                },
            ],
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch community posts" });
    }
};
exports.getCommunityPosts = getCommunityPosts;
// Delete a community post
const deleteCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await CommunityPosts_1.default.findByPk(id);
        if (!post)
            return res.status(404).json({ error: "Community post not found" });
        await post.destroy();
        res.json({ message: "Community post deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete community post" });
    }
};
exports.deleteCommunityPost = deleteCommunityPost;
// Update a community post
const updateCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, imageUrl } = req.body;
        const post = await CommunityPosts_1.default.findByPk(id);
        if (!post)
            return res.status(404).json({ error: "Community post not found" });
        await post.update({ content, imageUrl });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update community post" });
    }
};
exports.updateCommunityPost = updateCommunityPost;
//get a single post by id
const getCommunityPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await CommunityPosts_1.default.findByPk(id, {
            include: [
                {
                    model: User_1.default,
                    attributes: ["id", "username", "email"],
                },
            ],
        });
        if (!post)
            return res.status(404).json({ error: "Community post not found" });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch community post" });
    }
};
exports.getCommunityPostById = getCommunityPostById;
