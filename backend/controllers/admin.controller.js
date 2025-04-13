import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: "firstName must be atleast 3 char long" }),
    lastName: z
      .string()
      .min(3, { message: "lastName must be atleast 3 char long" }),
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "password must be atleast 6 char long" }),
  });

  const validatedData = adminSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "Admin already exists" });
    }
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.status(201).json({ message: "Signup succeedded", newAdmin });
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    console.log("Error in signup", error);
  }
};

// Admin login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ errors: "Admin not found" });
    }

    // Step 2: Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ errors: "Invalid password" });
    }

    // Step 3: Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: "admin", // Optional: Add role for better authorization
      },
      config.JWT_ADMIN_PASSWORD, // Use your JWT secret key
      { expiresIn: "1d" } // Token expiry time
    );

    // Step 4: Set cookie (optional)
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, // Cannot be accessed via JS
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "Strict", // Prevent CSRF attacks
    };
    res.cookie("jwt", token, cookieOptions);

    // Step 5: Send response
    res.status(200).json({
      message: "Admin login successful",
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
      token,
    });
  } catch (error) {
    console.log("Error in admin login:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};
export const logout = (req, res) => {
  try {
   
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    console.log("Error in logout", error);
  }
};