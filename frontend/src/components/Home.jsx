import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function Home() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if admin is logged in
  useEffect(() => {
    const admin = localStorage.getItem("admin");
    setIsAdmin(!!admin); // true if admin exists in localStorage
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Slider settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 2, infinite: true, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="bg-gradient-to-r from-black to-blue-950">
      <div className="h-auto text-white container mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.webp" alt="CourseHaven Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl text-orange-500 font-bold">CourseHaven</h1>
          </div>
          <div className="space-x-4">
            {isAdmin ? (
              <Link to="/admin/dashboard" className="bg-transparent text-white text-lg py-2 px-4 border border-white rounded">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="bg-transparent text-white text-lg py-2 px-4 border border-white rounded">
                  Login
                </Link>
                <Link to="/signup" className="bg-transparent text-white text-lg py-2 px-4 border border-white rounded">
                  Signup
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Section */}
        <section className="text-center py-20">
          <h1 className="text-4xl font-semibold text-orange-500">CourseHaven</h1>
          <p className="text-gray-500 mt-2">Sharpen your skills with courses crafted by experts.</p>
          <div className="space-x-4 mt-8">
            <Link
              to="/courses"
              className="bg-green-500 text-white py-3 px-6 rounded font-semibold hover:bg-white hover:text-black transition duration-300"
            >
              Explore Courses
            </Link>
            <a
              href="https://www.youtube.com/learncodingofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black py-3 px-6 rounded font-semibold hover:bg-green-500 hover:text-white transition duration-300"
            >
              Course Videos
            </a>
          </div>
        </section>

        {/* Course Slider */}
        <section className="p-10">
          <Slider {...settings}>
            {courses.map((course) => (
              <div key={course._id} className="p-4">
                <div className="relative flex-shrink-0 w-92 transition-transform duration-300 transform hover:scale-105">
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <img className="h-32 w-full object-contain" src={course.image.url} alt={course.title} />
                    <div className="p-6 text-center">
                      <h2 className="text-xl font-bold text-white">{course.title}</h2>
                      <Link
                        to={`/buy/${course._id}`}
                        className="mt-4 inline-block bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-blue-500 transition duration-300"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        <hr className="border-gray-700" />

        {/* Footer */}
        <footer className="my-12">
          <div className="grid grid-cols-1 md:grid-cols-3 text-center md:text-left">
            
            {/* Logo & Social Links */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2">
                <img src="/logo.webp" alt="CourseHaven Logo" className="w-10 h-10 rounded-full" />
                <h1 className="text-2xl text-orange-500 font-bold">CourseHaven</h1>
              </div>
              <p className="mt-3">Follow us:</p>
              <div className="flex space-x-4 mt-2">
                <a href="#"><FaFacebook className="text-2xl hover:text-blue-400 transition duration-300" /></a>
                <a href="#"><FaInstagram className="text-2xl hover:text-pink-600 transition duration-300" /></a>
                <a href="#"><FaTwitter className="text-2xl hover:text-blue-600 transition duration-300" /></a>
              </div>
            </div>

            {/* Connects */}
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-semibold">Connects</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition duration-300">YouTube - Learn Coding</li>
                <li className="hover:text-white transition duration-300">Telegram - Learn Coding</li>
                <li className="hover:text-white transition duration-300">GitHub - Learn Coding</li>
              </ul>
            </div>

            {/* Copyright */}
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-semibold">© 2024 CourseHaven</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition duration-300">Terms & Conditions</li>
                <li className="hover:text-white transition duration-300">Privacy Policy</li>
                <li className="hover:text-white transition duration-300">Refund & Cancellation</li>
              </ul>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}

export default Home;
