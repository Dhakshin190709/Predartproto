// import React from 'react';

// const features = [
//   { icon: '❤️', title: 'Personalized Health Care' },
//   { icon: '🌍', title: 'World-Leading Experts For Your Care' },
//   { icon: '🩺', title: 'Regular Check Up Of Your Heart' },
//   { icon: '🧠', title: 'Treatment For Complex Conditions' },
//   { icon: '🔬', title: 'Minimally Invasive Procedures' },
// ];

// const Hospitals: React.FC = () => {
//   return (
//     <div id="Find Hospitals" className="relative">
//       {/* Blue Section */}
//       <div className="relative bg-blue-100 text-black py-10 px-5 pb-32 mt-5">
//         <h2 className="text-black text-center text-4xl mb-8 mt-10">
//           Find Hospitals
//         </h2>
//         <p className="text-black mt-3 mb-10 text-center">
//           Rated 5 Stars by Our Patients | PreCare Delivers Trust & Care
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 justify-items-center">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="bg-blue-200 hover:bg-blue-300 transition-colors rounded-xl p-4 w-full max-w-xs text-center"
//             >
//               <div className="text-3xl mb-2">{feature.icon}</div>
//               <p className="font-semibold text-sm">{feature.title}</p>
//             </div>
//           ))}
//         </div>

//         {/* Black CTA Overlapping Box */}
//         <div className="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-[30%] w-[90%] bg-slate-200 text-black rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl z-10">
//           <div className="md:w-2/3 md:pl-10">
//             <h3 className="text-xl font-bold mb-2">
//               Don't Make Delay on your Life
//             </h3>
//             <p className="mb-4 text-sm">Book An Appointment Today</p>
//             <p className="text-sm mb-4">
//               Trusted care starts here. Choose PreCare for your wellness
//               journey.
//             </p>
//             <input
//               type="text"
//               placeholder="Enter Hospital Name"
//               className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             />
//           </div>
//           <div className="md:w-1/3">
//             <img
//               src="https://t3.ftcdn.net/jpg/08/45/41/94/360_F_845419483_7VWsdIADOMpahPVeTNi42kj8OEXg1yfG.jpg"
//               alt="Heart Image"
//               className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hospitals;











import React, { useEffect, useState } from 'react';
import api from '../../api/request'; // adjust the path if needed

const features = [
  { icon: '❤️', title: 'Personalized Health Care' },
  { icon: '🌍', title: 'World-Leading Experts For Your Care' },
  { icon: '🩺', title: 'Regular Check Up Of Your Heart' },
  { icon: '🧠', title: 'Treatment For Complex Conditions' },
  { icon: '🔬', title: 'Minimally Invasive Procedures' },
];

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<
    { hospitalID: string; hospitalName: string }[]
  >([]);
  const [selectedHospital, setSelectedHospital] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/Hospital/List');
        const data = res.data || []; // ✅ Use raw data array
        // Filter only active hospitals and retain original key names
        const activeHospitals = data
          .filter((h: any) => h.isActive)
          .map((h: any) => ({
            hospitalID: h.hospitalID,
            hospitalName: h.hospitalName,
          }));

        setHospitals(activeHospitals);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      }
    };

    fetchHospitals();
  }, []);

  return (
    <div id="Find Hospitals" className="relative">
      {/* Blue Section */}
      <div className="relative bg-blue-100 text-black py-10 px-5 pb-32 mt-5">
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

            {/* Dropdown to show hospital names */}
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
            >
              <option value="">Select Hospital</option>
              {hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <option key={hospital.hospitalID} value={hospital.hospitalID}>
                    {hospital.hospitalName}
                  </option>
                ))
              ) : (
                <option disabled>No hospitals available</option>
              )}
            </select>
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


