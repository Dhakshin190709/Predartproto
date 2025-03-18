import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaPhoneAlt,FaGenderless, 
  FaEnvelope,FaMars, FaVenus,FaMapMarkerAlt, FaDirections} from "react-icons/fa";
interface RowData {
  id: number;
  patientName: string;
  patientId: string; // Appointment ID
  mobileNumber: string; // Mobile Number
  fromDate: string; // From Date
  toDate: string; // To Date
  patientDateOfBirth:number;
}

interface PatientData {
  patientName: string;
  patientGender: string;
  patientPhoneNumber: string;
  patientEmail: string;
  patientDateOfBirth:number;
}

const SearchPatient: React.FC = () => {
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [patientData, setPatientData] = useState<PatientData[]>([]); // Patient data for the new card section
  const [quickSearchText, setQuickSearchText] = useState(""); // For global search

  const [loading, setLoading] = useState<boolean>(true); // To manage loading state
  
const getGenderIcon = (gender: string) => {
  const lowerGender = gender.toLowerCase();

  if (lowerGender === "male" || lowerGender === "m") {
    return <FaMars className="text-blue-500 ml-1" />;
  } else if (lowerGender === "female" || lowerGender === "f") {
    return <FaVenus className="text-pink-500 ml-1" />;
  } else {
    return <FaGenderless className="text-black ml-1" />;
  }
};

const navigate = useNavigate(); // Hook for navigation

const handleBookNow = (patientName: string, phoneNumber: string) => {
  if (!patientName || !phoneNumber) {
    console.error("patientName or phoneNumber is not defined!");
    return;
  }
  navigate('/BookAppointment/BookAppoByPatient', { state: { patientName, phoneNumber } });
};



  // Function to calculate age from Date of Birth
  const calculateAge = (dob: string) => {
    if (!dob) return "N/A"; // If DOB is missing, return "N/A"
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} yrs`; // Return age in years
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Patient');
        const data = await response.json();
        if (data?.success && Array.isArray(data.data)) {
          setPatientData(data.data); // Set the patient data 
        } else {
          console.error('Unexpected response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false); // Set loading to false after the fetch is done
      }
    };

    if (patientData.length === 0) { // Fetch only if the data is not already fetched
      fetchPatientData();
    }

  }, [patientData.length]); // Only refetch if patientData is empty

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching
  }

  

  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter((row) =>
      row.patientName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.patientId.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.mobileNumber.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.fromDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
      row.toDate.toLowerCase().includes(quickSearchText.toLowerCase())
    );
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Patient</h1>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-col gap-4 mb-4">
        {/* First Row (Filter) */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Patient Id"
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
           
          />
          <input
            type="text"
            placeholder="Patient Name"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-[25%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
           <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} placeholder="From Date" 
        className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} 
        placeholder="To Date"  className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary" />
        </div>

        {/* Search Button */}
        <div className="flex justify-start mt-4">
          <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">
            Search
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
      {patientData.length > 0 ? (
        patientData.map((patient, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 
            transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            {/* Top Section: Profile Icon, Name, Gender Icon in Brackets */}
            <div className="flex items-center justify-between w-full">
  {/* Left Section: Icon, Name, and Gender */}
  <div className="flex items-center gap-2">
    <FaUserAlt className="text-blue-400 text-lg" />
    <h2 className="text-md font-semibold text-gray-800 flex items-center gap-1">
      {patient.patientName}
      <span className="text-gray-600">{getGenderIcon(patient.patientGender)}</span>
    </h2>
  </div>

  {/* Right Section: Age */}
  <span className="text-gray-600 font-medium text-sm">{calculateAge(patient.patientDateOfBirth)}</span>
</div>



            <hr className="my-3 border-blue-100" />

            {/* Phone with Icon (Clickable) */}
            <p className="flex items-center text-gray-700 font-medium">
              <a href={`tel:${patient.patientPhoneNumber}`} className="flex items-center hover:text-green-600 transition">
                <FaPhoneAlt className="text-green-400 mr-2" /> {patient.patientPhoneNumber}
              </a>
            </p>

            {/* Email with Icon (Clickable) */}
            <p className="flex items-center text-gray-700 font-medium">
              <a href={`mailto:${patient.patientEmail}`} className="flex items-center hover:text-orange-600 transition">
                <FaEnvelope className="text-orange-400 mr-2" /> {patient.patientEmail}
              </a>
            </p>

            {/* Hardcoded Location */}
            <p className="flex items-center text-gray-700 font-medium mt-2">
              <FaMapMarkerAlt className="text-red-500 mr-2" /> Anna nagar,chennai
            </p>

            {/* View More / View Less Toggle */}
            {expandedIndex === index ? (
              <div className="mt-3">
                <p className="text-gray-600">Additional patient details can be shown here...</p>
                <button 
                  className="text-blue-500 mt-2 hover:underline" 
                  onClick={() => toggleExpand(index)}
                >
                  View Less
                </button>
              </div>
            ) : (
              <button 
                className="text-blue-500 mt-2 hover:underline" 
                onClick={() => toggleExpand(index)}
              >
                View More
              </button>
            )}

            {/* Directions Button (Opens Google Maps) */}
           <div className="mt-3 flex items-center gap-4">
  {/* Directions Link */}
  <a  
    href="https://www.google.com/maps/search/Anna+nagar,+chennai" 
    target="_blank"
    rel="noopener noreferrer"
    className="text-green-500 hover:underline flex items-center"
  >
    <FaDirections className="mr-1" /> Directions
  </a>

  {/* Book Now Button (Aligned Right) */}
  <button
    onClick={() => handleBookNow(patient.patientName, patient.patientPhoneNumber)}
    className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition"
  >
    Book Now
  </button>
</div>




          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No patients found</p>
      )}
    </div>

    </div>
  );
};

export default SearchPatient;
