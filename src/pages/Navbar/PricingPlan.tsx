import React from 'react';
import { FaUser, FaHome, FaBuilding } from 'react-icons/fa';

type Plan = {
  name: string;
  price: string;
  features: string[];
  icon: JSX.Element;
  highlight?: boolean;
  details: string;
};

const plans: Plan[] = [
  {
    name: 'Basic Care',
    price: '₹99/month',
    icon: <FaUser className="text-green-600 text-2xl" />,
    features: [
      'Book appointments with nearby doctors',
      'View doctor profiles & specialties',
      'Access basic health tips & reminders',
      'Email support',
    ],
    details: 'Easy access to care. For casual users & first-time patients.',
  },
  {
    name: 'Plus Care',
    price: '₹199/month',
    icon: <FaHome className="text-blue-600 text-2xl" />,
    features: [
      'All Basic Care features',
      'Priority appointment booking',
      'Appointment reminders via SMS',
      'Access to health records & reports',
      'Chat support',
    ],
    highlight: true,
    details: 'Stay connected, stay healthy. For regular users & families.',
  },
  {
    name: 'Premium Care',
    price: '₹399/month',
    icon: <FaBuilding className="text-purple-600 text-2xl" />,
    features: [
      'All Plus Care features',
      'Teleconsultation with expert doctors',
      'Personalized health plans',
      'Medication reminders & alerts',
      '24/7 customer support',
      'Access to wellness programs & discounts',
    ],
    details: 'For power users & chronic care management.',
  },
];

const PricingPlan: React.FC = () => {
  return (
    <div
      id="PricingPlan"
      className="min-h-[600px] bg-[#ededed] flex flex-col items-center px-4 py-10"
    >
      <h2 className="text-black text-center text-4xl mt-10">Pricing Plan</h2>
      <p className="text-black mt-3 mb-10 text-center">
        💡 Affordable Care. Trusted Plans. Choose what suits you best.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl shadow-md p-5 flex flex-col justify-between bg-white border border-transparent transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-105"
          >
            {plan.highlight && (
              <span className="absolute top-4 right-4 bg-white text-blue-700 text-xs font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Popular
              </span>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                {plan.icon}
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>

              <p className="text-2xl font-bold mb-3">
                {plan.price}
                <span className="text-sm font-medium"> /monthly</span>
              </p>

              <ul className="space-y-2 text-sm mb-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-400 group-hover:text-green-200 mr-2">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-sm italic bg-blue-50 text-gray-700 group-hover:bg-blue-600 group-hover:text-white p-2 rounded-md transition-all duration-300">
                {plan.details}
              </div>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl font-semibold bg-blue-600 text-white group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors duration-300">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlan;
