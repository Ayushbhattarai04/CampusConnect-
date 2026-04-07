"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const posts_1 = require("../controllers/posts");
const router = express_1.default.Router();
router.get("/", posts_1.getAllPosts); // Get all posts
router.post("/", posts_1.createPost); // Create post
router.put("/:id", posts_1.updatePost); // Update post
router.delete("/:id", posts_1.deletePost); // Delete post
router.get("/:id", posts_1.getPostById); // Get post by ID with username
exports.default = router;
