"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTution = exports.updateTution = exports.getTutionsByUser = exports.getTutionById = exports.getAllTutions = exports.createTution = void 0;
const Tution_1 = __importDefault(require("../models/Tution"));
const User_1 = __importDefault(require("../models/User"));
// Create a new tution
const createTution = async (req, res) => {
    try {
        const { userId, tutor, subject, location, fee, description, schedules } = req.body;
        // Validate required fields
        if (!userId || !subject || !tutor) {
            res
                .status(400)
                .json({ message: "userId, tutor, and subject are required." });
            return;
        }
        // Check if user exists
        const userExists = await User_1.default.findByPk(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Create tution
        const tution = await Tution_1.default.create({
            userId,
            tutor,
            subject,
            location: location || null,
            fee: fee || null,
            description: description || null,
            schedules: schedules || new Date(),
        });
        res
            .status(201)
            .json({ message: "Tution created successfully.", data: tution });
    }
    catch (error) {
        console.error("Create tution error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.createTution = createTution;
// Get every tution
const getAllTutions = async (req, res) => {
    try {
        const tutions = await Tution_1.default.findAll({
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ data: tutions });
    }
    catch (error) {
        console.error("Get all tutions error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getAllTutions = getAllTutions;
// Get tution by tution id
const getTutionById = async (req, res) => {
    try {
        const { id } = req.params;
        const tution = await Tution_1.default.findByPk(id);
        if (!tution) {
            res.status(404).json({ message: "Tution not found." });
            return;
        }
        res.status(200).json({ data: tution });
    }
    catch (error) {
        console.error("Get tution by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getTutionById = getTutionById;
// Geting tution by user id
const getTutionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const tutions = await Tution_1.default.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ data: tutions });
    }
    catch (error) {
        console.error("Get tutions by user error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getTutionsByUser = getTutionsByUser;
// UPDATE - PUT /tutions/:id
const updateTution = async (req, res) => {
    try {
        const { id } = req.params;
        const { tutor, subject, location, fee, description, schedules } = req.body;
        const tution = await Tution_1.default.findByPk(id);
        if (!tution) {
            res.status(404).json({ message: "Tution not found." });
            return;
        }
        await tution.update({
            tutor,
            subject,
            location,
            fee,
            description,
            schedules,
        });
        res
            .status(200)
            .json({ message: "Tution updated successfully.", data: tution });
    }
    catch (error) {
        console.error("Update tution error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.updateTution = updateTution;
// DELETE - DELETE /tutions/:id
const deleteTution = async (req, res) => {
    try {
        const { id } = req.params;
        const tution = await Tution_1.default.findByPk(id);
        if (!tution) {
            res.status(404).json({ message: "Tution not found." });
            return;
        }
        await tution.destroy();
        res.status(200).json({ message: "Tution deleted successfully." });
    }
    catch (error) {
        console.error("Delete tution error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.deleteTution = deleteTution;
