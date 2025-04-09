import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (2).svg';
import CalendarIcon from '../../images/icon/calendars.svg';
import ClockIcon from '../../images/icon/Clock (2).svg';
import DoctorIcon from '../../images/icon/User doctor (2).svg';
import { FaMale, FaFemale, FaEdit } from 'react-icons/fa'; // Gender icons
import axios from 'axios';

import CustomButton from '../../components/CustomButton';
import { CalendarCheck } from 'lucide-react';
import { inputFieldClass } from '../../components/FormStyles';
interface Appointment {
  doctorName: string;
  patientName: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientEmail: string;
  patientPhoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
}

const AppointmentCard: React.FC = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>({
    appointmentDate: '',
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
const[doctorID,setDoctorID]=useState('');
const [dropdownVisible, setDropdownVisible] = useState<{
    [key: number]: boolean;
  }>({});
  
  const [selectedDoctorID, setSelectedDoctorID] = useState<string>('');

  const [doctors, setDoctors] = useState<any[]>([]); // Sample doctors array
  
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [roleName, setRoleName] = useState('');
  const [userID, setUserID] = useState('');

  useEffect(() => {
    const user = sessionStorage.getItem('userID');
    if (!user) {
      alert('User not logged in.');
      return;
    }

    setUserID(user);
    initializeUserRoleAndAppointments(user);
  }, []);

  const initializeUserRoleAndAppointments = async (userID: string) => {
    try {
      // Step 1: Get roleID
      const roleResponse = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/UserRoles/${userID}`,
      );
      const roleData = await roleResponse.json();

      if (!roleData.success || roleData.data.length === 0) {
        console.warn('⚠️ Role ID not found for user');
        return;
      }

      const roleID = roleData.data[0].roleID;

      // Step 2: Get role name
      const roleNameResponse = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Role/${roleID}`,
      );
      const roleNameData = await roleNameResponse.json();

      if (!roleNameData.success || !roleNameData.data) {
        console.warn('⚠️ Failed to get role name');
        return;
      }

      const role = roleNameData.data.roleName;
      setRoleName(role);
      console.log('✅ Role:', role);

      // Step 3: Fetch appointments based on role
      fetchAppointmentsBasedOnRole(userID, role);
    } catch (error) {
      console.error('❌ Error in role initialization:', error);
    }
  };

  const fetchAppointmentsBasedOnRole = async (userID: string, role: string) => {
    setLoading(true);
    setAppointments([]);
  
    try {
      if (role === 'Patient') {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Patient/GetPatientByUserID?userId=${userID}`,
        );
        const data = await res.json();
  
        if (data.success && data.data) {
          const patientID = data.data.patientID;
          const apptRes = await fetch(
            `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?PatientID=${patientID}`,
          );
          const apptData = await apptRes.json();
          setAppointments(apptData || []);
        } else {
          console.warn('⚠️ Patient data not found.');
        }
  
      } else if (role === 'Doctor') {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorsByUserID?userId=${userID}`,
        );
        const data = await res.json();
  
        if (data.success && data.data) {
          const doctorID = data.data.doctorID;
          const apptRes = await fetch(
            `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${doctorID}`,
          );
          const apptData = await apptRes.json();
          setAppointments(apptData || []);
        } else {
          console.warn('⚠️ Doctor data not found.');
        }
  
      } else if (
        role === 'Reception' || 
        role === 'Medical' || 
        role === 'LABIncharge' || 
        role === 'Cash'
      ) {
        const unitID = sessionStorage.getItem('unitID');
        if (!unitID) {
          console.warn('⚠️ unitID not found in sessionStorage.');
          return;
        }
  
        let apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?HospitalID=${unitID}`;
  
        if (role === 'Medical') {
          const statusID = 'af33b3bb-b1b7-46f5-b4bf-08dd57ac7396';
          apiUrl += `&StatusID=${statusID}`;
        }
  
        if (role === 'LABIncharge') {
          const statusID = 'a1c4ba4c-a87b-4b25-b4c0-08dd57ac7396';
          apiUrl += `&StatusID=${statusID}`;
        }
  
        if (role === 'Cash') {
          const statusID = '5855b16d-1447-4856-b4be-08dd57ac7396';
          apiUrl += `&StatusID=${statusID}`;
        }
  
        const apptRes = await fetch(apiUrl);
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);
  
      } else {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment`,
        );
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
  
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleSaveEdit = async () => {
    if (!selectedAppointment) return;
  
    if (!selectedAppointment.appointmentTime) {
      console.warn('⚠️ appointmentTime is missing');
      alert('Please select an appointment time.');
      return;
    }
  
    const loggedInUserID = sessionStorage.getItem("userID");
  
    if (!loggedInUserID) {
      alert("Session expired. Please log in again.");
      return;
    }
  
    // Convert date + time to 24hr ISO timestamp
    const convertTo24HourFormat = (time12h: string): string => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
  
      if (modifier.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      }
      if (modifier.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
  
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}:00`;
    };
  
    const date = selectedAppointment.appointmentDate; // e.g., "2025-04-14"
    const time = convertTo24HourFormat(selectedAppointment.appointmentTime); // e.g., "18:00:00"
    const appointmentDateTimeISO = new Date(`${date}T${time}`).toISOString();
  
    const payload = {
      appointmentID: selectedAppointment.appointmentID,
      doctorID: selectedAppointment.doctorID,
      patientID: selectedAppointment.patientID,
      timeSlotID: selectedAppointment.timeSlotID,
      appointmentDate: appointmentDateTimeISO,
      appointmentTime: time, // Now in 24hr format
      statusID: selectedAppointment.statusID,
      phoneNumber: selectedAppointment.phoneNumber,
      notes: selectedAppointment.notes,
      toWhom: selectedAppointment.toWhom,
      relationShip: selectedAppointment.relationShip,
      createdBy: selectedAppointment.createdBy || loggedInUserID,
      createdOn: selectedAppointment.createdOn,
      updatedBy: loggedInUserID,
      updatedOn: new Date().toISOString(),
      isActive: true,
    };
  
    console.log("📦 Clean Payload sent to API:", payload);
  
    try {
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Appointment/${selectedAppointment.appointmentID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
  
      const data = await response.json();
      console.log('✅ Appointment updated:', data);
  
      setIsEditModalOpen(false);
      fetchAppointmentsBasedOnRole(loggedInUserID, role);
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
    }
  };
  
  
  
  
  



  const handleBookNow = () => {
    navigate('/appointment/booking'); // Replace with the actual booking route
  };

  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
      case 'Waiting':
        return '#FFC107'; // Yellow
      case 'Waiting for Schedule':
        return '#FF9800'; // Orange
      case 'Waiting for Doctor Schedule':
        return '#FB8C00'; // Dark Orange
      case 'Confirmed':
        return '#4CAF50'; // Green
      case 'Assign to Billing':
        return '#2196F3'; // Blue
      case 'Assign to Medical':
        return '#03A9F4'; // Light Blue
      case 'Assign to Lab':
        return '#9C27B0'; // Purple
      case 'Closed':
        return '#616161'; // Dark Gray
      case 'Rescheduled':
        return '#795548'; // Brown
      case 'Cancel':
        return '#F44336'; // Red
      case 'Rejected':
        return '#D32F2F'; // Dark Red
      case 'Consult Another Doctor':
        return '#009688'; // Teal
      case 'Recommend to Admit':
        return '#E64A19'; // Deep Orange
      case 'Doctor Review':
        return '#673AB7'; // Indigo
      default:
        return '#9E9E9E'; // Default (Gray)
    }
  };

  useEffect(() => {
    const fetchStatusList = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=appointmentstauts',
        );
        //  console.log("Fetched Status List:", response.data?.data);
        if (Array.isArray(response.data?.data)) {
          setStatusList(response.data.data);
        }
      } catch {
        console.error('Failed to fetch status list.');
      }
    };

    fetchStatusList();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/Doctor',
        );
        setDoctors(
          Array.isArray(response.data?.data) ? response.data.data : [],
        );
      } catch {
        console.error('Failed to fetch doctors.');
      }
    };
    fetchDoctors();
  }, []);



  const toggleDropdown = (index: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusInfo = (statusID: string) => {
    // console.log("StatusID:", statusID, "Status List:", statusList);
    const status = statusList.find((s) => s.appLOVID === statusID);
    return status ? status.name : 'Unknown';
  };

  // Function to calculate age based on Date of Birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Return age in years
  };

  // Function to format the date to "yyyy-mm-dd"
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Extracts "yyyy-mm-dd" from the date string
  };

  // Function to format the time to "hh:mm"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleEditClick = (appointment: Appointment) => {
    console.log('📝 Editing Appointment:', appointment);
    console.log('🔍 createdBy:', appointment.createdBy); // explicitly check this field
    setSelectedAppointment(appointment); 
    setIsEditModalOpen(true); 
  };
  

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setSelectedDoctor(doctorID);
  
    const selectedDoctor = doctors.find((doc) => doc.doctorID === doctorID);
    console.log("👨‍⚕️ Selected Doctor:", selectedDoctor); // for debug
  
    const selectedDate = selectedAppointment.appointmentDate;
    if (selectedDate) {
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      fetchTimeSlots(doctorID, dayOfWeek);
    }
  
    // ✅ Update full doctor info into selectedAppointment
    setSelectedAppointment((prev) => ({
      ...prev,
      doctorID,
      doctorName: selectedDoctor?.doctorName || '',
      doctorEmail: selectedDoctor?.doctorEmail || '',
      doctorPhoneNumber: selectedDoctor?.doctorPhoneNumber || '',
      appointmentTime: '', // Reset time when doctor changes
    }));
  };
  
  

  const openEditModal = (appointment) => {
    setSelectedDoctor(appointment.doctorID); // Set default doctor ID
    setAppointmentDate(appointment.date); // Set default date
    setSelectedTimeSlot(appointment.timeSlot); // Set default time slot
    setCurrentAppointment(appointment); // Store the current appointment
    setIsEditModalOpen(true); // Open modal
  };

 
  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
  ): string[] => {
    const slots: string[] = [];
    const startTime = new Date();
    const endTime = new Date();

    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);

    startTime.setHours(fromHour, fromMinute, 0, 0);
    endTime.setHours(toHour, toMinute, 0, 0);

    while (startTime < endTime) {
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');

      slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
      startTime.setMinutes(startTime.getMinutes() + slotDuration);
    }

    return slots;
  };
 
  const fetchTimeSlots = async (doctorID: string, selectedDay: string) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        const slotData = response.data.data.find(
          (slot) => slot.dayofWeek === selectedDay
        );

        if (slotData?.fromTime && slotData?.toTime && slotData?.slotDuration) {
          const generatedSlots = generateTimeSlots(
            slotData.fromTime,
            slotData.toTime,
            slotData.slotDuration
          );
          setAvailableTimeSlots(generatedSlots);
        } else {
          console.error('No time slots available for:', selectedDay);
          setAvailableTimeSlots([]);
        }
      } else {
        console.error('Invalid time slots format:', response.data);
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableTimeSlots([]);
    }
  };

  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    console.log('Selected Day:', dayOfWeek); // 👈 Log day
  
    setSelectedAppointment((prev) =>
      prev ? { ...prev, appointmentDate: selectedDate } : null
    );
  
    if (selectedDoctorID) {
      fetchTimeSlots(selectedDoctorID, dayOfWeek); // ✅ Call when doctor already selected
    }
  };
  
  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedTimeSlot(selected);
  
    // Also update the appointment time inside selectedAppointment
    setSelectedAppointment(prev => ({
      ...prev,
      appointmentTime: selected,
    }));
  
    console.log("🕒 Selected Time Slot:", selected);
  };
  
  

  
  const handleSaveChanges = () => {
    console.log('Saving changes for appointment:', selectedAppointment);
    // Perform the save logic here
    setIsEditModalOpen(false);
  };

  const handleStatusChange = async (
    appointmentID: string,
    newStatusID: string,
  ) => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const url = `https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentStatus?appointmentId=${appointmentID}&statusid=${newStatusID}&UpdatedBy=${userID}`;

    try {
      const response = await axios.post(url, null, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) =>
            appt.appointmentID === appointmentID
              ? { ...appt, statusID: newStatusID }
              : appt,
          ),
        );
        setDropdownVisible({});
        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status');
    }
  };

  const handleSearch = async () => {
    if (!selectedDoctorID) {
      alert('Please select a doctor.');
      return;
    }

    setLoading(true);
    setAppointments([]); // Clear previous data

    try {
      let apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${selectedDoctorID}`;

      if (fromTime && toTime) {
        apiUrl += `&StartDate=${fromTime}&EndDate=${toTime}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    console.log('Selected Doctor ID:', selectedId); // 👈 Log selected doctor ID
    setSelectedDoctorID(selectedId);
  };
  

  return (
    <div className="p-4">
      {/* Wrap both in a common column grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ml-5">
        <div className="flex items-center gap-x-4 mb-4">
          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="flex items-center gap-2 bg-gradient-to-b from-[#004A99] to-[#007BFF] 
      hover:from-[#007BFF] hover:to-[#004A99] text-white 
      transition duration-150 ease-out hover:ease-in 
      px-4 py-2 rounded-lg"
          >
            <CalendarCheck className="w-5 h-5" />{' '}
            {/* Adjust size for better alignment */}
            <span>Book</span>
          </button>
          {/* Doctor Selection */}
          <select
            onChange={handleDoctorSelect}
            value={selectedDoctorID}
            className="rounded-md border border-gray-600 bg-transparent p-2 text-black outline-none focus:border-primary"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorID} value={doctor.doctorID}>
                {doctor.doctorName}
              </option>
            ))}
          </select>

          {/* Date Pickers */}
          <input
            type="text"
            placeholder="From Date"
            value={fromTime ? fromTime.split('T')[0] : ''}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!fromTime) e.target.type = 'text';
            }}
            onChange={(e) => setFromTime(e.target.value)}
            className="rounded-md border border-gray-600 bg-transparent p-2 text-black outline-none focus:border-primary"
          />

          <input
            type="text"
            placeholder="To Date"
            value={toTime ? toTime.split('T')[0] : ''}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!toTime) e.target.type = 'text';
            }}
            onChange={(e) => setToTime(e.target.value)}
            className="rounded-md border border-gray-600 bg-transparent p-2 text-black outline-none focus:border-primary"
          />

          {/* Buttons */}
          <CustomButton onClick={handleSearch}>Search</CustomButton>

          <CustomButton
            onClick={() => {
              setSelectedDoctorID('');
              setFromTime('');
              setToTime('');
              fetchAppointmentsBasedOnRole(userID, roleName);
          
            }}
            className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
          >
            Reset
          </CustomButton>
        </div>
      </div>

      {/* Render Appointment Cards */}

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 p-4">
          {appointments.map((appointment, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-100 
        transition-transform transform hover:scale-105 hover:shadow-lg w-[100%]"
            >
              {/* First row - Patient Name (Age), Gender Icon, Edit Icon */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors">
                <div className="flex items-center">
                  {/* Patient Image */}
                  <img
                    src={patientIcon} // <-- Replace with actual image path or dynamic URL
                    alt="Patient"
                    className="w-6 h-6 rounded-full mr-2"
                  />

                  <div className="text-lg font-bold text-black-600">
                    {appointment.patientName}
                  </div>

                  <span className="ml-2 text-sm text-gray-500">
                    ({calculateAge(appointment.patientDateOfBirth)} years)
                  </span>
                </div>

                <div className="flex items-center">
                  {/* Gender Icon */}
                  {appointment.patientGender === 'Male' ? (
                    <FaMale className="text-blue-500 mr-2" />
                  ) : (
                    <FaFemale className="text-pink-500 mr-2" />
                  )}
                {/* Edit icon: show if not a Patient, or if statusName === 'Consult Another Doctor' */}
                {(roleName !== 'Patient' || appointment?.statusID === '71cb1b67-af86-48f0-b4c5-08dd57ac7396') && (
  <FaEdit
    className="cursor-pointer text-gray-500 hover:text-blue-500"
    onClick={() => handleEditClick(appointment)}
  />
)}


                </div>
              </div>

              {/* Second row - Phone, Appointment Date, and Time with Icons */}
              <div className="mt-2 flex items-center justify-between">
                {/* Phone Icon */}
                <div className="flex items-center mr-4">
                  <img
                    src={PhoneIcon} // <-- Replace with actual image path or dynamic URL
                    alt="phone"
                    className="w-5 h-5 mr-2"
                  />
                  <div>{appointment.patientPhoneNumber}</div>
                </div>

                {/* Appointment Date with Icon */}
                <div className="flex items-center mr-4">
                  <img
                    src={CalendarIcon}
                    alt="calendar"
                    className="w-7 h-7 mr-2"
                  />

                  <div>{formatDate(appointment.appointmentDate)}</div>
                </div>

                {/* Appointment Time with Icon */}
                <div className="flex items-center">
                  <img
                    src={ClockIcon} // <-- Replace with actual image path or dynamic URL
                    alt="clock"
                    className="w-5 h-5 mr-2"
                  />
                  <div>{formatTime(appointment.appointmentTime)}</div>
                </div>
              </div>

              {/* Third row - Doctor Name with Icon */}
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  <img
                    src={DoctorIcon} // <-- Replace with actual image path or dynamic URL
                    alt="clock"
                    className="w-5 h-5 mr-2"
                  />
                  <div>{appointment.doctorName}</div>
                </div>
              </div>

              {/* Appointment Status */}
              <div className="mt-2 flex justify-between items-center">
                <span
                  className="px-2 py-1 rounded font-bold text-sm"
                  style={{
                    color: getStatusColor(getStatusInfo(appointment.statusID)),
                  }}
                  title={getStatusInfo(appointment.statusID)}
                >
                  {getStatusInfo(appointment.statusID)}
                </span>

               {/* Change Status button: hide if role is Patient */}
{roleName !== 'Patient' && (
  <button
    onClick={() => toggleDropdown(index)}
    className="px-3 py-1 bg-blue-400 text-white rounded-md hover:bg-blue-500 whitespace-nowrap"
  >
    Change Status
  </button>
)}
              
              </div>

              {/* Status Dropdown */}
              {dropdownVisible[index] && (
                <select
                  className="w-full rounded-lg mt-1 border border-stroke bg-white dark:bg-form-input p-2 text-black dark:text-white outline-none focus:border-primary focus:outline-none focus:ring-0 dark:focus:border-primary"
                  style={{ height: '40px' }} // 👈 Add this
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    if (selectedStatus) {
                      handleStatusChange(
                        appointment.appointmentID,
                        selectedStatus,
                      );
                    }
                  }}
                >
                  <option value="">Select Status</option>
                  {statusList.map((status) => (
                    <option key={status.appLOVID} value={status.appLOVID}>
                      {status.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Modal Popup */}
          {isEditModalOpen && selectedAppointment && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2 className="font-bold text-xl">Edit Appointment</h2>
                </div>
                <div className="modal-body mt-4">
                  {/* Doctor Selection */}
                  <select
                    onChange={handleDoctorChange}
                    value={selectedDoctorID}
                    className={`${inputFieldClass} mb-4`}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctorID} value={doctor.doctorID}>
                        {doctor.doctorName}
                      </option>
                    ))}
                  </select>

                  {/* Appointment Date */}
                  <input
        type="date"
        value={
          selectedAppointment.appointmentDate
            ? selectedAppointment.appointmentDate.split('T')[0]
            : ''
        }
        onChange={handleDateChange}
        className={`${inputFieldClass} mb-4`}
      />

                  {/* Time Slot */}
                  <select
                    value={selectedTimeSlot}
                    onChange={handleTimeSlotChange}
                    className={`${inputFieldClass} mb-4`}
                  >
                    <option value="">Select a Time Slot</option>
                    {availableTimeSlots.map((slot, index) => (
                      <option key={index} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer flex justify-between items-center">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-600 text-black px-55 ml-4 py-6 rounded shadow-none hover:bg-gray-600"
                  >
                    Cancel
                  </button>

                  <CustomButton onClick={handleSaveEdit}>Save</CustomButton>
                </div>
              </div>
            </div>
          )}

          <style>
            {`
      
      /* Overlay to make background darker when modal opens */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal container */
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Header with title and close button */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Close button */
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Form labels */
.modal-body label {
  display: block;
  margin: 10px 0 5px;
}

/* Form inputs */
.modal-body input,
.modal-body select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Footer buttons */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Save button */
.save-btn {
  background: #28a745;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Cancel button */
.cancel-btn {
  background: #dc3545;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Card Styling */
.card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

      
      
      
      `}
          </style>
        </div>
      )}


    </div>
  );
};

export default AppointmentCard;
