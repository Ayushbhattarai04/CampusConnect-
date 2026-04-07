"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getJobById = exports.getAllJobs = void 0;
const Jobs_1 = __importDefault(require("../models/Jobs"));
const User_1 = __importDefault(require("../models/User"));
// Get all jobs
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Jobs_1.default.findAll({
            include: [{ model: User_1.default, attributes: ["username"] }],
            order: [["createdAt", "DESC"]],
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
};
exports.getAllJobs = getAllJobs;
// Get 1 job
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Jobs_1.default.findByPk(id, {
            include: [{ model: User_1.default, attributes: ["username"] }],
        });
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch job" });
    }
};
exports.getJobById = getJobById;
// Create job
const createJob = async (req, res) => {
    try {
        const { userId, title, company, location, salary, description } = req.body;
        const job = await Jobs_1.default.create({
            userId,
            title,
            company,
            location,
            salary,
            description,
        });
        const jobWithUser = await Jobs_1.default.findByPk(job.jobId, {
            include: [{ model: User_1.default, attributes: ["username"] }],
        });
        res.status(201).json(jobWithUser ?? job);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create job" });
    }
};
exports.createJob = createJob;
// Update job
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company, location, salary, description } = req.body;
        const job = await Jobs_1.default.findByPk(id);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        job.title = title ?? job.title;
        job.company = company ?? job.company;
        job.location = location ?? job.location;
        job.salary = salary ?? job.salary;
        job.description = description ?? job.description;
        await job.save();
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update job" });
    }
};
exports.updateJob = updateJob;
// Delete job
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Jobs_1.default.findByPk(id);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        await job.destroy();
        res.json({ message: "Job deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete job" });
    }
};
exports.deleteJob = deleteJob;
