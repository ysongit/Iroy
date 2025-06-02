interface FeatureCardProps {
  title: string;
  description1: string;
  description2: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description1, description2 }) => {
  return (
    <div className="bg-gradient-to-br from-[#0E0E4A] to-[#030322] bg-opacity-70 backdrop-filter backdrop-blur-lg p-6 md:p-12 rounded-xl shadow-lg border border-gray-700 mb-8">
      <h2 className="text-40 md:text-3xl font-bold text-white mb-4 font-inter tracking-0">
        {title}
      </h2>
      <p className="text-white md:text-lg leading-relaxed font-inter font-normal text-[24px]">
        {description1}
      </p>
      <p className="text-white md:text-lg mb-6 leading-relaxed font-inter font-normal text-[24px]">
        {description2}
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="px-6 py-3 bg-transparent hover:bg-gray-800 text-[#8C8C8C] rounded-full shadow-md transition-colors duration-200 flex items-center justify-center border-2 border-solid border-[#8C8C8C] font-inter font-bold text-base tracking-0 cursor-pointer">
          <span>Learn more!</span>
        </button>
        <button className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-full shadow-md flex items-center justify-center space-x-2 transition-colors duration-200 font-inter font-bold text-base tracking-0 cursor-pointer">
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
  );
};

export default FeatureCard;