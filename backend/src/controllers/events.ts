import { Request, Response } from "express";
import Events from "../models/Events";
import User from "../models/User";

//Create a new event
export const createEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, organizer, title, description, fee, schedules, location } =
      req.body;

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
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    //create event
    const event = await Events.create({
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
    const events = await Events.findAll({
      include: [{ model: User, attributes: ["id", "username"] }],
    });
    res
      .status(200)
      .json({ message: "Events retrieved successfully.", data: events });
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
    const event = await Events.findByPk(id, {
      include: [{ model: User, attributes: ["id", "username"] }],
    });
    if (!event) {
      res.status(404).json({ message: "Event not found." });
      return;
    }
    res
      .status(200)
      .json({ message: "Event retrieved successfully.", data: event });
  } catch (error: any) {
    console.error("Get event by id error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

//Delete events by id
export const deleteEventById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Events.findByPk(id);
    if (!event) {
      res.status(404).json({ message: "Event not found." });
      return;
    }
    await event.destroy();
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error: any) {
    console.error("Delete event by id error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

//Update event by id
export const updateEventById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { organizer, title, description, fee, schedules, location } =
      req.body;
    const event = await Events.findByPk(id);
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
    if (organizer !== undefined) event.organizer = organizer;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (fee !== undefined) event.fee = fee;
    if (location !== undefined) event.location = location;

    await event.save();
    res
      .status(200)
      .json({ message: "Event updated successfully.", data: event });
  } catch (error: any) {
    console.error("Update event by id error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};
