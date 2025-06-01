import React from 'react';
import Logo from '../assets/logo2.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear(); // Dynamically gets the current year

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"> {/* Responsive container */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-10 md:space-y-0">
          {/* Left Section: AROY Logo and Copyright */}
          <div className="flex flex-col items-start space-y-4">
            <img src={Logo} alt="Logo" />
            <p className="text-white font-[Inter] font-normal text-2xl leading-none tracking-normal">
              © IROY {currentYear} All rights reserved.
            </p>
          </div>

          {/* Right Section: Navigation Links (two columns) */}
          <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-24 text-white text-lg font-[Inter] font-normal tracking-normal">
            {/* Column 1 */}
            <div className="flex flex-col space-y-3">
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Learn</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">About</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Contact</a>
            </div>
            {/* Column 2 */}
            <div className="flex flex-col space-y-3">
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Twitter</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Discord</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Github</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
