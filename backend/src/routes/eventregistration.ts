import { Router } from "express";
import {
  registerForEvent,
  getEventRegistrations,
  getOwnerRegistrationCount,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from "../controllers/eventregistration";

const router = Router();

router.post("/", registerForEvent);
router.get("/", getEventRegistrations);
router.get("/owner/:ownerId/count", getOwnerRegistrationCount);
router.get("/:id", getRegistrationById);
router.put("/:id", updateRegistration);
router.delete("/:id", deleteRegistration);

export default router;
