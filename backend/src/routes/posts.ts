import express from "express";
import { createPost, updatePost, deletePost } from "../controllers/posts";

const router = express.Router();

router.post("/", createPost);         // Create post
router.put("/:id", updatePost);       // Update post
router.delete("/:id", deletePost);    // Delete post

export default router;