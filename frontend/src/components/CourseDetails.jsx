import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import toast from "react-hot-toast";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token; // Retrieve the token from the user object

        if (!token) {
          toast.error("Please log in to view course details");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/course/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setCourse(response.data.course);
        setHasPurchased(response.data.course.videos !== undefined); // Check if videos are included
        setLoading(false);
      } catch (error) {
        console.log("Error fetching course details:", error);
        if (error.response?.status === 403) {
          toast.error("You are not authorized to view this course");
          navigate("/login");
        } else {
          toast.error("Failed to fetch course details");
        }
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!course) {
    return <p>Course not found</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-xl">₹{course.price}</span>
      </div>

      {/* Display Videos if Purchased */}
      {hasPurchased ? (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Videos:</h3>
          {course.videos.map((video, index) => (
            <div key={index} className="mb-2">
              <video controls className="w-full">
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500">
          You need to purchase this course to access the videos.
        </p>
      )}
    </div>
  );
}

export default CourseDetails;