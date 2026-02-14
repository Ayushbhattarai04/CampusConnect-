import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
} from "../controllers/posts";

const router = express.Router();

router.get("/", getAllPosts); // Get all posts
router.post("/", createPost); // Create post
router.put("/:id", updatePost); // Update post
router.delete("/:id", deletePost); // Delete post

export default router;
