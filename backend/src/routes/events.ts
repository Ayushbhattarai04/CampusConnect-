import { Router } from "express";
import { createEvent, getAllEvents, getEventById } from "../controllers/events";

const router = Router();

router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);

export default router;
