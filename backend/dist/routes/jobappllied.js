"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadCV_1 = __importDefault(require("../middleware/uploadCV"));
const jobapplied_1 = require("../controllers/jobapplied");
const router = (0, express_1.Router)();
router.post("/apply", uploadCV_1.default.single("cv"), jobapplied_1.applyForJob);
router.get("/applications", jobapplied_1.getAllApplications);
router.get("/applications/:appliedId", jobapplied_1.getApplicationById);
router.patch("/applications/:appliedId/status", jobapplied_1.updateApplicationStatus);
router.get("/applications/:appliedId/cv", jobapplied_1.downloadCV);
router.delete("/applications/:appliedId", jobapplied_1.deleteApplication);
exports.default = router;
