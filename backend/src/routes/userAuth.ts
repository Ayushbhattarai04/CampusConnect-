import express from "express";
import { register, login } from "../controllers/userAuth";
import { authenticateToken } from "../middleware/userAuth";
import User from "../models/User";
import jwt from "jsonwebtoken";
const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Profile route removed

router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET!);

    const userId =
      typeof decoded === "object" && "userId" in decoded
        ? (decoded as any).userId
        : null;
    if (!userId) return res.status(400).send("Invalid link");
    const user = await User.findByPk(userId);
    if (!user) return res.status(400).send("Invalid link");
    user.verified = true;
    await user.save();
    res.send("Email verified!");
  } catch (err) {
    res.status(400).send("Invalid or expired link");
  }
});

export default router;
