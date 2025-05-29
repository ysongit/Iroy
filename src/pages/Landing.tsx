import React from 'react';

import Hero from '../assets/hero.png';
import NavigationBar from '../components/NavigationBar';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030322] text-white font-inter">
      <NavigationBar />

      {/* Hero Section Content */}
      <header className="container m-auto relative flex flex-col md:flex-row items-center justify-center md:justify-start min-h-[calc(100vh-80px)] p-4 md:p-8 overflow-hidden">
        {/* Left side: Logo */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-20 md:opacity-100 z-0">
          <img src={Hero} alt="Hero" />
        </div>

        {/* Right side: Text content */}
        <div className="relative z-10 text-center md:text-left md:ml-auto md:w-1/2 lg:w-2/5 xl:w-1/3 xl:mr-30 p-4 md:p-0">
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 rounded-lg">
            The layer protecting your digital rights.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 rounded-lg">
            AI-native content needs AI-native rights. Otherwise, you're limited.
          </p>
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center space-x-2 mx-auto md:mx-0 transition-colors duration-200">
            <span>Discover the Creative Cipher</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </header>
    </div>
  );
};

export default Landing;
