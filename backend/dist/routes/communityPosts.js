"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communityPosts_1 = require("../controllers/communityPosts");
const router = (0, express_1.Router)();
router.post("/", communityPosts_1.createCommunityPost); // Create a community post
router.get("/:communityId", communityPosts_1.getCommunityPosts);
router.get("/post/:id", communityPosts_1.getCommunityPostById); // Get a single post by id
router.delete("/:id", communityPosts_1.deleteCommunityPost);
router.put("/:id", communityPosts_1.updateCommunityPost);
exports.default = router;
