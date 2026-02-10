import { Router } from "express";
import { registerUser, loginUser, getProfile } from "../controller/userAuth";
import { authenticate } from "../middleware/userAuth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticate, getProfile);

export default router;
