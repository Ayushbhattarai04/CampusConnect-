import { Request, Response } from "express";
import Like from "../models/Likes";

// Create a like
export const createLike = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;
    // Prevent duplicate likes
    const existing = await Like.findOne({ where: { userId, postId } });
    if (existing) return res.status(400).json({ error: "Already liked" });
    const like = await Like.create({ userId, postId });
    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" });
  }
};

// Delete a like
export const deleteLike = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;
    const like = await Like.findOne({ where: { userId, postId } });
    if (!like) return res.status(404).json({ error: "Like not found" });
    await like.destroy();
    res.json({ message: "Like removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove like" });
  }
};
