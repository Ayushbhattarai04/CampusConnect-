import "./models/User";
import "./models/Posts";
import "./models/Likes";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import authRoutes from "./routes/userAuth";
import postsRoutes from "./routes/posts";
import commentsRoutes from "./routes/comments";
import likesRoutes from "./routes/likes";
import "./models/Comments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Auth API is running" });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
