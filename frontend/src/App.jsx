import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Purchases from "./components/Purchases";
import Buy from "./components/Buy";
import Courses from "./components/Courses";
import CourseDetails from "./components/CourseDetails"; // Import CourseDetails
import AdminSignup from "./admin/AdminSignup"; // Make sure to import correctly
import AdminLogin from "./admin/AdminLogin"; // AdminLogin import
import Dashboard from "./admin/Dashboard"; // Admin Dashboard import
import CourseCreate from "./admin/CourseCreate"; // Admin CourseCreate import
import UpdateCourse from "./admin/UpdateCourse"; // Admin UpdateCourse import
import OurCourses from "./admin/OurCourses"; // Admin OurCourses import

function App() {
  const userToken = localStorage.getItem("user");
  const adminToken = localStorage.getItem("admin");

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Protected Routes for Users */}
        <Route
          path="/purchases"
          element={userToken ? <Purchases /> : <Navigate to="/login" />}
        />
        <Route
          path="/buy/:courseId"
          element={userToken ? <Buy /> : <Navigate to="/login" />}
        />
        
        {/* Course Details Route */}
        <Route path="/course/:courseId" element={<CourseDetails />} />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Routes for Admin */}
        <Route
          path="/admin/dashboard"
          element={adminToken ? <Dashboard /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/admin/create-course"
          element={adminToken ? <CourseCreate /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/admin/update-course/:id"
          element={adminToken ? <UpdateCourse /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/admin/our-courses"
          element={adminToken ? <OurCourses /> : <Navigate to="/admin/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;