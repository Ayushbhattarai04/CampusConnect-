"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLike = exports.createLike = exports.getAllLikes = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
// Get all likes
const getAllLikes = async (req, res) => {
    try {
        const [likes] = await database_1.default.query("SELECT * FROM likes ORDER BY createdAt DESC");
        res.status(200).json(likes);
    }
    catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ error: "Failed to fetch likes" });
    }
};
exports.getAllLikes = getAllLikes;
// Create a like (adds a row to the database)
const createLike = async (req, res) => {
    try {
        const { userId, postId } = req.body;
        // Check if user already liked this post
        const existingLike = await database_1.default.query("SELECT * FROM likes WHERE userId = ? AND postId = ?", { replacements: [userId, postId], type: sequelize_1.QueryTypes.SELECT });
        if (existingLike && existingLike.length > 0) {
            return res.status(400).json({ error: "Post already liked" });
        }
        // Create new like
        await database_1.default.query("INSERT INTO likes (userId, postId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())", { replacements: [userId, postId] });
        // Return the created like by userId and postId
        const newLike = await database_1.default.query("SELECT * FROM likes WHERE userId = ? AND postId = ? ORDER BY createdAt DESC LIMIT 1", { replacements: [userId, postId], type: sequelize_1.QueryTypes.SELECT });
        res.status(201).json(newLike && newLike.length > 0 ? newLike[0] : null);
    }
    catch (error) {
        console.error("Error creating like:", error);
        res.status(500).json({ error: "Failed to create like" });
    }
};
exports.createLike = createLike;
// Delete a like (removes row from the database)
const deleteLike = async (req, res) => {
    try {
        const { postId, userId } = req.params;
        // Find the like first
        const like = await database_1.default.query("SELECT * FROM likes WHERE userId = ? AND postId = ?", { replacements: [userId, postId], type: sequelize_1.QueryTypes.SELECT });
        if (like.length === 0) {
            return res.status(404).json({ error: "Like not found" });
        }
        // Delete the like
        await database_1.default.query("DELETE FROM likes WHERE userId = ? AND postId = ?", {
            replacements: [userId, postId],
        });
        res
            .status(200)
            .json({ message: "Like deleted successfully", deleted: true });
    }
    catch (error) {
        console.error("Error deleting like:", error);
        res.status(500).json({ error: "Failed to delete like" });
    }
};
exports.deleteLike = deleteLike;
