import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
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
interface AppointmentHistory {
  appointmentHistoryID: string;
  createdOn: string;
  username: string;
  name: string;
}

interface Status {
  appLOVID: string;
  name: string;
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
  const [isTrackingModalOpen, setIsTrackingModalOpen] =
    useState<boolean>(false);
  const [selectedHospitalID, setSelectedHospitalID] = useState('');
  const [trackingData, setTrackingData] = useState<AppointmentHistory[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [startDate, setStartDate] = useState('');
  const [trackingAppointment, setTrackingAppointment] =
    useState<Appointment | null>(null);
  const [endDate, setEndDate] = useState('');
  const [statusList, setStatusList] = useState<Status[]>([]);
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
    const role = sessionStorage.getItem('roleName') || '';
    const unitID = sessionStorage.getItem('unitID') || '';

    setRoleName(role.toLowerCase()); // normalize casing

    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital/List')
      .then((response) => response.json())
      .then((data) => {
        const activeHospitals = data.filter((hospital) => hospital.isActive);
        setHospitals(activeHospitals);

        if (role.toLowerCase() === 'hostitaladmin' && unitID) {
          // Set hospital dropdown to unitID from session
          setSelectedHospitalID(unitID);
        }
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
    } else if (roleName === 'doctor' && doctorID && unitID) {
      appointmentURL += `?DoctorID=${doctorID}&UnitID=${unitID}`;
    } else if (roleName === 'reception' && unitID) {
      appointmentURL += `?UnitID=${unitID}`;
    } else if (roleName === 'hostitaladmin' && unitID) {
      appointmentURL += `?HospitalID=${unitID}`;
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
      } else if (
        (roleName === 'reception' || roleName === 'hospitaladmin') &&
        unitID
      ) {
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

  const fetchStatusList = async () => {
    try {
      const response = await axios.get(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=AppointmentStauts',
      );
      if (Array.isArray(response.data?.data)) {
        setStatusList(response.data.data);
      }
    } catch {
      console.error('Failed to fetch status list.');
    }
  };

  useEffect(() => {
    fetchAppointmentsForUser();
    fetchStatusList();
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
  useEffect(() => {
    const roleName = sessionStorage.getItem('roleName')?.toLowerCase();
    if (roleName === 'hostitaladmin') {
      const unitID = sessionStorage.getItem('unitID') || '';
      setSelectedHospitalID(unitID); // Set only once when component loads
    }
  }, []);

  const handleSearch = async () => {
    const roleName = sessionStorage.getItem('roleName')?.toLowerCase() || '';
    const unitID = sessionStorage.getItem('unitID') || '';
    const doctorID =
      roleName === 'doctor'
        ? sessionStorage.getItem('doctorID') || ''
        : selectedDoctorID;

    const patientName =
      roleName === 'patient'
        ? sessionStorage.getItem('patientName') // Use patientName here
        : selectedPatientName; // Ensure you set selectedPatientName in the component state

    let hasFilters = false;

    if (roleName === 'doctor') {
      hasFilters = !!(startDate || endDate || patientName);
    } else if (roleName === 'patient') {
      hasFilters = !!(
        startDate ||
        endDate ||
        selectedHospitalID ||
        selectedDoctorID
      );
    } else if (roleName === 'hostitaladmin') {
      hasFilters = !!(startDate || endDate || doctorID || patientName);
    }

    if (!hasFilters) {
      toast.warning('Please select at least one filter before searching.');
      return;
    }

    const baseUrl =
      'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment';
    const params = new URLSearchParams();

    const formatDateToLocalISOString = (dateString, isStart) => {
      const date = new Date(dateString);
      date.setHours(
        isStart ? 0 : 23,
        isStart ? 0 : 59,
        isStart ? 0 : 59,
        isStart ? 0 : 999,
      );
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds(),
      )}`;
    };

    if (roleName === 'doctor') {
      if (unitID) params.append('HospitalID', unitID);
      if (doctorID) params.append('DoctorID', doctorID);
      if (patientName) params.append('PatientName', patientName); // Use patientName here
    }

    if (roleName === 'patient') {
      if (selectedHospitalID) params.append('HospitalID', selectedHospitalID);
      if (selectedDoctorID) params.append('DoctorID', selectedDoctorID);
      if (patientName) params.append('PatientName', patientName); // Use patientName here
    }

    if (roleName === 'hostitaladmin') {
      if (unitID) params.append('HospitalID', unitID);
      if (doctorID) params.append('DoctorID', doctorID);
      if (patientName) params.append('PatientName', patientName); // Use patientName here
    }

    if (startDate)
      params.append('StartDate', formatDateToLocalISOString(startDate, true));
    if (endDate)
      params.append('EndDate', formatDateToLocalISOString(endDate, false));

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

  const handleReset = () => {
    const roleName = sessionStorage.getItem('roleName')?.toLowerCase();
  
    // Reset common state
    setStartDate('');
    setEndDate('');
  
    // Reset role-specific state
    switch (roleName) {
      case 'doctor':
      case 'reception':
        setSelectedPatientID('');
        setSelectedPatientName(''); // <- use the correct state setter
        break;
      case 'patient':
        setSelectedDoctorID('');
        setSelectedHospitalID('');
        break;
      case 'hostitaladmin':
        setSelectedDoctorID('');
        setSelectedPatientID('');
        setSelectedPatientName('');
        break;
      default:
        setSelectedDoctorID('');
        setSelectedHospitalID('');
        setSelectedPatientID('');
        setSelectedPatientName('');
    }
  
    fetchAppointmentsForUser();
  };
  
  

  const handlePatientSelect = (e) => {
    const selectedPatientID = e.target.value;
    setSelectedPatientID(selectedPatientID); // Save the selected patient ID
  };
  const getDateColor = (date) => {
    const day = new Date(date).getDate(); // Extract day from the date
    const colors = [
      'bg-red-400',
      'bg-blue-400',
      'bg-green-400',
      'bg-yellow-400',
      'bg-purple-400',
    ]; // Add more colors if needed
    return colors[day % colors.length]; // Assign color based on day
  };

  const handleTracking = async (appointment: Appointment) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentHistory/${appointment.appointmentID}`,
      );
      let historyData: AppointmentHistory[] = Array.isArray(response.data)
        ? response.data
        : [];

      // Sort history data by createdOn (latest first)
      historyData.sort(
        (a, b) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime(),
      );

      // Remove duplicate statuses (keep only latest entry for each unique status name)
      const uniqueStatusMap = new Map();
      historyData.forEach((history) => {
        const matchedStatus = statusList.find(
          (status) => status.appLOVID === history.appointmentHistoryID,
        );
        const statusName = matchedStatus ? matchedStatus.name : history.name;

        if (!uniqueStatusMap.has(statusName)) {
          uniqueStatusMap.set(statusName, { ...history, name: statusName });
        }
      });

      setTrackingAppointment(appointment);
      setTrackingData(Array.from(uniqueStatusMap.values())); // Convert Map to array
      setIsTrackingModalOpen(true);
    } catch {
      console.error('Failed to fetch appointment history.');
    }
  };
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Search Appointment
      </h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

  {/* Patient Role */}
  {roleName === 'patient' && (
    <>
      <select
        value={selectedHospitalID}
        onChange={(e) => setSelectedHospitalID(e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
      >
        <option value="">Select Hospital</option>
        {hospitals.map((hospital) => (
          <option key={hospital.hospitalID} value={hospital.hospitalID}>
            {hospital.hospitalName}
          </option>
        ))}
      </select>

      <select
        value={selectedDoctorID}
        onChange={handleDoctorChange}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
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

  {/* Reception/Doctor */}
  {(roleName === 'reception' || roleName === 'doctor') && (
    <input
      type="text"
      value={selectedPatientName}
      onChange={(e) => setSelectedPatientName(e.target.value)}
      placeholder="Enter patient name"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
    />
  )}

  {/* Hospital Admin */}
  {roleName === 'hostitaladmin' && (
    <>
      <select
        value={selectedHospitalID}
        disabled
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
      >
        <option value="">Select Hospital</option>
        {hospitals.map((hospital) => (
          <option key={hospital.hospitalID} value={hospital.hospitalID}>
            {hospital.hospitalName}
          </option>
        ))}
      </select>

      <select
        value={selectedDoctorID}
        onChange={handleDoctorChange}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
      >
        <option value="">Select Doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.doctorID} value={doctor.doctorID}>
            {doctor.doctorName}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={selectedPatientName}
        onChange={(e) => setSelectedPatientName(e.target.value)}
        placeholder="Enter patient name"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
      />
    </>
  )}

  {/* Date Inputs */}
  <input
    type="text"
    onFocus={(e) => (e.target.type = 'date')}
    onBlur={(e) => (e.target.type = 'text')}
    placeholder="From Date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
  />

  <input
    type="text"
    onFocus={(e) => (e.target.type = 'date')}
    onBlur={(e) => (e.target.type = 'text')}
    placeholder="To Date"
    value={endDate}
    onChange={(e) => {
      const selectedEndDate = e.target.value;
      if (new Date(selectedEndDate) < new Date(startDate)) {
        alert('To Date cannot be earlier than From Date');
        return;
      }
      setEndDate(selectedEndDate);
    }}
    min={startDate}
    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
  />

  {/* Buttons — full row */}
  <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 flex flex-wrap gap-4 items-center">
    <CustomButton className="h-10 px-6" onClick={handleSearch}>
      Search
    </CustomButton>

    <CustomButton
      onClick={handleReset}
      className="h-10 px-6 border border-gray-300 opacity-80 hover:opacity-100 flex items-center gap-1"
    >
      Reset
    </CustomButton>

    {roleName !== 'doctor' && (
      <button
        type="button"
        className="h-10 px-6 flex items-center gap-2 bg-gradient-to-b from-[#004A99] to-[#007BFF] 
        hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 
        ease-out hover:ease-in rounded-lg"
        onClick={() => navigate('/appointment/booking')}
      >
        <CalendarCheck className="w-5 h-5" />
        <span>Book</span>
      </button>
    )}

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
</form>


     


      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        List of Appointments
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {appointments.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">
            No appointments available.
          </div>
        ) : (
          appointments.map((appointment) => {
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
                    <img
                      src={CalendarIcon}
                      alt="calendar"
                      className="w-6 h-6"
                    />
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
                    <img
                      src={HospitalIcon}
                      alt="hospital"
                      className="w-5 h-5"
                    />
                    <span className="text-black">Hospital:</span>
                    <span className="truncate max-w-[160px] text-black">
                      {hospitalName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <img src={PhoneIcon} alt="phone" className="w-5 h-5" />
                    <span className="text-black">Phone:</span>
                    <span className="text-black">{patientPhoneNumber}</span>
                  </div>
                </div>

                {/* Third Row - Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm font-medium text-gray-800 ml-4">
                  <div className="flex items-center gap-1">
                    <img
                      src={CalendarIcon}
                      alt="calendar"
                      className="w-6 h-6"
                    />
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
                  <div className="mt-2 flex justify-between items-center">
                    <button
                      onClick={() => handleTracking(appointment)}
                      className="px-3 py-1 ml-2 bg-blue-300 text-white rounded-md hover:bg-blue-300 flex items-center gap-2"
                    >
                      <FaClipboardList />
                      Tracking
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {isTrackingModalOpen && trackingAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Tracking for {trackingAppointment.patientName}
            </h2>

            {/* Timeline Container */}
            <div className="relative">
              {trackingData.map((item, index) => (
                <div key={index} className="flex items-start relative mb-6">
                  <div
                    className={`w-5 h-5 ${getDateColor(item.createdOn)} rounded-full border-2 border-white z-10 absolute left-0`}
                  ></div>

                  {/* Vertical Line Connecting Dots */}
                  {index !== trackingData.length - 1 && (
                    <div className="absolute left-2 top-5 h-full border-l-2 border-dashed border-green-300"></div>
                  )}

                  {/* Timeline Content (Shifted Right for Left Alignment) */}
                  <div className="bg-gray-100 p-3 rounded-lg shadow-md w-3/4 ml-8">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.createdOn).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      -
                      {new Date(item.createdOn)
                        .toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                        .replace(':', '.')}
                    </p>

                    {/* User Name Label */}
                    <p className="text-sm text-gray-200">
                      <span className="text-sm">Updated by:</span>{' '}
                      {item.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <CustomButton
                onClick={() => setIsTrackingModalOpen(false)}
                className="mt-4"
              >
                Close
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAppointment;
