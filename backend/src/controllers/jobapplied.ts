import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import JobApplied from "../models/JobApplied";

// create a new job application with CV uploaded
export const applyForJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { jobId, userId, applierdescription, appliersemail } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "CV file is required" });
      return;
    }

    if (!jobId || !userId) {
      res.status(400).json({ message: "jobId and userId are required" });
      return;
    }

    // Check if user already applied for this job
    const existing = await JobApplied.findOne({ where: { jobId, userId } });
    if (existing) {
      // Remove uploaded file since we won't use it
      fs.unlinkSync(req.file.path);
      res
        .status(409)
        .json({ message: "You have already applied for this job" });
      return;
    }

    const application = await JobApplied.create({
      jobId,
      userId,
      applierdescription,
      appliersemail,
      cv: req.file.path,
      cvOriginalName: req.file.originalname,
      cvType: req.file.mimetype,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// get all applications
export const getAllApplications = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const applications = await JobApplied.findAll();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// get all applications for a specific job
export const getApplicationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const application = await JobApplied.findByPk(req.params.appliedId);
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// get CV file by application id
export const downloadCV = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const application = await JobApplied.findByPk(req.params.appliedId);

    if (!application || !application.cv) {
      res.status(404).json({ message: "CV not found" });
      return;
    }

    const filePath = path.resolve(application.cv);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "CV file no longer exists on server" });
      return;
    }

    res.download(filePath, application.cvOriginalName || "cv.pdf");
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// delete application aalong with CV file
export const deleteApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const application = await JobApplied.findByPk(req.params.appliedId);

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Delete the CV file from disk
    if (application.cv && fs.existsSync(application.cv)) {
      fs.unlinkSync(application.cv);
    }

    await application.destroy();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
