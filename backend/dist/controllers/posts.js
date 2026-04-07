"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostById = exports.getAllPosts = exports.deletePost = exports.updatePost = exports.createPost = void 0;
const Posts_1 = __importDefault(require("../models/Posts"));
const User_1 = __importDefault(require("../models/User"));
// Create a post
const createPost = async (req, res) => {
    try {
        const { userId, content, imageUrl } = req.body;
        console.log("Create post request:", req.body);
        const post = await Posts_1.default.create({ userId, content, imageUrl });
        // Fetch the post again with the associated User (for username)
        const postWithUser = await Posts_1.default.findByPk(post.postId, {
            include: [{ model: User_1.default, attributes: ["username"] }],
        });
        res.status(201).json(postWithUser);
    }
    catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
};
exports.createPost = createPost;
// Update a post
const updatePost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        const { id } = req.params;
        const post = await Posts_1.default.findByPk(id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        post.content = content ?? post.content;
        post.imageUrl = imageUrl ?? post.imageUrl;
        await post.save();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update post" });
    }
};
exports.updatePost = updatePost;
// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Posts_1.default.findByPk(id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        await post.destroy();
        res.json({ message: "Post deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete post" });
    }
};
exports.deletePost = deletePost;
// Get all posts with username
const getAllPosts = async (req, res) => {
    try {
        const posts = await Posts_1.default.findAll({
            include: [{ model: User_1.default, attributes: ["username"] }],
            order: [["createdAt", "DESC"]],
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};
exports.getAllPosts = getAllPosts;
// Get a single post by ID with username
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Posts_1.default.findOne({
            where: { postId: id },
            include: [{ model: User_1.default, attributes: ["id", "username", "email"] }],
        });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.json(post);
    }
    catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getPostById = getPostById;
