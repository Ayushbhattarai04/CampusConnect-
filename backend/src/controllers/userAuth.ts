import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import nodemailer from "nodemailer";
import sequelize from "../config/database";

export const register = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { username, email, password, institution, studId } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Check username
    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create user inside transaction
    const user = await User.create(
      {
        username,
        email,
        password,
        institution: institution || null,
        studId: studId || null,
      },
      { transaction: t },
    );

    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    // Setup transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${verificationUrl}">Click here to verify your email</a>`,
    });

    await t.commit();
    res.status(201).json({
      message:
        "Registration successful! Check your email to verify your account.",
      token: verificationToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        institution: user.institution,
        studId: user.studId,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res
        .status(401)
        .json({ error: "Please verify your email before logging in." });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        institution: user.institution,
        studId: user.studId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // Fix: TypeScript does not know req.user exists, so cast req as any
    const userId = (req as any).user?.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
