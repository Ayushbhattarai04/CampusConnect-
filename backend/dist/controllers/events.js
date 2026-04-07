"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventById = exports.deleteEventById = exports.getEventById = exports.getAllEvents = exports.createEvent = void 0;
const Events_1 = __importDefault(require("../models/Events"));
const User_1 = __importDefault(require("../models/User"));
//Create a new event
const createEvent = async (req, res) => {
    try {
        const { userId, organizer, title, description, fee, schedules, location } = req.body;
        // Validate required fields
        if (!userId || !title || !schedules) {
            res
                .status(400)
                .json({ message: "userId, title, and schedules are required." });
            return;
        }
        const scheduleDate = new Date(schedules);
        if (Number.isNaN(scheduleDate.getTime())) {
            res.status(400).json({ message: "Invalid schedules datetime." });
            return;
        }
        const publishedDate = new Date();
        // Check if user exists
        const userExists = await User_1.default.findByPk(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        //create event
        const event = await Events_1.default.create({
            userId,
            organizer: organizer || null,
            title,
            description: description || null,
            schedules: scheduleDate,
            location: location || null,
            fee: fee || null,
            createdAt: publishedDate,
        });
        res
            .status(201)
            .json({ message: "Event created successfully.", data: event });
    }
    catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.createEvent = createEvent;
//Gett all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Events_1.default.findAll({
            include: [{ model: User_1.default, attributes: ["id", "username"] }],
        });
        res
            .status(200)
            .json({ message: "Events retrieved successfully.", data: events });
    }
    catch (error) {
        console.error("Get all events error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getAllEvents = getAllEvents;
//Get event by id
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Events_1.default.findByPk(id, {
            include: [{ model: User_1.default, attributes: ["id", "username"] }],
        });
        if (!event) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        res
            .status(200)
            .json({ message: "Event retrieved successfully.", data: event });
    }
    catch (error) {
        console.error("Get event by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getEventById = getEventById;
//Delete events by id
const deleteEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Events_1.default.findByPk(id);
        if (!event) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        await event.destroy();
        res.status(200).json({ message: "Event deleted successfully." });
    }
    catch (error) {
        console.error("Delete event by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.deleteEventById = deleteEventById;
//Update event by id
const updateEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizer, title, description, fee, schedules, location } = req.body;
        const event = await Events_1.default.findByPk(id);
        if (!event) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        if (schedules) {
            const scheduleDate = new Date(schedules);
            if (Number.isNaN(scheduleDate.getTime())) {
                res.status(400).json({ message: "Invalid schedules datetime." });
                return;
            }
            event.schedules = scheduleDate;
        }
        if (organizer !== undefined)
            event.organizer = organizer;
        if (title !== undefined)
            event.title = title;
        if (description !== undefined)
            event.description = description;
        if (fee !== undefined)
            event.fee = fee;
        if (location !== undefined)
            event.location = location;
        await event.save();
        res
            .status(200)
            .json({ message: "Event updated successfully.", data: event });
    }
    catch (error) {
        console.error("Update event by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.updateEventById = updateEventById;
