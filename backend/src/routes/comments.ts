import express from "express";
import {
  createComment,
  updateComment,
  deleteComment,
  getAllComments,
} from "../controllers/comments";

const router = express.Router();

router.get("/", getAllComments); // Get all comments
router.post("/", createComment); // Create comment
router.put("/:id", updateComment); // Update comment
router.delete("/:id", deleteComment); // Delete comment

export default router;
