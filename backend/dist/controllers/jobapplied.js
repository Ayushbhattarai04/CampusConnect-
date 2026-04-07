"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = exports.downloadCV = exports.updateApplicationStatus = exports.getApplicationById = exports.getAllApplications = exports.applyForJob = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const JobApplied_1 = __importDefault(require("../models/JobApplied"));
const User_1 = __importDefault(require("../models/User"));
// create a new job application with CV uploaded
const applyForJob = async (req, res) => {
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
        const existing = await JobApplied_1.default.findOne({ where: { jobId, userId } });
        if (existing) {
            // Remove uploaded file since we won't use it
            fs_1.default.unlinkSync(req.file.path);
            res
                .status(409)
                .json({ message: "You have already applied for this job" });
            return;
        }
        const application = await JobApplied_1.default.create({
            jobId,
            userId,
            applierdescription,
            appliersemail,
            cv: req.file.path,
            cvOriginalName: req.file.originalname,
            cvType: req.file.mimetype,
            status: "pending",
        });
        res.status(201).json({
            message: "Application submitted successfully",
            application,
        });
    }
    catch (error) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.applyForJob = applyForJob;
// get all applications
const getAllApplications = async (req, res) => {
    try {
        const { jobId } = req.query;
        const whereClause = jobId ? { jobId: Number(jobId) } : undefined;
        const applications = await JobApplied_1.default.findAll({
            where: whereClause,
            include: [{ model: User_1.default, attributes: ["id", "username", "email"] }],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(applications);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.getAllApplications = getAllApplications;
// get all applications for a specific job
const getApplicationById = async (req, res) => {
    try {
        const application = await JobApplied_1.default.findByPk(req.params.appliedId);
        if (!application) {
            res.status(404).json({ message: "Application not found" });
            return;
        }
        res.status(200).json(application);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.getApplicationById = getApplicationById;
const updateApplicationStatus = async (req, res) => {
    try {
        const { appliedId } = req.params;
        const { status } = req.body;
        const validStatuses = ["accepted", "pending", "rejected"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }
        const application = await JobApplied_1.default.findByPk(appliedId);
        if (!application) {
            res.status(404).json({ message: "Application not found" });
            return;
        }
        application.status = status;
        await application.save();
        res.status(200).json({
            message: "Application status updated",
            application,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// get CV file by application id
const downloadCV = async (req, res) => {
    try {
        const application = await JobApplied_1.default.findByPk(req.params.appliedId);
        if (!application || !application.cv) {
            res.status(404).json({ message: "CV not found" });
            return;
        }
        const filePath = path_1.default.resolve(application.cv);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: "CV file no longer exists on server" });
            return;
        }
        res.download(filePath, application.cvOriginalName || "cv.pdf");
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.downloadCV = downloadCV;
// delete application aalong with CV file
const deleteApplication = async (req, res) => {
    try {
        const application = await JobApplied_1.default.findByPk(req.params.appliedId);
        if (!application) {
            res.status(404).json({ message: "Application not found" });
            return;
        }
        // Delete the CV file from disk
        if (application.cv && fs_1.default.existsSync(application.cv)) {
            fs_1.default.unlinkSync(application.cv);
        }
        await application.destroy();
        res.status(200).json({ message: "Application deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.deleteApplication = deleteApplication;
