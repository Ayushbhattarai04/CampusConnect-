import { Request, Response } from "express";
import Post from "../models/Posts";
import User from "../models/User";

// Create a post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { userId, content, imageUrl } = req.body;
    const post = await Post.create({ userId, content, imageUrl });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { content, imageUrl } = req.body;
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.content = content ?? post.content;
    post.imageUrl = imageUrl ?? post.imageUrl;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    await post.destroy();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// Get all posts with username
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ["username"] }]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};