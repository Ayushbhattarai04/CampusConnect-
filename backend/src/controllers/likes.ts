import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";

// Get all likes
export const getAllLikes = async (req: Request, res: Response) => {
  try {
    const [likes] = await sequelize.query(
      "SELECT * FROM likes ORDER BY createdAt DESC",
    );
    res.status(200).json(likes);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};

// Create a like (adds a row to the database)
export const createLike = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;

    // Check if user already liked this post
    const existingLike: any = await sequelize.query(
      "SELECT * FROM likes WHERE userId = ? AND postId = ?",
      { replacements: [userId, postId], type: QueryTypes.SELECT },
    );

    if (existingLike && existingLike.length > 0) {
      return res.status(400).json({ error: "Post already liked" });
    }

    // Create new like
    await sequelize.query(
      "INSERT INTO likes (userId, postId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      { replacements: [userId, postId] },
    );

    // Return the created like by userId and postId
    const newLike: any = await sequelize.query(
      "SELECT * FROM likes WHERE userId = ? AND postId = ? ORDER BY createdAt DESC LIMIT 1",
      { replacements: [userId, postId], type: QueryTypes.SELECT },
    );

    res.status(201).json(newLike && newLike.length > 0 ? newLike[0] : null);
  } catch (error) {
    console.error("Error creating like:", error);
    res.status(500).json({ error: "Failed to create like" });
  }
};

// Delete a like (removes row from the database)
export const deleteLike = async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.params;

    // Find the like first
    const like: any = await sequelize.query(
      "SELECT * FROM likes WHERE userId = ? AND postId = ?",
      { replacements: [userId, postId], type: QueryTypes.SELECT },
    );

    if (like.length === 0) {
      return res.status(404).json({ error: "Like not found" });
    }

    // Delete the like
    await sequelize.query("DELETE FROM likes WHERE userId = ? AND postId = ?", {
      replacements: [userId, postId],
    });

    res
      .status(200)
      .json({ message: "Like deleted successfully", deleted: true });
  } catch (error) {
    console.error("Error deleting like:", error);
    res.status(500).json({ error: "Failed to delete like" });
  }
};
