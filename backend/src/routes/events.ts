import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEventById,
  updateEventById,
} from "../controllers/events";

const router = Router();

router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.delete("/:id", deleteEventById);
router.put("/:id", updateEventById);

export default router;
