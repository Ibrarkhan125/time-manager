import React from "react";

const Landing: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
    <h1 className="text-4xl font-bold mb-4">Student Time Management App</h1>
    <p className="mb-8 text-lg text-gray-700">
      Organize your study, tasks, and time with ease.
    </p>
    <div className="flex gap-4">
      <a
        href="/login"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Login
      </a>
      <a
        href="/signup"
        className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
      >
        Sign Up
      </a>
    </div>
  </div>
);

export default Landing;
