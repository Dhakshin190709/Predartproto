import React, { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Droplet,
} from 'lucide-react';
import { FaMale, FaFemale } from 'react-icons/fa'; // Importing Gender icons

import Profile from '../images/icon/profile.svg';
import api from '../api/request';

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
  const [medicalInfo, setMedicalInfo] = useState<PatientMedicalInfo | null>(
    null,
  );
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [basicInfo, setBasicInfo] = useState<any>(null);

  const patientID = sessionStorage.getItem('patientID');
  const [address, setAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
    addressType: '',
  });

  useEffect(() => {
    if (!patientID) return;

    const fetchData = async () => {
      try {
        // Fetch Patient Basic Info
        const patientRes = await api.get(`/Patient/${patientID}`);
        if (patientRes.data.success && patientRes.data.data) {
          const {
            patientName,
            patientPhoneNumber,
            patientDateOfBirth,
            patientEmail,
            patientGender,
          } = patientRes.data.data;
          console.log('Fetched Gender:', patientGender);
          setBasicInfo({
            name: patientName,
            phone: patientPhoneNumber,
            dob: patientDateOfBirth?.split('T')[0],
            email: patientEmail,
            gender: patientGender,
          });
        }

        // Fetch Medical Info
        const medicalRes = await api.get(`/Patient/GetMedicalInformation`, {
          params: { PatientID: patientID },
        });
        if (medicalRes.data.success && medicalRes.data.data?.length > 0) {
          setMedicalInfo(medicalRes.data.data[0]);
        }

        // Fetch Blood Groups
        const bloodGroupRes = await api.get(`/AppLOV`, {
          params: { type: 'bloodGroup' },
        });
        if (bloodGroupRes.data.success && bloodGroupRes.data.data) {
          setBloodGroups(bloodGroupRes.data.data);
        }

        // Fetch Family Data
        const familyRes = await api.get(`/Patient/GetFamily`, {
          params: { PatientID: patientID },
        });
        if (familyRes.data.success && Array.isArray(familyRes.data.data)) {
          const uniqueMap = new Map();
          familyRes.data.data.forEach((item) => {
            const key = `${item.name}-${item.phoneNumber}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          });
          setFamily(Array.from(uniqueMap.values()));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [patientID]);

  useEffect(() => {
    const fetchAddress = async () => {
      const patientID = sessionStorage.getItem('patientID');
      if (!patientID) return;

      try {
        const response = await api.get('/Address/getaddress', {
          params: { id: patientID, Type: 'Patient' },
        });

        const result = response.data;

        if (
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const address = result.data[0]; // Use the first address
          setAddress({
            address1: address.address1 || '',
            address2: address.address2 || '',
            city: address.city || '',
            district: address.district || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            addressType: address.addressType || '',
          });
        }
      } catch (error) {
        console.error('Error fetching address data:', error);
      }
    };

    fetchAddress();
  }, []);

  const getBloodGroupNameById = (id: string) => {
    const group = bloodGroups.find((bg) => bg.appLOVID === id);
    return group ? group.name : 'N/A';
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Patient Details
      </h1>
      <div className="w-full p-6 bg-white text-gray-900 rounded-xl shadow-lg space-y-8">
        {/* Profile Section */}
        <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow-md border border-blue-300">
          <div className="flex items-center justify-start space-x-4">
            <img
              src={Profile}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-white shadow-md"
            />
            <div>
              <h2 className="text-3xl font-semibold text-blue-900">
                {basicInfo?.name ?? 'N/A'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              <span className="text-lg">
                <strong>DOB:</strong> {formatDate(basicInfo?.dob ?? '')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-600" size={20} />
              <span className="text-lg">
                <strong>Phone:</strong> {basicInfo?.phone ?? 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-blue-600" size={20} />
              <span className="text-lg">
                <strong>Email:</strong> {basicInfo?.email ?? 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {basicInfo?.gender === 'Female' ? (
                <FaFemale className="text-blue-600" size={20} />
              ) : (
                <FaMale className="text-blue-600" size={20} />
              )}
              <span className="text-lg">
                <strong>Gender:</strong> {basicInfo?.gender ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="mt-6 p-5 bg-white border border-blue-200 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-green-800 mb-6 flex items-center">
            <Droplet className="mr-3 text-red-600" size={22} />
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
          <h3 className="text-2xl font-semibold text-purple-800 mb-6 flex items-center gap-2">
            <User className="text-purple-600" size={20} />
            Family Information
          </h3>

          {family.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {family.map((member, index) => (
                <div
                  key={index}
                  className="p-5 bg-white border border-blue-200 rounded-xl shadow-md space-y-4"
                >
                  <h4 className="text-xl font-bold text-pink-700 flex items-center gap-2">
                    <User size={18} className="text-gray-600" />
                    Member {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p className="text-lg text-gray-800 truncate">
                      <User size={16} className="inline mr-2 text-gray-600" />
                      <strong>Name:</strong> {member.name}
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Calendar
                        size={16}
                        className="inline mr-2 text-gray-600"
                      />
                      <strong>DOB:</strong> {formatDate(member.dateOfBirth)}
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Phone size={16} className="inline mr-2 text-gray-600" />
                      <strong>Phone:</strong> {member.phoneNumber}
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Mail size={16} className="inline mr-2 text-gray-600" />
                      <strong>Email:</strong> {member.email}
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Ruler size={16} className="inline mr-2 text-gray-600" />
                      <strong>Height:</strong> {member.height} cm
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Weight size={16} className="inline mr-2 text-gray-600" />
                      <strong>Weight:</strong> {member.weight} kg
                    </p>
                    <p className="text-lg text-gray-800 truncate">
                      <Droplet
                        size={16}
                        className="inline mr-2 text-gray-600"
                      />
                      <strong>Blood Group:</strong>{' '}
                      {getBloodGroupNameById(member.bloodGroupID)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No family information available for this patient.
            </p>
          )}
        </div>

        {/* Addrss info */}

        <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-lg max-w-md mx-auto my-6 hover:shadow-2xl transition-all duration-300 ease-in-out">
          <h3 className="text-2xl text-blue-300 text-center mb-4 flex items-center justify-center font-bold">
            <i className="fas fa-map-marker-alt mr-2 text-blue-300"></i> Patient
            Address
          </h3>

          <div className="text-base text-gray-700 space-y-2">
            {[
              {
                icon: 'fa-id-card',
                label: 'Address Type',
                value: address.addressType,
              },
              { icon: 'fa-home', label: 'Address 1', value: address.address1 },
              { icon: 'fa-home', label: 'Address 2', value: address.address2 },
              { icon: 'fa-city', label: 'City', value: address.city },
              {
                icon: 'fa-building',
                label: 'District',
                value: address.district,
              },
              { icon: 'fa-map-signs', label: 'State', value: address.state },
              {
                icon: 'fa-code-branch',
                label: 'Zip Code',
                value: address.zipCode,
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[140px_10px_1fr] items-center"
              >
                <div className="flex items-center text-gray-800 font-semibold">
                  <i className={`fas ${icon} mr-2 text-gray-400`}></i>
                  {label}
                </div>
                <div className="text-center">:</div>
                <div className="text-gray-700 ml-3">{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileCard;
