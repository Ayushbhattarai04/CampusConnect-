"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comments_1 = require("../controllers/comments");
const router = express_1.default.Router();
router.get("/", comments_1.getAllComments); // Get all comments
router.post("/", comments_1.createComment); // Create comment
router.put("/:id", comments_1.updateComment); // Update comment
router.delete("/:id", comments_1.deleteComment); // Delete comment
exports.default = router;
