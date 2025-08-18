import React from 'react';

const featuresGreen = [
  {
    number: 1,
    title: 'Comprehensive Patient Records',
    description:
      'Seamless access to EMR/EHR, appointment history, and medical records in one place.',
  },
  {
    number: 2,
    title: 'Admin Dashboard',
    description:
      'Centralized control for user management, analytics, and role-based access.',
  },
  {
    number: 3,
    title: 'Multi-Tenant Support',
    description:
      'Efficiently manage multiple branches or clinics under a single platform.',
  },
  {
    number: 4,
    title: 'Secure 2-Way Authentication',
    description:
      'Ensure data protection with OTP-based and role-authenticated login.',
  },
  {
    number: 5,
    title: 'Doctor Portal',
    description:
      'Doctors can manage schedules, access EMRs, and communicate securely with patients.',
  },
];

const featuresBlue = [
  {
    number: 1,
    title: 'Smart Pharmacy Management',
    description:
      'Handle prescriptions, billing, and inventory with real-time tracking.',
  },
  {
    number: 2,
    title: 'Automated Notifications',
    description:
      'Send reminders via SMS, email, or WhatsApp for appointments and follow-ups.',
  },
  {
    number: 3,
    title: 'Advanced Diagnostics Module',
    description:
      'Manage lab test requests, upload results, and generate digital reports.',
  },
  {
    number: 4,
    title: 'Integrated Billing System',
    description:
      'Create invoices, manage insurance claims, and track payments effortlessly.',
  },
  {
    number: 5,
    title: 'NGO Camp & Survey Tools',
    description:
      'Conduct health camps and surveys with real-time dashboards and analytics.',
  },
];

const topPointsGreen = [
  'Unified Record System',
  'Empowered Doctor Tools',
  'Centralized Admin Dashboard',
  'Multi-Branch Support',
  'Enhanced Security Access',
];

const topPointsBlue = [
  'Outreach & Communication Tools',
  'Operational Efficiency Features',
  'Smart Patient Engagement Suite',
  'User-Friendly Experience',
  'Automation & Analytics Power Pack',
];

const Features: React.FC = () => {
  return (
    <div id="Features">
      <h2 className="text-black text-center text-4xl mt-10">Features</h2>
      <p className="text-black mt-3 mb-10 text-center">
        Simple to Start. Powerful to Grow. Choose Your Perfect Fit.
      </p>
      {/* Section 1: Green Theme */}
      <div className="bg-[#e8f4ed] px-6 md:px-16 py-10 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-12 max-w-7xl mx-auto">
          <div className="md:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold text-black text-black-900 mb-10">
              Hospital Management Core Features
            </h1>
            <ul className="list-disc list-inside text-black text-black-800 space-y-4 text-xl md:text-2xl leading-relaxed font-semibold gap-4">
              {topPointsGreen.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://www.iehrdcouncil.com/images/hahr.jpg"
              alt="Hospital"
              className="rounded-lg shadow-md w-full max-w-sm md:max-w-full mx-auto"
            />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-black text-black-900 mb-6">
          Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresGreen.map((feature) => (
            <div
              key={feature.number}
              className="bg-white border border-green-300 rounded-xl p-6 shadow hover:shadow-md hover:border-green-500 transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#e8f4ed] text-black font-bold text-lg mb-4">
                {feature.number}
              </div>

              <h3 className="text-xl font-semibold text-black text-black-900 mb-2 gap-4">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-xl">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Blue Theme */}
      <div className="bg-[#e0f2ff] px-6 md:px-16 py-10 mt-10 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-12 max-w-7xl mx-auto">
          <div className="md:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold text-black text-black-900 mb-10">
              Advanced System Capabilities
            </h1>
            <ul className="list-disc list-inside text-black text-black-800 space-y-4 text-xl md:text-2xl leading-relaxed font-semibold gap-4">
              {topPointsBlue.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://www.perlove.net/wp-content/uploads/add693d369ed427ab4460953d03d8440.webp"
              alt="Hospital Extension"
              className="rounded-lg shadow-md w-full max-w-sm md:max-w-full mx-auto"
            />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-black text-black-900 mb-6">
          Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresBlue.map((feature) => (
            <div
              key={feature.number}
              className="bg-white border border-blue-300 rounded-xl p-6 shadow hover:shadow-md hover:border-blue-500 transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#e0f2ff] text-black font-bold text-lg mb-4">
                {feature.number}
              </div>
              <h3 className="text-xl font-semibold text-black text-black-900 mb-2 gap-4">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-xl">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
