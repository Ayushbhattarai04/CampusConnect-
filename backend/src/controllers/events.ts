import { Request, Response } from "express";
import Tution from "../models/Events";
import User from "../models/User";

//Create a new event
export const createEvent = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { userId, title, description, date,schedules, location } = req.body;
        
        // Validate required fields
        if (!userId || !title || !date) {
            res.status(400).json({ message: "userId, title, and date are required." });
            return;
        }

        // Check if user exists
        const userExists = await User.findByPk(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        //create event
        const event = await Tution.create({
            userId,
            title,
            description: description || null,
            date,
            schedules: schedules || new Date(),
            location: location || null,
        });

        res.status(201).json({ message: "Event created successfully.", data: event });
    } catch (error: any) {
        console.error("Create event error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }   
};


//Gett all events
export const getAllEvents = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const events = await Tution.findAll({
            include: [{ model: User, attributes: ["id", "name"] }],
        });
        res.status(200).json({ message: "Events retrieved successfully.", data: events });
    } catch (error: any) {
        console.error("Get all events error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }
};

//Get event by id
export const getEventById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;
        const event = await Tution.findByPk(id, {
            include: [{ model: User, attributes: ["id", "name"] }],
        });
        if (!event) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        res.status(200).json({ message: "Event retrieved successfully.", data: event });
    }
    catch (error: any) {    
        console.error("Get event by id error:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error?.message || error,
        });
    }   
};