import { Request, Response } from "express";
import Comment from "../models/Comments";

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { userId, postId, content } = req.body;
    const comment = await Comment.create({ userId, postId, content });
    res.status(201).json(comment);
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
