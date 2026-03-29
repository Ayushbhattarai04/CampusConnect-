import { Router } from "express";
import uploadCV from "../middleware/uploadCV";
import {
  applyForJob,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  downloadCV,
  deleteApplication,
} from "../controllers/jobapplied";

const router = Router();

router.post("/apply", uploadCV.single("cv"), applyForJob);
router.get("/applications", getAllApplications);
router.get("/applications/:appliedId", getApplicationById);
router.patch("/applications/:appliedId/status", updateApplicationStatus);
router.get("/applications/:appliedId/cv", downloadCV);
router.delete("/applications/:appliedId", deleteApplication);

export default router;
