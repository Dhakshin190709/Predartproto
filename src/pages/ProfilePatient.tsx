import React, { useEffect, useState } from "react";
import { useLocation ,useNavigate} from "react-router-dom";  // Import useLocation hook
import { User, Phone, Mail, Calendar, Ruler, Weight, Droplet } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";  // Importing Gender icons
import {  FaIdBadge, FaCreditCard } from 'react-icons/fa';

import Profile from '../images/icon/profile.svg';
import api from "../api/request";

interface BloodGroup {
  appLOVID: string;
  name: string;
}

interface PatientMedicalInfo {
  height: number;
  weight: number;
  bloodGroupID: string;
}

interface FamilyMember {
  name: string;
  height: number;
  weight: number;
  dateOfBirth: string;
  bloodGroupID: string;
  email: string;
  phoneNumber: string;
}

interface PatientInfoProps {}

const PatientProfileCard: React.FC<PatientInfoProps> = () => {
  const location = useLocation();  // Get the current location object
  const [medicalInfo, setMedicalInfo] = useState<PatientMedicalInfo | null>(null);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [basicInfo, setBasicInfo] = useState<any>(null);
 const [addresses, setAddresses] = useState([]);

  const patientID = location.state?.patientID;  // Access the patientID from location state
const navigate = useNavigate();
  const [address, setAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    district: "",
    state: "",
    zipCode: "",
    addressType: ""
  });

  const [openIndexes, setOpenIndexes] = useState([]);
 
   const toggleOpen = (index) => {
     setOpenIndexes((prev) =>
       prev.includes(index)
         ? prev.filter((i) => i !== index) // remove to collapse
         : [...prev, index] // add to expand
     );
   };
    const [openCards, setOpenCards] = useState({});
 
   const toggleCard = (index) => {
     setOpenCards((prev) => ({
       ...prev,
       [index]: !prev[index],
     }));
   };

useEffect(() => {
  if (!patientID) return;

  // Fetch basic patient info
 api.get(`/Patient/${patientID}`)
  .then(({ data: result }) => {
    if (result.success && result.data) {
      const {
        patientName,
        patientPhoneNumber,
        patientDateOfBirth,
        patientEmail,
        patientGender,
        uhid,           // add these keys
        cardNumber,     // or whatever the exact key is in your response
      } = result.data;

      setBasicInfo({
        name: patientName,
        phone: patientPhoneNumber,
        dob: patientDateOfBirth?.split("T")[0],
        email: patientEmail,
        gender: patientGender,
        uhid,           // add these to state
        cardNumber,
      });
    }
  })
  .catch(error => console.error("Error fetching patient data:", error));


  // Fetch medical information
  api.get(`/Patient/GetMedicalInformation`, { params: { PatientID: patientID } })
    .then(({ data: result }) => {
      if (result.success && result.data?.length > 0) {
        setMedicalInfo(result.data[0]);
      }
    })
    .catch(error => console.error('Error fetching medical info:', error));

  // Fetch blood group options
  api.get(`/AppLOV`, { params: { type: 'bloodGroup' } })
    .then(({ data: result }) => {
      if (result.success && result.data) {
        setBloodGroups(result.data);
      }
    })
    .catch(error => console.error('Error fetching blood groups:', error));

  // Fetch family info
  api.get(`/Patient/GetFamily`, { params: { PatientID: patientID } })
    .then(({ data: result }) => {
      if (result.success && Array.isArray(result.data)) {
        const uniqueMap = new Map();
        result.data.forEach((item) => {
          const key = `${item.name}-${item.phoneNumber}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });
        setFamily(Array.from(uniqueMap.values()));
      }
    })
    .catch(error => console.error("Error fetching family data:", error));

}, [patientID]);


 

useEffect(() => {
  const fetchAddress = async () => {
    const patientID = location.state?.patientID;
    if (!patientID) return;

    try {
      const { data: result } = await api.get('/Address/getaddress', {
        params: {
          id: patientID,
          Type: 'Patient',
        },
      });

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const address = result.data[0];
        setAddress({
          address1: address.address1 || "",
          address2: address.address2 || "",
          city: address.city || "",
          district: address.district || "",
          state: address.state || "",
          zipCode: address.zipCode || "",
          addressType: address.addressType || ""
        });
      }
    } catch (error) {
      console.error("Error fetching address data:", error);
    }
  };

  fetchAddress();
}, [location.state?.patientID]);


  const getBloodGroupNameById = (id: string) => {
    const group = bloodGroups.find((bg) => bg.appLOVID === id);
    return group ? group.name : "N/A";
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  };

  return (
     <div className="p-4 space-y-4">
    <h1 className="text-3xl font-semibold text-black mb-6">
      Patient Details
    </h1>
    <div className="w-full p-6 bg-white text-gray-900 rounded-xl shadow-lg space-y-8">
        <button
         className="mb-4 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200"

        onClick={() => navigate("/search/patient")}
      >
        &lt; Back
      </button>
      {/* Profile Section */}
       <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow-md border border-blue-300 w-full">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Profile Image */}
    <div className="flex flex-col items-center md:items-start md:w-1/4">
      <img
        src={Profile}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover border shadow"
      />
    </div>

    {/* Divider */}
    <div className="hidden md:block w-px bg-gray-300 mx-2" />

    {/* Profile Details */}
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-base text-gray-700">
      {/* Name */}
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-gray-600" />
        <p className="text-lg flex items-center gap-1">
          <strong>Name:</strong> {basicInfo?.name ?? 'N/A'}{' '}
          {basicInfo?.gender?.toLowerCase() === 'f' ||
          basicInfo?.gender?.toLowerCase() === 'female' ? (
            <span className="text-pink-500">
              ( <FaFemale className="inline w-4 h-4" /> )
            </span>
          ) : basicInfo?.gender?.toLowerCase() === 'm' ||
            basicInfo?.gender?.toLowerCase() === 'male' ? (
            <span className="text-blue-500">
              ( <FaMale className="inline w-4 h-4" /> )
            </span>
          ) : (
            <span className="text-gray-400">( N/A )</span>
          )}
        </p>
      </div>

      {/* DOB */}
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-gray-600" />
        <p className="text-lg">
          <strong>DOB:</strong> {formatDate(basicInfo?.dob ?? '')}
        </p>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-gray-600" />
        <p className="text-lg">
          <strong>Phone:</strong> {basicInfo?.phone ?? 'N/A'}
        </p>
      </div>

      {/* Email */}
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-gray-600" />
        <p className="text-lg">
          <strong>Email:</strong> {basicInfo?.email ?? 'N/A'}
        </p>
      </div>

      {/* UHID */}
      <div className="flex items-center gap-3">
        <FaIdBadge className="w-4 h-5 text-gray-200" />
        <p className="text-lg">
          <strong>UHID:</strong> {basicInfo?.uhid ?? 'N/A'}
        </p>
      </div>

    
    </div>
  </div>
</div>


        {/* Medical Info */}
        <div className="mt-6 p-5 bg-white border border-blue-200 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">
            Medical Information
          </h3>

          {medicalInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-800 text-base">
              <div className="flex items-center gap-3">
                <Ruler size={20} className="text-gray-600" />
                <span>
                  <strong>Height:</strong> {medicalInfo.height} cm
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Weight size={20} className="text-gray-600" />
                <span>
                  <strong>Weight:</strong> {medicalInfo.weight} kg
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Droplet size={20} className="text-gray-600" />
                <span>
                  <strong>Blood Group:</strong>{' '}
                  {getBloodGroupNameById(medicalInfo.bloodGroupID)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No Medical information available for this patient.
            </p>
          )}
        </div>

      {/* Family Info */}
         <div className="mt-8">
      <h3 className="text-2xl font-semibold text-blue-600 mb-6 flex items-center gap-2">
        Family Information
      </h3>

      {family.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {family.map((member, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={index}
                className="bg-white border border-blue-200 rounded-xl shadow-md"
              >
                {/* Header with toggle */}
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full flex justify-between items-center p-5 text-blue-500 font-bold text-xl rounded-t-xl focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <User size={18} className="text-gray-600" />
                    Member {index + 1}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={20} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                  )}
                </button>

                {/* Collapsible content */}
                {isOpen && (
                  <div className="p-5 space-y-4 text-gray-800 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <p className="text-lg truncate">
                        <User size={16} className="inline mr-2 text-gray-600" />
                        <strong>Name:</strong> {member.name}
                      </p>
                      <p className="text-lg truncate">
                        <Calendar size={16} className="inline mr-2 text-gray-600" />
                        <strong>DOB:</strong> {formatDate(member.dateOfBirth)}
                      </p>
                      <p className="text-lg truncate">
                        <Phone size={16} className="inline mr-2 text-gray-600" />
                        <strong>Phone:</strong> {member.phoneNumber}
                      </p>
                      <p className="text-lg truncate">
                        <Mail size={16} className="inline mr-2 text-gray-600" />
                        <strong>Email:</strong> {member.email}
                      </p>
                      <p className="text-lg truncate">
                        <Ruler size={16} className="inline mr-2 text-gray-600" />
                        <strong>Height:</strong> {member.height} cm
                      </p>
                      <p className="text-lg truncate">
                        <Weight size={16} className="inline mr-2 text-gray-600" />
                        <strong>Weight:</strong> {member.weight} kg
                      </p>
                      <p className="text-lg truncate">
                        <Droplet size={16} className="inline mr-2 text-gray-600" />
                        <strong>Blood Group:</strong> {getBloodGroupNameById(member.bloodGroupID)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          No family information available for this patient.
        </p>
      )}
    </div>

        {/* Addrss info */}

         <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
      {addresses.map((address, index) => (
        <div
          key={`${address.addressType}-${index}`}
          className="p-6 bg-white border border-blue-200 rounded-xl shadow-md w-full"
          style={{ minWidth: '400px' }}
        >
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCard(index)}>
            <h3 className="text-xl font-semibold text-blue-600 mb-3">
              {address.addressType ?? 'Address'} Address
            </h3>
            <button
              aria-label={openCards[index] ? 'Collapse' : 'Expand'}
              className="text-blue-600 font-bold text-xl select-none"
            >
              {openCards[index] ? '−' : '+'}
            </button>
          </div>

          {openCards[index] && (
            <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line mt-2">
              {[address.address1, address.address2].filter(Boolean).join(',\n')}
              {'\n'}
              {address.city && address.district
                ? `${address.city}, ${address.district}`
                : address.city || address.district}
              {'\n'}
              {address.state && address.zipCode
                ? `${address.state} - ${address.zipCode}`
                : address.state || address.zipCode}
            </div>
          )}
        </div>
      ))}
    </div>
      
    </div>
    </div>
  );
};

export default PatientProfileCard;