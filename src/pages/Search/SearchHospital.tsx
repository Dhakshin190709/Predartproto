import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import {  FaMapMarkerAlt, FaEnvelope, FaPhone, FaDirections} from "react-icons/fa";
import { AiOutlineFieldTime } from "react-icons/ai";


import { FaLandmark, FaBuilding, FaHospital, FaClock, FaHospitalUser, FaPlusSquare } from "react-icons/fa";

const getHospitalIcon = (type) => {
  switch (type.toLowerCase()) {
    case "government":
      return <FaLandmark className="text-blue-500 text-2xl" />; // Town hall style for Government hospitals
    case "private":
      return <FaBuilding className="text-purple-500 text-2xl" />; // Office-style icon for Private hospitals
    case "clinic":
      return <FaHospital className="text-orange-500 text-2xl" />; // Standard hospital icon for Clinics
    case "24/7":
      return <FaClock className="text-green-500 text-2xl" />; // Clock icon for 24/7 hospitals
    case "multispeciality":
      return <FaPlusSquare className="text-red-500 text-2xl" />; // Medical cross icon for Multi-speciality hospitals
    default:
      return <FaHospitalUser className="text-blue-500 text-2xl" />; // Default hospital user icon
  }
};



const HospitalCards = () => {
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showFullAddress, setShowFullAddress] = useState({});
  const [formData, setFormData] = useState({ hospitalType: '' });

  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
      .then((response) => response.json())
      .then((data) => {
        const filteredTypes = data.data.filter((item) => item.type === "Hospital");
        setHospitalTypes(filteredTypes);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then(response => response.json())
      .then(data => {
        const hospitalData = data.data.map((hospital) => ({
          hospitalName: hospital.hospitalName,
          type: hospital.hospitalType,
          location: 'Anna nagar, Chennai', // Replace with actual location data
          email: 'hp@gmail.com', // Replace with actual email data
          is24x7: hospital.hospitalType.toLowerCase() === '24/7'
        }));
        setHospitals(hospitalData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const toggleAddress = (index) => {
    setShowFullAddress((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Hospital</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          id="location"
          className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none"
          placeholder="Enter Location"
        />
        <input
          type="text"
          id="hospitalName"
          className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none"
          placeholder="Enter Hospital Name"
        />
        <select
          id="hospitalType"
          name="hospitalType"
          value={formData.hospitalType}
          className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none"
          onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
          required
        >
          <option value="">Hospital Type</option>
          {hospitalTypes.length > 0 ? (
            hospitalTypes.map((type) => (
              <option key={type.appLOVID} value={type.name}>{type.name}</option>
            ))
          ) : (
            <option value="">No Hospital Types Available</option>
          )}
        </select>
        <input
          type="text"
          id="specialization"
          className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none"
          placeholder="Enter Specialization (e.g., Cardiology)"
        />
         <div className="flex justify-start mt-4">
          <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">
            Search
          </button>
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {hospitals.map((hospital, index) => (
          <div key={index}  className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 
          transition-transform transform hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getHospitalIcon(hospital.type)}
                <h2 className="ml-2 text-md font-semibold text-blue-800">{hospital.hospitalName} ({hospital.type})</h2>
              </div>
              {/* {hospital.is24x7 && <AiOutlineFieldTime   className="text-red-600 text-xl"/>} */}
            </div>
            <div className="text-gray-700 text-center mb-2">
              <FaMapMarkerAlt className="inline mr-1 text-red-200" />
              {showFullAddress[index] ? hospital.location : `${hospital.location.substring(0, 15)}...`}
              <button 
                className="text-blue-200 ml-2" 
                onClick={() => toggleAddress(index)}
              >
                {showFullAddress[index] ? "View Less" : "View More"}
              </button>
            </div>
            <div className="flex justify-center items-center gap-4 mt-2">
              <p className="text-blue-400">
                <FaEnvelope className="inline mr-1" />
                <a href={`mailto:${hospital.email}`} className="hover:underline">{hospital.email}</a>
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline flex items-center"
              >
                <FaDirections className="mr-1" /> Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalCards;
