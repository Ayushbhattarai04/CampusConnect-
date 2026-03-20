import { Request, Response } from "express";
import EventRegistration from "../models/EventRegistration";
import User from "../models/User";
import nodemailer from "nodemailer";



// Create / Register for an event
export const registerForEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { eventId, userId, registeredName, registeredemail, numberoftickets } = req.body;
    // Validate required fields
    if (!eventId || !userId || !registeredName || !registeredemail || !numberoftickets) {
      res
        .status(400)
        .json({ message: "All fields are required." });
      return;
    }

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Create event registration
    const registration = await EventRegistration.create({
      eventId,
      userId,
      registeredName,
      registeredemail,
      numberoftickets,
    });

    res.status(201).json({
      message: "Registered for event successfully.",
      data: registration,
    });


    const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
  to: registeredemail,
  subject: "Your Event Ticket",
  html: `
  <div>
  <h2>Your are welcomed in our ${eventId}</h2>
    <p>Hi ${registeredName}, your ticket for event #${eventId} is confirmed.</p>
  </div>
  `,
});

  } catch (error: any) {
    console.error("Register for event error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Get all registrations for an event
export const getEventRegistrations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const registrations = await EventRegistration.findAll({
      where: { eventId },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });
    res.status(200).json({
      message: "Event registrations retrieved successfully.",
      data: registrations,
    });
  } catch (error: any) {
    console.error("Get event registrations error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Get registration by id
export const getRegistrationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const registration = await EventRegistration.findByPk(id, {
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });
    if (!registration) {
      res.status(404).json({ message: "Registration not found." });
      return;
    }
    res.status(200).json({
      message: "Registration retrieved successfully.",
      data: registration,
    });
  } catch (error: any) {
    console.error("Get registration by id error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Update registration
export const updateRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { registeredName } = req.body;
    const registration = await EventRegistration.findByPk(id);
    if (!registration) {
      res.status(404).json({ message: "Registration not found." });
      return;
    }
    registration.registeredName = registeredName || registration.registeredName;
    await registration.save();
    res.status(200).json({
      message: "Registration updated successfully.",
      data: registration,
    });
  } catch (error: any) {
    console.error("Update registration error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Delete registration
export const deleteRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const registration = await EventRegistration.findByPk(id);
    if (!registration) {
      res.status(404).json({ message: "Registration not found." });
      return;
    }
    await registration.destroy();
    res.status(200).json({ message: "Registration deleted successfully." });
  } catch (error: any) {
    console.error("Delete registration error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};
