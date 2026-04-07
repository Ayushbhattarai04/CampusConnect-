"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Profile_1 = __importDefault(require("../models/Profile"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = __importDefault(require("../config/database"));
const register = async (req, res) => {
    const t = await database_1.default.transaction();
    try {
        const { username, email, password, institution, studId } = req.body;
        // Validation
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ error: "Username, email, and password are required" });
        }
        // Check if user exists
        const existingUser = await User_1.default.findOne({
            where: { email },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "User already exists with this email" });
        }
        // Check username
        const existingUsername = await User_1.default.findOne({
            where: { username },
        });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already taken" });
        }
        // Create user inside transaction
        const user = await User_1.default.create({
            username,
            email,
            password,
            institution: institution || null,
            studId: studId || null,
        }, { transaction: t });
        await Profile_1.default.create({
            userId: user.id,
            bio: "",
            profilePic: "",
        }, { transaction: t });
        const verificationToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const verificationUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;
        const emailConfigured = !!process.env.EMAIL_USER &&
            !!process.env.EMAIL_PASS &&
            !!process.env.EMAIL_PORT;
        if (emailConfigured) {
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: Number(process.env.EMAIL_PORT),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                to: user.email,
                subject: "Verify your email",
                html: `<a href="${verificationUrl}">Click here to verify your email</a>`,
            });
        }
        else {
            await user.update({ verified: true }, { transaction: t });
        }
        await t.commit();
        res.status(201).json({
            message: emailConfigured
                ? "Registration successful! Check your email to verify your account."
                : "Registration successful! Email verification is not configured, so your account was auto-verified.",
            token: verificationToken,
            verificationUrl,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                institution: user.institution,
                studId: user.studId,
                role: user.role,
            },
        });
    }
    catch (error) {
        await t.rollback();
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        // Find user
        const user = await User_1.default.findOne({ where: { email } });
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                institution: user.institution,
                studId: user.studId,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};
exports.login = login;
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.findAll({
            attributes: ["id", "username", "email"],
            order: [["createdAt", "DESC"]],
        });
        res.json(users);
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to load users" });
    }
};
exports.getUsers = getUsers;
