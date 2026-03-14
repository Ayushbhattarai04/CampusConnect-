import express from "express";
import { getProfileByUserId, createOrUpdateProfile } from "../controllers/profile";

const router = express.Router();

router.get("/:userId", getProfileByUserId);
router.post("/:userId", createOrUpdateProfile);

export default router;
