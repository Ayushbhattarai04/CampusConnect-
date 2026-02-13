import express from "express";
import { createComment, updateComment, deleteComment } from "../controllers/comments";

const router = express.Router();

router.post("/", createComment);         // Create comment
router.put("/:id", updateComment);        // Update comment
router.delete("/:id", deleteComment);     // Delete comment

export default router;
