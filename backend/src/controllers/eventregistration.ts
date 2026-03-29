import { Request, Response } from "express";
import EventRegistration from "../models/EventRegistration";
import User from "../models/User";
import Events from "../models/Events";
import nodemailer from "nodemailer";
import { Op } from "sequelize";

// Create / Register for an event
export const registerForEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      eventId,
      userId,
      registeredname,
      registeredemail,
      numberoftickets,
    } = req.body;
    // Validate required fields
    if (
      !eventId ||
      !userId ||
      !registeredname ||
      !registeredemail ||
      !numberoftickets
    ) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Check if event exists
    const eventExists = await Events.findByPk(eventId);
    if (!eventExists) {
      res.status(404).json({ message: "Event not found." });
      return;
    }

    // Create event registration
    const registration = await EventRegistration.create({
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
        if (!emailUser || !emailPass) return;

        const transporter = nodemailer.createTransport({
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
      } catch (mailError) {
        console.error("Send ticket email error:", mailError);
      }
    })();
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
    const eventId = Number(req.query.eventId);
    if (!eventId) {
      res.status(400).json({ message: "Valid eventId query is required." });
      return;
    }

    const registrations = await EventRegistration.findAll({
      where: { eventId },
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

// Get total registrations for all events owned by a user
export const getOwnerRegistrationCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ownerId = Number(req.params.ownerId);

    if (!ownerId) {
      res.status(400).json({ message: "Valid ownerId is required." });
      return;
    }

    const ownerEvents = await Events.findAll({
      where: { userId: ownerId },
      attributes: ["eventId"],
    });

    const eventIds = ownerEvents
      .map((event) => event.eventId)
      .filter((eventId): eventId is number => typeof eventId === "number");

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

    const totalRegistrations = await EventRegistration.count({
      where: {
        eventId: {
          [Op.in]: eventIds,
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
  } catch (error: any) {
    console.error("Get owner registration count error:", error);
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
    const registration = await EventRegistration.findByPk(id);
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
    registration.registeredname = registeredName || registration.registeredname;
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
