"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.getAllComments = void 0;
const User_1 = __importDefault(require("../models/User"));
// Get all comments with username
const getAllComments = async (req, res) => {
    try {
        const comments = await Comments_1.default.findAll({
            include: [{ model: User_1.default, attributes: ["username"] }],
            order: [["createdAt", "DESC"]],
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};
exports.getAllComments = getAllComments;
const Comments_1 = __importDefault(require("../models/Comments"));
// Create a comment
const createComment = async (req, res) => {
    try {
        const { userId, postId, content } = req.body;
        const comment = await Comments_1.default.create({ userId, postId, content });
        // Fetch the comment again with the associated User (for username)
        const commentWithUser = await Comments_1.default.findByPk(comment.commentId, {
            include: [{ model: User_1.default, attributes: ["username"] }],
        });
        res.status(201).json(commentWithUser);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create comment" });
    }
};
exports.createComment = createComment;
// Update a comment
const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { id } = req.params;
        const comment = await Comments_1.default.findByPk(id);
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        comment.content = content ?? comment.content;
        await comment.save();
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update comment" });
    }
};
exports.updateComment = updateComment;
// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comments_1.default.findByPk(id);
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        await comment.destroy();
        res.json({ message: "Comment deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete comment" });
    }
};
exports.deleteComment = deleteComment;
