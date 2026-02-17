import express from "express";
import { createLike, deleteLike, getAllLikes } from "../controllers/likes";

const router = express.Router();

router.get("/", getAllLikes); // Get all likes
router.post("/", createLike); // Like a post
router.delete("/:postId/:userId", deleteLike); // Unlike a post

export default router;
