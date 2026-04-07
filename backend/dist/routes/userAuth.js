"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../controllers/userAuth");
const userAuth_2 = require("../middleware/userAuth");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// Public routes
router.post("/register", userAuth_1.register);
router.post("/login", userAuth_1.login);
router.get("/users", userAuth_2.authenticateToken, userAuth_2.authorizeAdmin, userAuth_1.getUsers);
router.get("/verify/:token", async (req, res) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(req.params.token, process.env.JWT_SECRET);
        const userId = typeof decoded === "object" && "userId" in decoded
            ? decoded.userId
            : null;
        if (!userId)
            return res.status(400).send("Invalid link");
        const user = await User_1.default.findByPk(userId);
        if (!user)
            return res.status(400).send("Invalid link");
        user.verified = true;
        await user.save();
        res.send("Email verified!");
    }
    catch (err) {
        res.status(400).send("Invalid or expired link");
    }
});
exports.default = router;
