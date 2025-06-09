// // components/ChooseDoccureSection.tsx

// import React from 'react';
// import HospitalCards from '../Search/SearchHospital';

// const features = [
//   { icon: '❤️', title: 'Personalized Health Care' },
//   { icon: '🌍', title: 'World-Leading Experts For Your Care' },
//   { icon: '🩺', title: 'Regular Check Up Of Your Heart' },
//   { icon: '🧠', title: 'Treatment For Complex Conditions' },
//   { icon: '🔬', title: 'Minimally Invasive Procedures' },
// ];

// const Hospitals: React.FC = () => {
//   return (
//     <div className="bg-blue-500 text-white py-10 px-5">
//       <h2 className="text-2xl font-bold text-center mb-8">
//         Why Choose Doccure?
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 justify-items-center">
//         {features.map((feature, index) => (
//           <div
//             key={index}
//             className="bg-blue-400 hover:bg-blue-600 transition-colors rounded-xl p-4 w-full max-w-xs text-center"
//           >
//             <div className="text-3xl mb-2">{feature.icon}</div>
//             <p className="font-semibold text-sm">{feature.title}</p>
//           </div>
//         ))}
//       </div>

//       {/* CTA Section */}
//       <div className="bg-black text-white rounded-xl mt-10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
//         <div className="md:w-2/3">
//           <h3 className="text-xl font-bold mb-2">
//             Don't Make Delay on your Life
//           </h3>
//           <p className="mb-4 text-sm">Book An Appointment Today</p>
//           <p className="text-sm mb-4">
//             If you have a primary care physician, you can reach out to their
//             office and explain that you would like to see a cardiologist. They
//             can typically provide referrals and help you schedule an
//             appointment.
//           </p>
//           <div className="flex gap-4 mb-4">
//             <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
//               Start a Consult
//             </button>
//             <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg">
//               Click Our Plan
//             </button>
//           </div>
//           <input
//             type="text"
//             placeholder="Enter Hospital Name"
//             className="w-full md:w-2/3 px-4 py-2 rounded-lg text-black"
//           />
//         </div>
//         <div className="md:w-1/3">
//           <img
//             src="https://cdn.pixabay.com/photo/2021/01/18/15/54/heart-5927442_1280.png"
//             alt="Heart Image"
//             className="w-full h-auto rounded-xl shadow-lg"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hospitals;

























// import React from 'react';
// import {
//   FaHeart,
//   FaUserMd,
//   FaHeartbeat,
//   FaProcedures,
//   FaSyringe,
// } from 'react-icons/fa';

// const Hospitals: React.FC = () => {
//   return (
//     <div className="relative bg-[#1792f3] pb-32 text-white">
//       {/* Heartbeat Background */}
//       <div className="absolute inset-0 opacity-10 z-0">
//         <svg
//           viewBox="0 0 1440 320"
//           className="w-full h-full"
//           preserveAspectRatio="none"
//         >
//           <path
//             fill="white"
//             fillOpacity="1"
//             d="M0,160 L80,160 L120,240 L160,80 L200,160 L240,160 L280,240 L320,80 L360,160 L400,160 L440,240 L480,80 L520,160 L560,160 L600,240 L640,80 L680,160 L720,160 L760,240 L800,80 L840,160 L880,160 L920,240 L960,80 L1000,160 L1040,160 L1080,240 L1120,80 L1160,160 L1200,160 L1240,240 L1280,80 L1320,160 L1360,160 L1400,240 L1440,80 L1440,320 L0,320 Z"
//           />
//         </svg>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 text-center py-10">
//         <h2 className="text-3xl font-bold">Why Choose Doccure?</h2>
//       </div>

//       {/* Icon Boxes */}
//       <div className="relative z-10 flex flex-wrap justify-center gap-6 px-4">
//         {[
//           { icon: <FaHeart />, title: 'Personalized Health Care' },
//           { icon: <FaUserMd />, title: 'World-Leading Experts For Your Care' },
//           { icon: <FaHeartbeat />, title: 'Regular Check Up Of Your Heart' },
//           { icon: <FaProcedures />, title: 'Treatment For Complex Conditions' },
//           { icon: <FaSyringe />, title: 'Minimally Invasive Procedures' },
//         ].map((item, index) => (
//           <div
//             key={index}
//             className="bg-white text-black w-64 p-6 rounded-lg shadow-md text-center hover:scale-105 transition-transform duration-300"
//           >
//             <div className="text-3xl mb-4 text-[#1792f3]">{item.icon}</div>
//             <h3 className="font-semibold">{item.title}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Overlapping Consultation Box */}
//       <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-20 w-[90%] md:w-[80%] bg-gradient-to-r from-black via-gray-800 to-black rounded-xl shadow-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 z-20">
//         <div className="text-white max-w-lg">
//           <h3 className="text-2xl font-bold mb-2">
//             Don’t Make Delay on your Life
//           </h3>
//           <p className="mb-4">
//             <strong>Book An Appointment Today</strong>
//             <br />
//             If you have a primary care physician, you can reach out to their
//             office and explain that you would like to see a cardiologist. They
//             can typically provide referrals and help you schedule an
//             appointment.
//           </p>
//           <div className="flex gap-4 flex-wrap">
//             <button className="bg-[#1792f3] text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-600 transition">
//               Start a Consult
//             </button>
//             <button className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-300 transition">
//               Click Our Plan
//             </button>
//           </div>
//         </div>
//         <div className="md:w-1/3">
//           <img
//             src="https://cdn.pixabay.com/photo/2018/02/24/20/39/heart-3170636_960_720.jpg"
//             alt="Heart"
//             className="rounded-lg shadow-lg w-full object-cover"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hospitals;


































import React from 'react';
// import HospitalCards from '../Search/SearchHospital';

const features = [
  { icon: '❤️', title: 'Personalized Health Care' },
  { icon: '🌍', title: 'World-Leading Experts For Your Care' },
  { icon: '🩺', title: 'Regular Check Up Of Your Heart' },
  { icon: '🧠', title: 'Treatment For Complex Conditions' },
  { icon: '🔬', title: 'Minimally Invasive Procedures' },
];

const Hospitals: React.FC = () => {
  return (
    <div id="Find Hospitals" className="relative">
      {/* Blue Section */}
      <div className="relative bg-blue-100 text-black py-10 px-5 pb-32">
        <h2 className="text-black text-center text-4xl mb-8 mt-10">
          Find Hospitals
        </h2>
        <p className="text-black mt-3 mb-10 text-center">
          Rated 5 Stars by Our Patients | PreCare Delivers Trust & Care
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 justify-items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-200 hover:bg-blue-300 transition-colors rounded-xl p-4 w-full max-w-xs text-center"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="font-semibold text-sm">{feature.title}</p>
            </div>
          ))}
        </div>

        {/* Black CTA Overlapping Box */}
        <div className="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-[30%] w-[90%] bg-slate-200 text-black rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl z-10">
          <div className="md:w-2/3 md:pl-10">
            <h3 className="text-xl font-bold mb-2">
              Don't Make Delay on your Life
            </h3>
            <p className="mb-4 text-sm">Book An Appointment Today</p>
            <p className="text-sm mb-4">
              Trusted care starts here. Choose PreCare for your wellness
              journey.
            </p>
            <input
              type="text"
              placeholder="Enter Hospital Name"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="md:w-1/3">
            <img
              src="https://t3.ftcdn.net/jpg/08/45/41/94/360_F_845419483_7VWsdIADOMpahPVeTNi42kj8OEXg1yfG.jpg"
              alt="Heart Image"
              className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
