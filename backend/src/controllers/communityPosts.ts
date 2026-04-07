import { Request, Response } from "express";
import CommunityPost from "../models/CommunityPosts";
import Community from "../models/Communities";
import User from "../models/User";
import CommunityMember from "../models/CommunityMember";

// Create a community post
export const createCommunityPost = async (req: Request, res: Response) => {
  try {
    const { communityId, userId, content, imageUrl } = req.body;

    const community = await Community.findByPk(communityId);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    // If private, user must be a member
    if (community.isPublic === "Private") {
      const membership = await CommunityMember.findOne({
        where: { communityId, userId },
      });
      if (!membership) {
        return res
          .status(403)
          .json({ error: "User must be a member of the community to post" });
      }
    }

    // If public, anyone can post no membership check needed
    const post = await CommunityPost.create({
      communityId,
      userId,
      content,
      imageUrl,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create community post" });
  }
};

// Get all community posts (newest first)
export const getAllCommunityPosts = async (req: Request, res: Response) => {
  try {
    const posts = await CommunityPost.findAll({
      include: [
        {
          model: Community,
          attributes: ["communityId", "name"],
        },
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
};

// Get posts for a community
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const posts = await CommunityPost.findAll({
      where: { communityId },
      include: [
        {
          model: Community,
          attributes: ["communityId", "name"],
        },
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
};

// Delete a community post
export const deleteCommunityPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findByPk(id);
    if (!post)
      return res.status(404).json({ error: "Community post not found" });
    await post.destroy();
    res.json({ message: "Community post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete community post" });
  }
};

// Update a community post
export const updateCommunityPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, imageUrl } = req.body;
    const post = await CommunityPost.findByPk(id);
    if (!post)
      return res.status(404).json({ error: "Community post not found" });
    await post.update({ content, imageUrl });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update community post" });
  }
};

//get a single post by id
export const getCommunityPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findByPk(id, {
      include: [
        {
          model: Community,
          attributes: ["communityId", "name"],
        },
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });
    if (!post)
      return res.status(404).json({ error: "Community post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community post" });
  }
};
