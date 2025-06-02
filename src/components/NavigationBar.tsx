import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import Logo from '../assets/logo.png';

function NavigationBar() {
  const { openConnectModal } = useConnectModal();

  return (
    <nav className="container m-auto pt-6">
      <div className="p-4 flex items-center justify-between bg-[#FFFFFF30] border border-solid border-[#FFFFFF40] rounded-[14px]">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        <div className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-blue-300 transition-colors duration-200">
            Learn
          </a>
          <div className="relative group">
            <button className="flex items-center hover:text-blue-300 transition-colors duration-200">
              Tools
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Dropdown for Tools (hidden by default) */}
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
              <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                Tool 1
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">
                Tool 2
              </a>
            </div>
          </div>
        </div>

        {/* Auth and CTA buttons */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer" onClick={openConnectModal}>
            Login
          </button>
          <button className="px-4 py-2 bg-white hover:bg-gray-300 text-[#070707] rounded-[30px] shadow-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer">
            <span>Request a demo</span>
            <svg
              className="w-4 h-4"
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
      </div>
      
    </nav>
  )
}

export default NavigationBar;
