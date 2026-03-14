import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostById,
} from "../controllers/posts";

const router = express.Router();

router.get("/", getAllPosts); // Get all posts
router.post("/", createPost); // Create post
router.put("/:id", updatePost); // Update post
router.delete("/:id", deletePost); // Delete post
router.get("/:id", getPostById); // Get post by ID with username

export default router;
