import { Request, Response } from "express";
import Tution from "../models/Tution";
import User from "../models/User";

// Create a new tution
export const createTution = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, tutor, subject, location, fee, description, schedules } =
      req.body;

    // Validate required fields
    if (!userId || !subject || !tutor) {
      res
        .status(400)
        .json({ message: "userId, tutor, and subject are required." });
      return;
    }

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Create tution
    const tution = await Tution.create({
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
  } catch (error: any) {
    console.error("Create tution error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Get every tution
export const getAllTutions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tutions = await Tution.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ data: tutions });
  } catch (error: any) {
    console.error("Get all tutions error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Get tution by tution id
export const getTutionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const tution = await Tution.findByPk(id);

    if (!tution) {
      res.status(404).json({ message: "Tution not found." });
      return;
    }

    res.status(200).json({ data: tution });
  } catch (error: any) {
    console.error("Get tution by id error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// Geting tution by user id
export const getTutionsByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    const tutions = await Tution.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ data: tutions });
  } catch (error: any) {
    console.error("Get tutions by user error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// UPDATE - PUT /tutions/:id
export const updateTution = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { tutor, subject, location, fee, description, schedules } = req.body;

    const tution = await Tution.findByPk(id);
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
  } catch (error: any) {
    console.error("Update tution error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};

// DELETE - DELETE /tutions/:id
export const deleteTution = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const tution = await Tution.findByPk(id);
    if (!tution) {
      res.status(404).json({ message: "Tution not found." });
      return;
    }

    await tution.destroy();

    res.status(200).json({ message: "Tution deleted successfully." });
  } catch (error: any) {
    console.error("Delete tution error:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error?.message || error,
    });
  }
};
