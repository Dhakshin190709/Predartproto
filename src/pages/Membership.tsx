import React, { useState, useRef } from 'react';

const Membership: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);

  // Create a ref to the plan details section to scroll to it
  const planDetailsRef = useRef<HTMLDivElement | null>(null);

  const plans = [
    {
      name: '1 Day Trial',
      price: 0,
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
      price: 9.99,
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
      price: 19.99,
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
      name: 'Diamond',
      price: 29.99,
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
      name: 'Platinum',
      price: 49.99,
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
    if (currentIndex < plans.length - 2) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleChoosePlan = (planName: string) => {
    setSelectedPlan(planName);
    setSelectedDuration(null);
    setTotalPrice(null); // Reset total price when choosing a new plan
    setSubscriptionMessage(null); // Reset subscription message

    // Navigate to the plan details section by scroll
    if (planDetailsRef.current) {
      planDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);

    // Calculate total price based on selected duration and plan price
    if (selectedPlan) {
      let price = plans.find((plan) => plan.name === selectedPlan)?.price || 0;

      switch (duration) {
        case '7days':
          setTotalPrice(price * 1); // 1 week
          break;
        case '3months':
          setTotalPrice(price * 3); // 3 months
          break;
        case '6months':
          setTotalPrice(price * 6); // 6 months
          break;
        case '1year':
          setTotalPrice(price * 12); // 1 year
          break;
        case 'lifetime':
          setTotalPrice(price * 50); // Lifetime
          break;
        default:
          setTotalPrice(price); // Default case
          break;
      }
    }
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      const durationText = selectedDuration ? ` for ${selectedDuration}` : '';
      setSubscriptionMessage(
        `You have successfully subscribed to the ${selectedPlan} plan${durationText}! Total Price: $${totalPrice?.toFixed(2)}`
      );
      setTimeout(() => setSubscriptionMessage(null), 5000); // Remove message after 5 seconds
    }
  };

  return (
    <div className="membership-container max-w-5xl mx-auto px-4 py-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-center mb-6">Membership Plans</h1>
      <p className="text-center text-gray-600 mb-8">Choose the right plan for you!</p>

      {/* Success Message */}
      {subscriptionMessage && (
        <div className="bg-green-100 text-green-700 border border-green-400 px-4 py-3 rounded mb-6 text-center">
          {subscriptionMessage}
        </div>
      )}

      {/* Plan Selection */}
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
                  <h2 className="text-2xl font-semibold text-center mb-4">{plan.name}</h2>
                  <p className="text-lg font-bold text-center text-blue-500 mb-4">
                    {plan.name === '1 Day Trial'
                      ? '1 day price is $0' // Display specific message for 1 Day Trial plan
                      : `$${plan.price}/month`} {/* For other plans, display the monthly price */}
                  </p>
                  <ul className="mb-4 text-sm text-gray-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="mb-1">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleChoosePlan(plan.name)}
                      className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
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
          disabled={currentIndex >= plans.length - 2}
          className={`text-2xl p-2 rounded-full ${
            currentIndex >= plans.length - 2 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'
          }`}
        >
          &#8594;
        </button>
      </div>

      {/* Selected Plan Details */}
      {selectedPlan && (
        <div
          ref={planDetailsRef} // Reference to the plan details section
          className="w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] mx-auto mt-6 bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <h2 className="text-xl font-semibold mb-4">You have selected the {selectedPlan} plan</h2>

          {/* For 1 Day Trial, no duration selection */}
          {selectedPlan === '1 Day Trial' ? (
            <div className="text-lg font-semibold mb-4">
              Total Price: $0.00
            </div>
          ) : (
            <div className="mb-3">
              <h3 className="text-lg font-semibold mb-2">Choose Duration</h3>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="7days"
                  name="duration"
                  value="7days"
                  onChange={() => handleDurationChange('7days')}
                  className="mr-2"
                />
                <label htmlFor="7days" className="text-sm">
                  7 Days - ${(plans.find((plan) => plan.name === selectedPlan)?.price || 0) * 1}
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="3months"
                  name="duration"
                  value="3months"
                  onChange={() => handleDurationChange('3months')}
                  className="mr-2"
                />
                <label htmlFor="3months" className="text-sm">
                  3 Months - ${(plans.find((plan) => plan.name === selectedPlan)?.price || 0) * 3}
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="6months"
                  name="duration"
                  value="6months"
                  onChange={() => handleDurationChange('6months')}
                  className="mr-2"
                />
                <label htmlFor="6months" className="text-sm">
                  6 Months - ${(plans.find((plan) => plan.name === selectedPlan)?.price || 0) * 6}
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="1year"
                  name="duration"
                  value="1year"
                  onChange={() => handleDurationChange('1year')}
                  className="mr-2"
                />
                <label htmlFor="1year" className="text-sm">
                  1 Year - ${(plans.find((plan) => plan.name === selectedPlan)?.price || 0) * 12}
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="lifetime"
                  name="duration"
                  value="lifetime"
                  onChange={() => handleDurationChange('lifetime')}
                  className="mr-2"
                />
                <label htmlFor="lifetime" className="text-sm">
                  Lifetime - ${(plans.find((plan) => plan.name === selectedPlan)?.price || 0) * 50}
                </label>
              </div>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
          >
            Subscribe to {selectedPlan} {selectedDuration && `- ${selectedDuration}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default Membership;
