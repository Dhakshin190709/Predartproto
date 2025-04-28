import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import DoctorIcon from '../../images/icon/Surgeon medicine doctor physician.svg';
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaHospital,
  FaPhoneAlt,
  FaMars,
  FaVenus,
} from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (1).svg';
import ClockIcon from '../../images/icon/Clock (2).svg';

import HospitalIcon from '../../images/icon/Hospital solid (1).svg';
import { CalendarCheck } from 'lucide-react';

interface Appointment {
  appointmentID: string;
  doctorID: string;
  doctorName: string;
  doctorPhoneNumber: string;
  doctorEmail: string;
  patientID: string;
  patientName: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientPhoneNumberNumber: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  phoneNumber: string;
  hospitalName: string;
  hospitalID: string;
  notes: string;
  isActive: boolean;
}

interface Patient {
  patientID: string;
  patientName: string;
  patientPhoneNumberNumber: string;
  patientDateOfBirth: string;
  patientGender: string;
}

interface Doctor {
  doctorID: string;
  doctorName: string;
  hospitalID: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
  hospitalPhoneNumber?: string;
}

const SearchAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedPatientID, setSelectedPatientID] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [selectedDoctorID, setSelectedDoctorID] = useState<string>('');
  const navigate = useNavigate();
  const [selectedHospitalID, setSelectedHospitalID] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/Patient',
        );
        if (Array.isArray(response.data.data)) {
          setPatients(response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedHospitalID) {
      fetch(
        `https://predart003-001-site1.anytempurl.com/api/Doctor?hospitalId=${selectedHospitalID}`,
      )
        .then((response) => response.json())
        .then((data) => setDoctors(data.data || []))
        .catch((error) => console.error('Error fetching doctors:', error));
    }
  }, [selectedHospitalID]);

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        // Filter only active hospitals
        const activeHospitals = data.filter((hospital) => hospital.isActive);
        setHospitals(activeHospitals);
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);

  const fetchAppointmentsForUser = async () => {
    const roleNameRaw = sessionStorage.getItem('roleName');
    const roleName = roleNameRaw?.toLowerCase();
    const patientID = sessionStorage.getItem('patientID');
    const doctorID = sessionStorage.getItem('doctorID');
    const unitID = sessionStorage.getItem('unitID');

    let appointmentURL =
      'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment';

    if (roleName === 'patient' && patientID) {
      appointmentURL += `?PatientID=${patientID}`;
    } else if (roleName === 'doctor' && doctorID) {
      appointmentURL += `?DoctorID=${doctorID}`;
    } else if (roleName === 'reception' && unitID) {
      appointmentURL += `?UnitID=${unitID}`;
    }

    try {
      const response = await axios.get(appointmentURL);
      const fetchedAppointments = response.data;

      if (roleName === 'patient' && patientID) {
        setAppointments(
          fetchedAppointments.filter((a) => a.patientID === patientID),
        );
      } else if (roleName === 'doctor' && doctorID) {
        setAppointments(
          fetchedAppointments.filter((a) => a.doctorID === doctorID),
        );
      } else if (roleName === 'reception' && unitID) {
        setAppointments(
          fetchedAppointments.filter((a) => a.hospitalID === unitID),
        );
      } else {
        setAppointments(fetchedAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointmentsForUser();
  }, []);
  const handleDoctorChange = (event) => {
    setSelectedDoctorID(event.target.value);
  };

  const getAgeFromDOB = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getPatientAge = (dob: string) => {
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName')?.toLowerCase();
    setRoleName(storedRole || '');
  }, []);

  const handleSearch = async () => {
    const roleName = sessionStorage.getItem('roleName')?.toLowerCase() || '';
    const patientID =
      roleName === 'patient'
        ? sessionStorage.getItem('patientID')
        : selectedPatientID;
  
    const patientName = sessionStorage.getItem('patientName') || '';
    const doctorID = roleName === 'doctor' ? sessionStorage.getItem('doctorID') || '' : '';
    const unitID = roleName === 'doctor' ? sessionStorage.getItem('unitID') || '' : '';
  
    // ✅ For patient role, use selected values (not sessionStorage)
    // selectedHospitalID and selectedDoctorID must come from state
    if (
      !startDate &&
      !endDate &&
      !roleName &&
      !doctorID &&
      !patientID &&
      !patientName
    ) {
      fetchAppointmentsForUser();
      return;
    }
  
    if (!patientID && roleName !== 'doctor') {
      alert('No patient selected');
      return;
    }
  
    const baseUrl = 'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment';
    const params = new URLSearchParams();
  
    if (patientID) params.append('PatientID', patientID);
  
    if (roleName === 'doctor') {
      if (unitID) params.append('HospitalID', unitID);
      if (doctorID) params.append('DoctorID', doctorID);
    }
  
    if (roleName === 'patient') {
      if (selectedHospitalID) params.append('HospitalID', selectedHospitalID);
      if (selectedDoctorID) params.append('DoctorID', selectedDoctorID);
    }
  
    // ✅ Apply date filtering for ALL roles now
    const formatDateToLocalISOString = (dateString, isStart) => {
      const date = new Date(dateString);
      date.setHours(isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59, isStart ? 0 : 999);
  
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
  
    if (startDate) params.append('StartDate', formatDateToLocalISOString(startDate, true));
    if (endDate) params.append('EndDate', formatDateToLocalISOString(endDate, false));
  
    if ((roleName === 'doctor' || roleName === 'reception') && patientName) {
      params.append('PatientName', patientName);
    }
  
    const url = `${baseUrl}?${params.toString()}`;
  
    try {
      setAppointments([]); // Clear previous results
      const res = await axios.get(url);
      console.log('API Request URL:', url);
      console.log('Filtered Appointments Response:', res.data);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch filtered appointments', error);
    }
  };
  
  
  
  
  
  

  const handlePatientSelect = (e) => {
    const selectedPatientID = e.target.value;
    setSelectedPatientID(selectedPatientID); // Save the selected patient ID
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Search Appointment
      </h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      {roleName === 'patient' && (
          <>
           
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={(e) => setSelectedHospitalID(e.target.value)} // Update selectedHospitalID
            >
              <option value="">Select Hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.hospitalID} value={hospital.hospitalID}>
                  {hospital.hospitalName}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={handleDoctorChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctorID} value={doctor.doctorID}>
                  {doctor.doctorName}
                </option>
              ))}
            </select>
          </>
        )}

        {(roleName === 'reception' || roleName === 'doctor') && (
          <select
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            onChange={handlePatientSelect}
          >
            <option value="">Select Patient</option>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <option key={patient.patientID} value={patient.patientID}>
                  {patient.patientName}
                </option>
              ))
            ) : (
              <option value="">No patients found</option>
            )}
          </select>
        )}
      
        <input
          type="text"
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => (e.target.type = 'text')}
          placeholder="From Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        <input
          type="text"
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => (e.target.type = 'text')}
          placeholder="To Date"
          value={endDate}
          onChange={(e) => {
            const selectedEndDate = e.target.value;

            // Ensure the selected end date is not before the start date
            if (new Date(selectedEndDate) < new Date(startDate)) {
              alert('To Date cannot be earlier than From Date');
              return; // prevent updating the end date
            }

            setEndDate(selectedEndDate);
          }}
          min={startDate} // Dynamically setting the min date to the selected start date
          max={
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              .toISOString()
              .split('T')[0]
          } // Ensure the toDate can be up to 1 year in the future
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </form>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <CustomButton onClick={handleSearch}>Search</CustomButton>

        {roleName !== 'doctor' && (
          <button
            type="button"
            className="flex items-center gap-2 bg-gradient-to-b from-[#004A99] to-[#007BFF] 
    hover:from-[#007BFF] hover:to-[#004A99] text-white 
    transition duration-150 ease-out hover:ease-in 
    px-4 py-2 rounded-lg"
    onClick={() => navigate('/appointment/booking')}
          >
            <CalendarCheck className="w-5 h-5" />
            <span>Book</span>
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        List of Appointments
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {appointments.map((appointment) => {
          const {
            patientName,
            patientPhoneNumber,
            patientGender, // Updated from gender to patientGender
            appointmentDate,
            appointmentTime,
            doctorName,
            hospitalName,
          } = appointment; // Direct access to API response

          const appointmentID = `${appointment.patientID}-${appointment.appointmentDate}`;
          const isFemale =
            patientGender?.toLowerCase() === 'female' ||
            patientGender?.toLowerCase() === 'f';

          const borderColorClass = isFemale
            ? 'border-pink-300'
            : 'border-blue-300';
          const bgColorClass = isFemale ? 'bg-pink-200' : 'bg-blue-300';

          return (
            <div
              key={appointmentID}
              className={`relative border-2 ${borderColorClass} rounded-xl shadow bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg`}
            >
              {/* Gender Badge */}
              <div
                className={`absolute top-0 left-0 ${bgColorClass} w-10 h-10 rounded-br-md flex items-center justify-center`}
              >
                <span className="text-white text-lg">
                  {patientGender?.toLowerCase() === 'female' ||
                  patientGender?.toLowerCase() === 'f' ? (
                    <FaVenus />
                  ) : (
                    <FaMars />
                  )}
                </span>
              </div>

              {/* First Row - Name, Age, Hospital, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 text-sm font-medium text-gray-800 ml-4">
                <div className="flex items-center gap-1 max-w-full">
                  <img
                    src={patientIcon} // <-- Replace with actual image path or dynamic URL
                    alt="Patient"
                    className="w-5 h-6"
                  />
                  <span className="text-black">Name:</span>
                  <span className="truncate max-w-[160px] text-black">
                    {patientName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <img src={CalendarIcon} alt="calendar" className="w-6 h-6" />
                  <span className="text-black">Age:</span>
                  <span className="text-black">
                    {getAgeFromDOB(appointment.patientDateOfBirth)} yrs
                  </span>{' '}
                  {/* Assuming a function for age calculation */}
                </div>
              </div>

              {/* Second Row - Hospital, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm font-medium text-gray-800 ml-4">
                <div className="flex items-center gap-1 max-w-full">
                  <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
                  <span className="text-black">Hospital:</span>
                  <span className="truncate max-w-[160px] text-black">
                    {hospitalName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <img src={PhoneIcon} alt="phone" className="w-5 h-5" />
                  <span className="text-black">Phone:</span>
                  <a
                    href={`tel:${patientPhoneNumber}`}
                    className="text-black hover:underline"
                  >
                    {patientPhoneNumber}
                  </a>
                </div>
              </div>

              {/* Third Row - Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm font-medium text-gray-800 ml-4">
                <div className="flex items-center gap-1">
                  <img src={CalendarIcon} alt="calendar" className="w-6 h-6" />
                  <span className="text-black">Date:</span>
                  <span className="text-black">
                    {appointmentDate.slice(0, 10)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <img src={ClockIcon} alt="clock" className="w-4 h-4" />
                  <span className="text-black">Time:</span>
                  <span className="text-black">
                    {appointmentTime.slice(0, 5).replace(':', '.')}
                  </span>
                </div>
              </div>

              {/* Fourth Row - Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm font-medium text-gray-800 ml-4 mb-4">
                <div className="flex items-center gap-1">
                  <img src={DoctorIcon} alt="doctor" className="w-4 h-5" />{' '}
                  {/* Optional Icon */}
                  <span className="text-black">Doctor:</span>
                  <span className="text-black">{doctorName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchAppointment;
