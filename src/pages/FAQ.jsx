import { useState, useEffect } from 'react';
import faqBackground from '../assets/FAQ/FAQ.jpg';

// Custom Animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInDelay {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
  .animate-fadeInDelay { animation: fadeInDelay 1.2s ease-in-out; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const FAQ = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-gray-800 font-sans overflow-hidden"
      style={{ backgroundImage: `url(${faqBackground})` }}
    >
      <div className="container mx-auto px-6 py-16 bg-white/70 backdrop-blur-sm">
        {/* FAQ Content - Centered */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-teal-800 mb-6 text-center animate-fadeIn">
            Frequently Asked Questions (FAQs)
          </h1>
          <div className="border-b-2 border-teal-600 w-20 mx-auto mb-12 animate-fadeIn"></div>
          <div className="space-y-8">
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I grow plants with limited space?</h3>
                <p className="text-gray-600 leading-relaxed">
                  You can use our space-saving gardening kits to grow plants on balconies, small patios, or windowsills.
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I care for my plants daily?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Water your plants regularly, place them where they get enough sunlight, and remove dead leaves to keep them healthy.
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">What type of soil is best for home gardening?</h3>
                <p className="text-gray-600 leading-relaxed">
                  A mix of organic compost, coconut coir, and loamy soil works well for most vegetables and herbs in tropical climates.
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">When will I receive my order?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Orders are usually delivered within 3-5 working days after confirmation.
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you offer organic seeds and plants?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes, all our seeds and plants are 100% organic and non-GMO. We believe in sustainable and healthy gardening practices.
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/80 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInDelay">
              <span className="text-xl text-teal-700 mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-100">?</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I track my order?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on our website or through the courier’s website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;