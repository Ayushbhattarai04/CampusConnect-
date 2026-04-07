"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./models/User");
require("./models/Posts");
require("./models/Likes");
require("./models/Jobs");
require("./models/Tution");
require("./models/Events");
require("./models/Comments");
require("./models/Profile");
require("./models/EventRegistration");
require("./models/JobApplied");
require("./models/Communities");
require("./models/CommunityMember");
require("./models/CommunityPosts");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const userAuth_1 = __importDefault(require("./routes/userAuth"));
const posts_1 = __importDefault(require("./routes/posts"));
const comments_1 = __importDefault(require("./routes/comments"));
const likes_1 = __importDefault(require("./routes/likes"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const tution_1 = __importDefault(require("./routes/tution"));
const events_1 = __importDefault(require("./routes/events"));
const profile_1 = __importDefault(require("./routes/profile"));
const eventregistration_1 = __importDefault(require("./routes/eventregistration"));
const jobappllied_1 = __importDefault(require("./routes/jobappllied"));
const community_1 = __importDefault(require("./routes/community"));
const communityPosts_1 = __importDefault(require("./routes/communityPosts"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://192.168.56.1:3000"],
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", userAuth_1.default);
app.use("/api/post", posts_1.default);
app.use("/api/comments", comments_1.default);
app.use("/api/likes", likes_1.default);
app.use("/api/jobs", jobs_1.default);
app.use("/api/tution", tution_1.default);
app.use("/api/events", events_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/event-registration", eventregistration_1.default);
app.use("/api/job-applications", jobappllied_1.default);
app.use("/api/communities", community_1.default);
app.use("/api/community-posts", communityPosts_1.default);
// Test route
app.get("/", (req, res) => {
    res.json({ message: "Auth API is running" });
});
// Start server
const startServer = async () => {
    await (0, database_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
startServer();
