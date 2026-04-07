"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRegistration = exports.updateRegistration = exports.getRegistrationById = exports.getOwnerRegistrationCount = exports.getEventRegistrations = exports.registerForEvent = void 0;
const EventRegistration_1 = __importDefault(require("../models/EventRegistration"));
const User_1 = __importDefault(require("../models/User"));
const Events_1 = __importDefault(require("../models/Events"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sequelize_1 = require("sequelize");
// Create / Register for an event
const registerForEvent = async (req, res) => {
    try {
        const { eventId, userId, registeredname, registeredemail, numberoftickets, } = req.body;
        // Validate required fields
        if (!eventId ||
            !userId ||
            !registeredname ||
            !registeredemail ||
            !numberoftickets) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        // Check if user exists
        const userExists = await User_1.default.findByPk(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Check if event exists
        const eventExists = await Events_1.default.findByPk(eventId);
        if (!eventExists) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        // Create event registration
        const registration = await EventRegistration_1.default.create({
            eventId,
            userId,
            registeredname,
            registeredemail,
            numberoftickets,
        });
        res.status(201).json({
            message: "Registered for event successfully.",
            data: registration,
        });
        // Email is optional: never fail the API request if email sending fails.
        void (async () => {
            try {
                const emailUser = process.env.EMAIL_USER;
                const emailPass = process.env.EMAIL_PASS;
                if (!emailUser || !emailPass)
                    return;
                const transporter = nodemailer_1.default.createTransport({
                    host: "smtp.gmail.com",
                    port: Number(process.env.EMAIL_PORT) || 587,
                    secure: false,
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                });
                await transporter.sendMail({
                    from: `"CampusConnect" <${emailUser}>`,
                    to: registeredemail,
                    subject: "Your Event Ticket",
                    html: `
            <div>
              <p>Hi ${registeredname}, your ticket for event #${eventId} is confirmed.</p>
            </div>
          `,
                });
            }
            catch (mailError) {
                console.error("Send ticket email error:", mailError);
            }
        })();
    }
    catch (error) {
        console.error("Register for event error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.registerForEvent = registerForEvent;
// Get all registrations for an event
const getEventRegistrations = async (req, res) => {
    try {
        const eventId = Number(req.query.eventId);
        if (!eventId) {
            res.status(400).json({ message: "Valid eventId query is required." });
            return;
        }
        const registrations = await EventRegistration_1.default.findAll({
            where: { eventId },
        });
        res.status(200).json({
            message: "Event registrations retrieved successfully.",
            data: registrations,
        });
    }
    catch (error) {
        console.error("Get event registrations error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getEventRegistrations = getEventRegistrations;
// Get total registrations for all events owned by a user
const getOwnerRegistrationCount = async (req, res) => {
    try {
        const ownerId = Number(req.params.ownerId);
        if (!ownerId) {
            res.status(400).json({ message: "Valid ownerId is required." });
            return;
        }
        const ownerEvents = await Events_1.default.findAll({
            where: { userId: ownerId },
            attributes: ["eventId"],
        });
        const eventIds = ownerEvents
            .map((event) => event.eventId)
            .filter((eventId) => typeof eventId === "number");
        if (eventIds.length === 0) {
            res.status(200).json({
                message: "Owner registration count retrieved successfully.",
                data: {
                    ownerId,
                    eventCount: 0,
                    totalRegistrations: 0,
                },
            });
            return;
        }
        const totalRegistrations = await EventRegistration_1.default.count({
            where: {
                eventId: {
                    [sequelize_1.Op.in]: eventIds,
                },
            },
        });
        res.status(200).json({
            message: "Owner registration count retrieved successfully.",
            data: {
                ownerId,
                eventCount: eventIds.length,
                totalRegistrations,
            },
        });
    }
    catch (error) {
        console.error("Get owner registration count error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getOwnerRegistrationCount = getOwnerRegistrationCount;
// Get registration by id
const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await EventRegistration_1.default.findByPk(id);
        if (!registration) {
            res.status(404).json({ message: "Registration not found." });
            return;
        }
        res.status(200).json({
            message: "Registration retrieved successfully.",
            data: registration,
        });
    }
    catch (error) {
        console.error("Get registration by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.getRegistrationById = getRegistrationById;
// Update registration
const updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { registeredName } = req.body;
        const registration = await EventRegistration_1.default.findByPk(id);
        if (!registration) {
            res.status(404).json({ message: "Registration not found." });
            return;
        }
        registration.registeredname = registeredName || registration.registeredname;
        await registration.save();
        res.status(200).json({
            message: "Registration updated successfully.",
            data: registration,
        });
    }
    catch (error) {
        console.error("Update registration error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.updateRegistration = updateRegistration;
// Delete registration
const deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await EventRegistration_1.default.findByPk(id);
        if (!registration) {
            res.status(404).json({ message: "Registration not found." });
            return;
        }
        await registration.destroy();
        res.status(200).json({ message: "Registration deleted successfully." });
    }
    catch (error) {
        console.error("Delete registration error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};
exports.deleteRegistration = deleteRegistration;
