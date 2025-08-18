// import React, { useState } from 'react';
// import {
//   FaCheckCircle,
//   FaPhoneAlt,
// } from 'react-icons/fa';

// interface Doctor {
//   name: string;
//   gender: string;
//   specialty: string;
//   experience: number;
//   location: string;
//   hospital: string;
//   fee: number;
//   rating: number;
//   patientStories: number;
//   available: boolean;
//   imageUrl?: string;
// }

// const doctors: Doctor[] = [
//   {
//     name: 'Dr. Rakhi Sircar',
//     gender: 'Female',
//     specialty: 'Dermatologist',
//     experience: 32,
//     location: 'Hulimavu, Bangalore',
//     hospital: 'Nano Hospitals + 2 more',
//     fee: 500,
//     rating: 98,
//     patientStories: 43,
//     available: true,
//     imageUrl:
//       'https://img.freepik.com/premium-photo/beautiful-young-asian-girl-doctor-with-notebook-records-isolated-blue-background-medical-student-general-practitioner-concept-medical-education-india_185696-394.jpg',
//   },
//   {
//     name: 'Dr. Arun Mehta',
//     gender: 'Male',
//     specialty: 'Dermatologist',
//     experience: 25,
//     location: 'Indiranagar, Bangalore',
//     hospital: 'Apollo Clinic',
//     fee: 600,
//     rating: 95,
//     patientStories: 0,
//     available: false,
//     imageUrl:
//       'https://t4.ftcdn.net/jpg/07/07/89/33/360_F_707893394_5DEhlBjWOmse1nyu0rC9T7ZRvsAFDkYC.jpg',
//   },
// ];

// const Dermatologist: React.FC = () => {
//   const [sortBy, setSortBy] = useState('Relevance');
//   const [selectedGender, setSelectedGender] = useState('Gender');
//   const [selectedExperience, setSelectedExperience] = useState('Experience');
//   const [showStoriesOnly, setShowStoriesOnly] = useState(false);
//   const [allFiltersOpen, setAllFiltersOpen] = useState(false);
//   const [availabilityFilter, setAvailabilityFilter] = useState(false);
//   const [minRating, setMinRating] = useState(0);
//   const [maxFee, setMaxFee] = useState<number | null>(null);

//   let filteredDoctors = doctors.filter((doctor) => {
//     const genderMatch =
//       selectedGender === 'Gender' || doctor.gender === selectedGender;
//     const experienceMatch =
//       selectedExperience === 'Experience' ||
//       doctor.experience >= parseInt(selectedExperience);
//     const availabilityMatch = availabilityFilter ? doctor.available : true;
//     const ratingMatch = doctor.rating >= minRating;
//     const feeMatch = maxFee !== null ? doctor.fee <= maxFee : true;
//     return (
//       genderMatch &&
//       experienceMatch &&
//       availabilityMatch &&
//       ratingMatch &&
//       feeMatch
//     );
//   });

//   if (showStoriesOnly) {
//     filteredDoctors = filteredDoctors.filter((doc) => doc.patientStories > 0);
//   }

//   filteredDoctors = [...filteredDoctors].sort((a, b) => {
//     switch (sortBy) {
//       case 'Experience':
//         return b.experience - a.experience;
//       case 'Fee Low to High':
//         return a.fee - b.fee;
//       case 'Fee High to Low':
//         return b.fee - a.fee;
//       default:
//         return 0;
//     }
//   });

//   return (
//     <div className="max-w-7xl mx-auto mt-8">
//       {/* Filters Section */}
//       <div className="flex flex-wrap gap-3 justify-between bg-blue-200 text-white p-3 rounded-md relative z-10">
//         <select
//           value={selectedGender}
//           onChange={(e) => setSelectedGender(e.target.value)}
//           className="bg-blue-200 text-black px-3 py-1 rounded-md"
//         >
//           <option>Gender</option>
//           <option>Male</option>
//           <option>Female</option>
//         </select>

//         <select
//           value={selectedExperience}
//           onChange={(e) => setSelectedExperience(e.target.value)}
//           className="bg-blue-200 text-black px-3 py-1 rounded-md "
//         >
//           <option>Experience</option>
//           {Array.from({ length: 40 }, (_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {i + 1} years
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={() => setShowStoriesOnly(!showStoriesOnly)}
//           className="bg-blue-200 text-black px-3 py-1 rounded-md "
//         >
//           {showStoriesOnly ? 'All Doctors' : 'Patient Stories'}
//         </button>

//         <button
//           onClick={() => setAllFiltersOpen(!allFiltersOpen)}
//           className=" bg-blue-200 text-black px-3 py-1 rounded-md"
//         >
//           All Filters
//         </button>

//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="bg-blue-200 text-black px-3 py-1 rounded-md"
//         >
//           <option>Relevance</option>
//           <option>Experience</option>
//           <option>Fee Low to High</option>
//           <option>Fee High to Low</option>
//         </select>
//       </div>

//       {allFiltersOpen && (
//         <div className="bg-white border border-gray-300 p-4 rounded-md mt-2">
//           <label className="block mb-2">
//             <input
//               type="checkbox"
//               checked={availabilityFilter}
//               onChange={() => setAvailabilityFilter(!availabilityFilter)}
//               className="mr-2"
//             />
//             Show Available Only
//           </label>
//           <label className="block mb-2">
//             Min Rating:
//             <input
//               type="number"
//               min={0}
//               max={100}
//               value={minRating}
//               onChange={(e) => setMinRating(parseInt(e.target.value))}
//               className="ml-2 border px-2 py-1 rounded-md"
//             />
//           </label>
//           <label className="block">
//             Max Fee:
//             <input
//               type="number"
//               value={maxFee ?? ''}
//               onChange={(e) =>
//                 setMaxFee(e.target.value ? parseInt(e.target.value) : null)
//               }
//               className="ml-2 border px-2 py-1 rounded-md"
//             />
//           </label>
//         </div>
//       )}

//       {/* Result Count */}
//       <h2 className="text-lg font-semibold mt-4">
//         {filteredDoctors.length} Dermatologist
//         {filteredDoctors.length !== 1 && 's'} available
//         {filteredDoctors.length > 0 &&
//           ` in ${filteredDoctors[0].location.split(', ').pop()}`}
//       </h2>

//       <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
//         <FaCheckCircle className="text-green-600" />
//         <span>
//           Book appointments with minimum wait-time & verified doctor details
//         </span>
//       </div>

//       {filteredDoctors.length === 0 && (
//         <p className="text-center text-gray-600 mt-10">
//           No doctors match your filters.
//         </p>
//       )}

//       {/* Doctor Cards */}
//       {filteredDoctors.map((doctor, index) => (
//         <div
//           key={index}
//           className="px-6 pt-6 pb-8 bg-white rounded-xl shadow-[0_6px_10px_-2px_rgba(0,0,0,0.1)] border border-blue-300 mt-8"
//         >
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
//             <div className="flex items-center w-full md:w-2/3 gap-5">
//               <img
//                 src={doctor.imageUrl || 'https://via.placeholder.com/100'}
//                 alt="Doctor"
//                 className="w-24 h-24 rounded-full object-cover"
//               />
//               <div className="space-y-1">
//                 <h2 className="text-xl font-bold text-blue-600">
//                   {doctor.name}
//                 </h2>
//                 <p className="text-gray-600">{doctor.specialty}</p>
//                 <p className="text-sm text-gray-500">
//                   {doctor.experience} years experience overall
//                 </p>
//                 <p className="text-sm text-gray-600 font-semibold">
//                   {doctor.location}
//                 </p>
//                 <div className="flex flex-wrap items-center gap-2">
//                   <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded">
//                     Practo Assured
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     {doctor.hospital}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   ₹{doctor.fee} Consultation fee at clinic
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
//                     {doctor.rating}%
//                   </span>
//                   <span className="text-blue-600 text-sm underline">
//                     {doctor.patientStories} Patient Stories
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col items-center w-full md:w-1/3 gap-4">
//               <div className="flex items-center text-green-600 font-semibold text-sm">
//                 {doctor.available ? (
//                   <>
//                     <FaCheckCircle className="mr-2" />
//                     Available Today
//                   </>
//                 ) : (
//                   <span className="text-red-500">Not Available</span>
//                 )}
//               </div>
//               <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-3/4 text-center">
//                 <div className="flex flex-col items-center leading-tight">
//                   <span className="text-sm font-semibold">
//                     Book Clinic Visit
//                   </span>
//                   <span className="text-xs text-gray-100 font-normal">
//                     No Booking Fee
//                   </span>
//                 </div>
//               </button>
//               <button className="border border-gray-400 hover:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-md w-3/4 flex items-center justify-center">
//                 <FaPhoneAlt className="mr-2" />
//                 Contact Hospital
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Dermatologist;



































import React, { useState } from 'react';
import { FaCheckCircle, FaPhoneAlt } from 'react-icons/fa';

interface Doctor {
  name: string;
  gender: string;
  specialty: string;
  experience: number;
  location: string;
  hospital: string;
  fee: number;
  rating: number;
  patientStories: number;
  available: boolean;
  imageUrl?: string;
}

const doctors: Doctor[] = [
  {
    name: 'Dr. Rakhi Sircar',
    gender: 'Female',
    specialty: 'Dermatologist',
    experience: 32,
    location: 'Hulimavu, Bangalore',
    hospital: 'Nano Hospitals + 2 more',
    fee: 500,
    rating: 98,
    patientStories: 43,
    available: true,
    imageUrl:
      'https://img.freepik.com/premium-photo/beautiful-young-asian-girl-doctor-with-notebook-records-isolated-blue-background-medical-student-general-practitioner-concept-medical-education-india_185696-394.jpg',
  },
  {
    name: 'Dr. Arun Mehta',
    gender: 'Male',
    specialty: 'Dermatologist',
    experience: 25,
    location: 'Indiranagar, Bangalore',
    hospital: 'Apollo Clinic',
    fee: 600,
    rating: 95,
    patientStories: 0,
    available: false,
    imageUrl:
      'https://t4.ftcdn.net/jpg/07/07/89/33/360_F_707893394_5DEhlBjWOmse1nyu0rC9T7ZRvsAFDkYC.jpg',
  },
];

const Dermatologist: React.FC = () => {
  const [sortBy, setSortBy] = useState('Relevance');
  const [selectedGender, setSelectedGender] = useState('Gender');
  const [selectedExperience, setSelectedExperience] = useState('Experience');
  const [showStoriesOnly, setShowStoriesOnly] = useState(false);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxFee, setMaxFee] = useState<number | null>(null);

  let filteredDoctors = doctors.filter((doctor) => {
    const genderMatch =
      selectedGender === 'Gender' || doctor.gender === selectedGender;
    const experienceMatch =
      selectedExperience === 'Experience' ||
      doctor.experience >= parseInt(selectedExperience);
    const availabilityMatch = availabilityFilter ? doctor.available : true;
    const ratingMatch = doctor.rating >= minRating;
    const feeMatch = maxFee !== null ? doctor.fee <= maxFee : true;
    return (
      genderMatch &&
      experienceMatch &&
      availabilityMatch &&
      ratingMatch &&
      feeMatch
    );
  });

  if (showStoriesOnly) {
    filteredDoctors = filteredDoctors.filter((doc) => doc.patientStories > 0);
  }

  filteredDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'Experience':
        return b.experience - a.experience;
      case 'Fee Low to High':
        return a.fee - b.fee;
      case 'Fee High to Low':
        return b.fee - a.fee;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Filters Section */}
      <div className="flex flex-wrap gap-3 justify-between bg-blue-200 text-white p-3 rounded-md relative z-10">
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="bg-blue-200 text-black px-3 py-1 rounded-md"
        >
          <option>Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <select
          value={selectedExperience}
          onChange={(e) => setSelectedExperience(e.target.value)}
          className="bg-blue-200 text-black px-3 py-1 rounded-md "
        >
          <option>Experience</option>
          {Array.from({ length: 40 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} years
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowStoriesOnly(!showStoriesOnly)}
          className="bg-blue-200 text-black px-3 py-1 rounded-md "
        >
          {showStoriesOnly ? 'All Doctors' : 'Patient Stories'}
        </button>

        <button
          onClick={() => setAllFiltersOpen(!allFiltersOpen)}
          className=" bg-blue-200 text-black px-3 py-1 rounded-md"
        >
          All Filters
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-blue-200 text-black px-3 py-1 rounded-md"
        >
          <option>Relevance</option>
          <option>Experience</option>
          <option>Fee Low to High</option>
          <option>Fee High to Low</option>
        </select>
      </div>

      {allFiltersOpen && (
        <div className="bg-white border border-gray-300 p-4 rounded-md mt-2">
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={availabilityFilter}
              onChange={() => setAvailabilityFilter(!availabilityFilter)}
              className="mr-2"
            />
            Show Available Only
          </label>
          <label className="block mb-2">
            Min Rating:
            <input
              type="number"
              min={0}
              max={100}
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value))}
              className="ml-2 border px-2 py-1 rounded-md"
            />
          </label>
          <label className="block">
            Max Fee:
            <input
              type="number"
              value={maxFee ?? ''}
              onChange={(e) =>
                setMaxFee(e.target.value ? parseInt(e.target.value) : null)
              }
              className="ml-2 border px-2 py-1 rounded-md"
            />
          </label>
        </div>
      )}

      {/* Result Count */}
      <h2 className="text-lg font-semibold mt-4">
        {filteredDoctors.length} Dermatologist
        {filteredDoctors.length !== 1 && 's'} available
        {filteredDoctors.length > 0 &&
          ` in ${filteredDoctors[0].location.split(', ').pop()}`}
      </h2>

      <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
        <FaCheckCircle className="text-green-600" />
        <span>
          Book appointments with minimum wait-time & verified doctor details
        </span>
      </div>

      {filteredDoctors.length === 0 && (
        <p className="text-center text-gray-600 mt-10">
          No doctors match your filters.
        </p>
      )}

      {/* Doctor Cards */}
      {filteredDoctors.map((doctor, index) => (
        <div
          key={index}
          className="px-6 pt-6 pb-8 bg-white rounded-xl shadow-[0_6px_10px_-2px_rgba(0,0,0,0.1)] border border-blue-300 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-blue-300 gap-10">
            <div className="flex items-center w-full md:w-2/3 gap-5">
              <img
                src={doctor.imageUrl || 'https://via.placeholder.com/100'}
                alt="Doctor"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-blue-600">
                  {doctor.name}
                </h2>
                <p className="text-gray-600">{doctor.specialty}</p>
                <p className="text-sm text-gray-500">
                  {doctor.experience} years experience overall
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  {doctor.location}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded">
                    Practo Assured
                  </span>
                  <span className="text-sm text-gray-600">
                    {doctor.hospital}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  ₹{doctor.fee} Consultation fee at clinic
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    {doctor.rating}%
                  </span>
                  <span className="text-blue-600 text-sm underline">
                    {doctor.patientStories} Patient Stories
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-full md:w-1/3 gap-4">
              <div className="flex items-center text-green-600 font-semibold text-sm">
                {doctor.available ? (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Available Today
                  </>
                ) : (
                  <span className="text-red-500">Not Available</span>
                )}
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-3/4 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-semibold">
                    Book Clinic Visit
                  </span>
                  <span className="text-xs text-gray-100 font-normal">
                    No Booking Fee
                  </span>
                </div>
              </button>
              <button className="border border-gray-400 hover:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-md w-3/4 flex items-center justify-center">
                <FaPhoneAlt className="mr-2" />
                Contact Hospital
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dermatologist;


