import React from 'react';
import company1 from '../assets/company1.png';
import company2 from '../assets/company2.png';
import company3 from '../assets/company3.png';
import company4 from '../assets/company4.png';
import company5 from '../assets/company5.png';
import company6 from '../assets/company6.png';
import company7 from '../assets/company7.png';
import company8 from '../assets/company8.png';
import company9 from '../assets/company9.png';
import company10 from '../assets/company10.png';
import company11 from '../assets/company11.png';
import company12 from '../assets/company12.png';
import company13 from '../assets/company13.png';
import company14 from '../assets/company14.png';

const logoPlaceholders = [
  { alt: 'AngelHack', src: company1 },
  { alt: 'Gelato', src: company2 },
  { alt: 'Juxta Mode', src: company3 },
  { alt: 'Fleek', src: company4 },
  { alt: 'Crossmint', src: company5 },
  { alt: 'Z', src: company6 },
  { alt: 'Gaia', src: company7 },
  { alt: 'Encode Club', src: company8 },
  { alt: 'Thirdweb', src: company9 },
  { alt: 'deBridge', src: company10 },
  { alt: 'Tomo', src: company11 },
  { alt: 'Yakoa', src: company12 },
  { alt: 'Holoworld', src: company13 },
  { alt: 'XPinnetwork', src: company14 },
];

const BackedByTheBestSection: React.FC = () => {
  return (
    <section className="bg-gray-950 py-12"> {/* Darker background to match the image */}
      <div className="">
        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-8 text-center">
          BACKED BY THE BEST
        </h2>
        <div className="bg-white relative w-full overflow-hidden py-4 border border-blue-500 border-dashed">
            <div className="flex items-center logo-strip-animated-wrapper">
            {[...logoPlaceholders, ...logoPlaceholders].map((logo, index) => (
              <div key={`${logo.alt}-${index}`} className="flex-shrink-0 mx-8">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-10 object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BackedByTheBestSection;