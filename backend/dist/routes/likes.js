"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const likes_1 = require("../controllers/likes");
const router = express_1.default.Router();
router.get("/", likes_1.getAllLikes); // Get all likes
router.post("/", likes_1.createLike); // Like a post
router.delete("/:postId/:userId", likes_1.deleteLike); // Unlike a post
exports.default = router;
