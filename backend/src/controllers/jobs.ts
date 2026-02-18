import { Request, Response } from "express";
import Job from "../models/Jobs";
import User from "../models/User";

// Get all jobs
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.findAll({
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Get 1 job
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id, {
      include: [{ model: User, attributes: ["username"] }],
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

// Create job
export const createJob = async (req: Request, res: Response) => {
  try {
    const { userId, title, company, location, salary, description } = req.body;
    const job = await Job.create({
      userId,
      title,
      company,
      location,
      salary,
      description,
    });

    const jobWithUser = await Job.findByPk(job.jobId, {
      include: [{ model: User, attributes: ["username"] }],
    });

    res.status(201).json(jobWithUser ?? job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

// Update job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, company, location, salary, description } = req.body;
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.title = title ?? job.title;
    job.company = company ?? job.company;
    job.location = location ?? job.location;
    job.salary = salary ?? job.salary;
    job.description = description ?? job.description;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

// Delete job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    await job.destroy();
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};
