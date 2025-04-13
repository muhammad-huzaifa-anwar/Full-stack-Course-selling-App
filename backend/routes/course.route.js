import express from "express";
import {
  buyCourses,
  courseDetails,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "../controllers/course.controller.js";
import userMiddleware from "../middlewares/user.mid.js";
import adminMiddleware from "../middlewares/admin.mid.js";

const router = express.Router();

// Admin routes
router.post("/create", adminMiddleware, createCourse);
router.put("/update/:courseId", adminMiddleware, updateCourse);
router.delete("/delete/:courseId", adminMiddleware, deleteCourse);

// Public routes
router.get("/courses", getCourses);
router.get("/:courseId", userMiddleware, courseDetails); // Apply userMiddleware to protect course details

// User routes
router.post("/buy/:courseId", userMiddleware, buyCourses);

export default router;