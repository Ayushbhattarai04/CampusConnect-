import express from "express";
import { createLike, deleteLike } from "../controllers/likes";

const router = express.Router();

router.post("/", createLike); // Like a post
router.delete("/", deleteLike); // Unlike a post

export default router;
