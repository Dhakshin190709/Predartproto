import React, { useState } from 'react';

const Membership: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Basic Access',
        'No Support',
        'Limited Features',
        'Ad-Supported',
        'No Customization',
        'Single User Only',
        'Limited Storage',
      ],
    },
    {
      name: 'Silver',
      price: '$9.99/month',
      features: [
        'Standard Access',
        'Email Support',
        '10 Features',
        'Ad-Free Experience',
        'Basic Analytics',
        'Multi-Device Access',
        '5 GB Storage',
      ],
    },
    {
      name: 'Gold',
      price: '$19.99/month',
      features: [
        'Premium Access',
        'Priority Support',
        '20 Features',
        'Advanced Analytics',
        'Team Collaboration Tools',
        '10 GB Storage',
        'Customizable Dashboard',
      ],
    },
    {
      name: 'Premium',
      price: '$29.99/month',
      features: [
        'Full Access',
        '24/7 Support',
        '30 Features',
        'Unlimited Storage',
        'Advanced Security',
        'Dedicated Account Manager',
        'Priority Feature Updates',
      ],
    },
    {
      name: 'Elite',
      price: '$49.99/month',
      features: [
        'Exclusive Access',
        'Dedicated Support',
        'All Features',
        'Custom Integrations',
        'Unlimited Users',
        'Personalized Onboarding',
        'Priority Development Requests',
      ],
    },
  ];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < plans.length - 3) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChoosePlan = (planName: string) => {
    setSuccessMessage(`You have successfully chosen the ${planName} plan!`);
    setTimeout(() => setSuccessMessage(null), 3000); // Remove message after 3 seconds
  };

  return (
    <div className="membership-container max-w-5xl mx-auto px-4 py-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-center mb-6">Membership Plans</h1>
      <p className="text-center text-gray-600 mb-8">Choose the right plan for you!</p>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 border border-green-400 px-4 py-3 rounded mb-6 text-center">
          {successMessage}
        </div>
      )}

      {/* Navigation Arrows */}
      <div className="flex items-center">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`text-2xl p-2 rounded-full ${
            currentIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'
          }`}
        >
          &#8592;
        </button>

        <div className="flex overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              width: `${plans.length * (100 / 3)}%`,
            }}
          >
            {plans.map((plan, index) => (
              <div
                key={index}
                className="w-1/3 px-4 flex-shrink-0"
                style={{ minWidth: '33.33%' }}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 hover:scale-105">
                  {/* Plan Name */}
                  <h2 className="text-2xl font-semibold text-center mb-4">{plan.name}</h2>
                  {/* Price */}
                  <p className="text-lg font-bold text-center text-blue-500 mb-4">
                    {plan.price}
                  </p>
                  {/* Features */}
                  <ul className="mb-4 text-sm text-gray-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="mb-1">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  {/* Button */}
                  <div className="flex justify-center items-center h-full mt-9">
  <button
    onClick={() => handleChoosePlan(plan.name)}
    className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
              hover:from-[#007BFF] hover:to-[#004A99]
              text-white transition duration-150 
              ease-out hover:ease-in py-2 px-5 rounded-lg"
  >
    Choose Plan
  </button>
</div>

                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex >= plans.length - 3}
          className={`text-2xl p-2 rounded-full ${
            currentIndex >= plans.length - 3 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'
          }`}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default Membership;
