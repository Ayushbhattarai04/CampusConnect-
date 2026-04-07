import { Router } from "express";
import {
  createCommunityPost,
  getAllCommunityPosts,
  getCommunityPosts,
  deleteCommunityPost,
  updateCommunityPost,
  getCommunityPostById,
} from "../controllers/communityPosts";

const router = Router();

router.post("/", createCommunityPost); // Create a community post
router.get("/", getAllCommunityPosts);
router.get("/post/:id", getCommunityPostById); // Get a single post by id
router.get("/:communityId", getCommunityPosts);
router.delete("/:id", deleteCommunityPost);
router.put("/:id", updateCommunityPost);

export default router;
