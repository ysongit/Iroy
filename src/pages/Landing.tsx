import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Feature1 from '../assets/feature1.png';
import Feature2 from '../assets/feature2.png';
import Feature3 from '../assets/feature3.png';
import Feature4 from '../assets/feature4.png';
import Hero from '../assets/hero.png';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import BackedByTheBestSection from '../components/BackedByTheBestSection';

const Landing: React.FC = () => {
  const { address} = useAccount();
  const changePage = useNavigate();

  useEffect(() => {
    if (address) changePage("/dashboard");
  }, [address])
  
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

      <div className="container mx-auto pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10 text-center">
          Iroy provides a comprehensive suite of features
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Intellectual Properties Card */}
          <FeatureCard
            iconSvg={Feature2}
            title="AI-Based IP Similarity Detection"
            description="Uses Eliza + Story Protocol Plugin to vectorize and semantically compare content. Supports multiple formats: image, text, music, etc."
          />

          {/* Digital Platform Card */}
          <FeatureCard
            iconSvg={Feature1}
            title="AI Style Plagiarism Detection"
            description="Trained models detect stylistic similarities such as tone, composition, and color palette. Surfaces even subtle overlaps undetectable to the human eye. Learns and improves with user feedback."
          />

          <FeatureCard
            iconSvg={Feature4}
            title="Automated IP Registration via Story Protocol"
            description="Based on audit results, users can register their content on-chain. Audit data is also stored, enhancing credibility and transparency."
          />

          {/* Digital Platform Card */}
          <FeatureCard
            iconSvg={Feature3}
            title="Snap/Wallet Integration"
            description="Integrates with Tomo Wallet to allow IP checks directly in-wallet. Users get real-time modal feedback if content is similar to existing IPs. Delivered via Snap as a lightweight wallet-based service."
          />
        </div>
        
      </div>

      <BackedByTheBestSection />

      <Footer />
    </div>
  );
};

export default Landing;
