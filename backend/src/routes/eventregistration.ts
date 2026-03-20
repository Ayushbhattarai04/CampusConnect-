import { Router } from "express";
import {
  registerForEvent,
  getEventRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from "../controllers/eventregistration";

const router = Router();

router.post("/", registerForEvent);
router.get("/", getEventRegistrations);
router.get("/:id", getRegistrationById);
router.put("/:id", updateRegistration);
router.delete("/:id", deleteRegistration);

export default router;
