import React, { useEffect, useState } from "react";
import { FaStethoscope, FaMapMarkerAlt, FaDirections,FaPhoneAlt,FaHospital } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
interface Doctor {
  doctorName: string;
  doctorEmail: string;
  doctorPhoneNumber: string;
  qualificationID: string;
  specializationID: string;
  hospitalID: string;
  experience?: number;
  contactNumber?: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
}

const SearchDoctors: React.FC = () => {
  const [doctorData, setDoctorData] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState<{ [key: string]: string }>({});
 
  const [hospitals, setHospitals] = useState<{ [key: string]: string }>({});
  const [selectedHospital, setSelectedHospital] = useState("");
  const navigate = useNavigate();

 

  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/Doctor")
      .then((response) => response.json())
      .then((data) => {
        setDoctorData(data.data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching doctor data:", error));

     
      fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Specializations")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const specMap = data.data.reduce((acc: { [key: string]: string }, spec: any) => {
            acc[spec.appLOVID] = spec.name;
            return acc;
          }, {});
          setSpecializations(specMap);
        }
      })
      .catch((error) => console.error("Error fetching Specializations:", error));
     
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(
          "https://predart003-001-site1.anytempurl.com/api/Hospital"
        );
        const result = await response.json();

        console.log("API Response:", result);

        if (Array.isArray(result)) {
          const hospitalMap = result.reduce((acc, hospital) => {
            acc[hospital.hospitalID] = hospital.hospitalName;
            return acc;
          }, {} as { [key: string]: string });

          setHospitals(hospitalMap);
        } else {
          console.error("Invalid hospital data format:", result);
          setHospitals({});
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };

    fetchHospitals();
  }, []);
  
  
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Doctor</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div>
          <input
            type="text"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Doctor Name"
          />
        </div>
        <div>
          <input
            type="text"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Doctor ID"
          />
        </div>
        <div>
        <select 
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary">
          <option value="">-- Select Specialization --</option>
          {Object.entries(specializations).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        </div>
        <div>
        <select
        id="hospital"
        value={selectedHospital}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        onChange={(e) => setSelectedHospital(e.target.value)}
      >
        <option value="">-- Select Hospital --</option>
        {Object.entries(hospitals).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
        </div>
        <div>
          <input
            type="text"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Location"
          />
        </div>
        <div>
        <button
          type="button"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
        >
          Search
        </button>
      </div>
      </form>
      <DoctorCard doctorData={doctorData} loading={loading} specializations={specializations} hospitals={hospitals} />
    </div>
  );
};

const DoctorCard = ({ doctorData, loading, specializations, hospitals }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
      {doctorData.length > 0 ? (
        doctorData.map((doctor, index) => (
          <DoctorCardItem key={index} doctor={doctor} loading={loading} specializations={specializations} hospitals={hospitals} />
        ))
      ) : (
        <p>No doctors found</p>
      )}
    </div>
  );
};

const DoctorCardItem = ({ doctor, loading, specializations, hospitals }) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate(); // Use navigate inside the component

  

  const handleBookNow = () => {
    navigate("/BookAppointment/BookAppoByDoctor", {
      state: {
        doctorName: doctor.doctorName,
        hospitalName: hospitals[doctor.hospitalID] || "Unknown",
      },
    });
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 
    transition-transform transform hover:scale-105 hover:shadow-lg">

{/* Doctor Name & Specialization */}
<h2 className="text-xl font-bold text-center text-gray-800 mb-2">
<FaStethoscope className="inline-block mr-2 text-blue-500" />
{doctor.doctorName} {loading ? "" : `(${specializations[doctor.specializationID] || "Unknown"})`}
</h2>

{/* Hospital Name with Icon */}
<div className="flex justify-center items-center text-orange-500 font-medium text-lg mb-2">
<FaHospital className="mr-2 text-orange-400" />
{hospitals[doctor.hospitalID] || "Unknown"}
</div>

{/* Location and View More in the Same Line */}
<div className="flex items-center justify-between mt-2">
<p className="flex items-center text-gray-700 font-medium">
  <FaMapMarkerAlt className="text-red-500 mr-2" /> Anna nagar, Chennai
</p>
<button 
  className="text-blue-300 hover:underline" 
  onClick={() => setShowMore(!showMore)}
>
  {showMore ? "View Less" : "View More"}
</button>
</div>

{/* Show more content */}
{showMore && (
<div className="mt-3">
  <p className="text-gray-600">Additional patient details can be shown here...</p>
</div>
)}

{/* Directions & Contact in the Same Line */}
<div className="mt-3 flex justify-between items-center">
<a  
  href="https://www.google.com/maps/search/Anna+nagar,+chennai" 
  target="_blank"
  rel="noopener noreferrer"
  className="text-green-500 hover:underline flex items-center"
>
  <FaDirections className="mr-1" /> Directions
</a>

{doctor.doctorPhoneNumber && (
  <a  
    href={`tel:${doctor.doctorPhoneNumber}`}
    className="text-blue-500 hover:underline flex items-center"
  >
    <FaPhoneAlt className="mr-1" /> Contact
  </a>
)}
</div>

 {/* Book Now Button */}
 <button 
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
        onClick={handleBookNow}
      >
        Book Now
      </button>
</div>
  );
};

export default SearchDoctors;
