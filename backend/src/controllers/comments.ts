import User from "../models/User";
// Get all comments with username
export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
import { Request, Response } from "express";
import Comment from "../models/Comments";

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { userId, postId, content } = req.body;
    const comment = await Comment.create({ userId, postId, content });
    // Fetch the comment again with the associated User (for username)
    const commentWithUser = await Comment.findByPk(comment.commentId, {
      include: [{ model: User, attributes: ["username"] }],
    });
    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.content = content ?? comment.content;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    await comment.destroy();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
