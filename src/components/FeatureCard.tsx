interface FeatureCardProps {
  iconSvg: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconSvg, title, description }) => {
  return (
    <div className="bg-gradient-to-br from-[#0E0E4A] to-[#030322] bg-opacity-70 backdrop-filter backdrop-blur-lg p-6 md:p-12 rounded-xl shadow-lg border border-gray-700 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-gray-300">
          <img src={iconSvg} alt={iconSvg} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 font-inter tracking-0">
          {title}
        </h2>
        <p className="text-white text-sm md:text-base leading-relaxed font-inter font-normal">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;