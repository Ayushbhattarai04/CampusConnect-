import { Router } from "express";
import {
  createTution,
  getAllTutions,
  getTutionById,
  getTutionsByUser,
  updateTution,
  deleteTution,
} from "../controllers/tution";

const router = Router();

router.post("/", createTution);
router.get("/", getAllTutions);
router.get("/user/:userId", getTutionsByUser);
router.get("/:id", getTutionById);
router.put("/:id", updateTution);
router.delete("/:id", deleteTution);

export default router;
