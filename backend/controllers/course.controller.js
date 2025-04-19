import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/purchase.model.js";

export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    const { image, video } = req.files;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ errors: "No file uploaded" });
    }

    // Image upload to Cloudinary
    const imageResponse = await cloudinary.uploader.upload(image.tempFilePath);
    if (!imageResponse || imageResponse.error) {
      return res.status(400).json({ errors: "Error uploading image to Cloudinary" });
    }

    // Video upload to Cloudinary
    const videoResponse = await cloudinary.uploader.upload(video.tempFilePath, {
      resource_type: "video",
    });
    if (!videoResponse || videoResponse.error) {
      return res.status(400).json({ errors: "Error uploading video to Cloudinary" });
    }

    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: imageResponse.public_id,
        url: imageResponse.url,
      },
      videos: [{
        public_id: videoResponse.public_id,
        url: videoResponse.url,
      }],
      creatorId: adminId,
    };

    const course = await Course.create(courseData);
    res.json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating course" });
  }
};

export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price } = req.body;

  try {
    const courseSearch = await Course.findById(courseId);
    if (!courseSearch) {
      return res.status(404).json({ errors: "Course not found" });
    }

    const updateData = {
      title,
      description,
      price,
    };

    if (req.files && req.files.image) {
      const imageResponse = await cloudinary.uploader.upload(req.files.image.tempFilePath);
      if (!imageResponse || imageResponse.error) {
        return res.status(400).json({ errors: "Error uploading image to Cloudinary" });
      }
      updateData.image = {
        public_id: imageResponse.public_id,
        url: imageResponse.url,
      };
    }

    if (req.files && req.files.video) {
      const videoResponse = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        resource_type: "video",
      });
      if (!videoResponse || videoResponse.error) {
        return res.status(400).json({ errors: "Error uploading video to Cloudinary" });
      }
      updateData.videos = [{
        public_id: videoResponse.public_id,
        url: videoResponse.url,
      }];
    }

    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        creatorId: adminId,
      },
      updateData,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ errors: "can't update, created by other admin" });
    }

    res.status(201).json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ errors: "Error in course updating" });
    console.log("Error in course updating ", error);
  }
};

export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  try {
    const course = await Course.findOneAndDelete({
      _id: courseId,
      creatorId: adminId,
    });
    if (!course) {
      return res.status(404).json({ errors: "can't delete, created by other admin" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in course deleting" });
    console.log("Error in course deleting", error);
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(201).json({ courses });
  } catch (error) {
    res.status(500).json({ errors: "Error in getting courses" });
    console.log("error to get courses", error);
  }
};

export const courseDetails = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.userId;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const purchase = await Purchase.findOne({ userId, courseId });
    if (!purchase) {
      return res.status(403).json({ error: "You do not have access to this course" });
    }

    res.status(200).json({ course });
  } catch (error) {
    res.status(500).json({ errors: "Error in getting course details" });
    console.log("Error in course details", error);
  }
};

import Stripe from "stripe";
import config from "../config.js";
const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ errors: "Course not found" });

    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(400).json({ errors: "User already purchased this course" });
    }

    const amount = Math.round(course.price * 100); // ✅ Convert to cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(201).json({
      message: "Course purchased successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log("Stripe Error:", error.message);
    res.status(500).json({ errors: error.message || "Payment failed" });
  }
};