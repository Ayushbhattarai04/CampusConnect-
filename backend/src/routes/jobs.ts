import express from "express";
import {
  createJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getJobById,
} from "../controllers/jobs";

const router = express.Router();

router.get("/", getAllJobs); 
router.get("/:id", getJobById); 
router.post("/", createJob); 
router.put("/:id", updateJob); 
router.delete("/:id", deleteJob); 

export default router;
