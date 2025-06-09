import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (1).svg';

import * as signalR from '@microsoft/signalr';
import ClockIcon from '../../images/icon/Clock (1).svg';
import DoctorIcon from '../../images/icon/Surgeon medicine doctor physician.svg';
import HospitalIcon from '../../images/icon/Hospital solid (1).svg';
import { FaMale, FaFemale, FaEdit, FaGenderless } from 'react-icons/fa'; // Gender icons
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import CustomButton from '../../components/CustomButton';
import { CalendarCheck } from 'lucide-react';
import { inputFieldClass } from '../../components/FormStyles';
import DatePicker from 'react-datepicker';
import api from '../../api/request';

interface Appointment {
  doctorName: string;
  patientName: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientEmail: string;
  patientPhoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  hospitalName: string;
}
interface Patient {
  patientID: string;
  patientName: string;
  patientDateOfBirth: string;
  patientGender: string;
  patientPhoneNumber: string;
  patientEmail: string;
  uhid: string;
}

interface AppointmentPayload {
  appointmentID: string;
  doctorID?: string;
  patientID?: string;
  appointmentDate?: string; // yyyy-mm-dd or ISO string
  appointmentTime?: string; // "HH:mm:ss" format
  statusID?: string;
  reason?: string;
  notes?: string;
  assignToID?: string;
  hospitalID?: string;
  timeSlotID?: string;
  toWhom?: string | null;
  relationShip?: string | null;
  phoneNumber?: string;
  appointmentNumber?: number;
  tokenNumber?: number;
  isActive?: boolean;
}

interface AppointmentData {
  appointmentID: string;
  doctorID: string;
  createdBy?: string;
  createdOn?: string;
  [key: string]: any; // other dynamic fields
}

interface ReceptionPanelProps {
  roleName: string;
  handleAddPatientClick: () => void;
}
const AppointmentCard: React.FC = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [appointmentType, setAppointmentType] = useState(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [selectedNewDoctorID, setSelectedNewDoctorID] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  const [checkAttempted, setCheckAttempted] = useState(false);
  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9_.]*@[a-zA-Z]+\.(com|in|org|net|edu|gov)$/;
  const phoneRegex = /^(?!.*(\d)\1{9})[6-9]\d{9}$/;

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');

  const unitID = sessionStorage.getItem('unitID'); // or from props/state

  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [reasonText, setReasonText] = useState('');

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [doctorID, setDoctorID] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: number]: boolean;
  }>({});
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<
    { appointmentDate: string; appointmentTime: string }[]
  >([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStatusID, setSelectedStatusID] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctorID, setSelectedDoctorID] = useState<string>('');
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  const [doctors, setDoctors] = useState<any[]>([]); // Sample doctors array
  const [noAppointments, setNoAppointments] = useState(false);
  const [slotDuration, setSlotDuration] = useState(5);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [roleName, setRoleName] = useState('');
  const [userID, setUserID] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatientID, setSelectedPatientID] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    timeSlotID: '',
    phoneNumber: '',
    hospital: '',
    doctor: '',
    reason: '',
    date: null as Date | null,
    time: null as Date | null,
  });
 const [updates, setUpdates] = useState([]);
  const [errors, setErrors] = useState({
    name: '',
    relationship: '',

    hospital: '',
    phoneNumber: '',
    doctor: '',
    reason: '',
    date: '',
    time: '',
  });


useEffect(() => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://predart003-001-site1.anytempurl.com/dashboardHub', {
      accessTokenFactory: () => localStorage.getItem('jwtToken')
    })
    .withAutomaticReconnect()
    .build();

  connection.start()
    .then(() => console.log('✅ Connected to SignalR'))
    .catch(console.error);

  // Update existing appointment
  connection.on('ReceiveStatusUpdate', (updatedAppointment) => {
    console.log('📥 Received status update:', updatedAppointment);

    setAppointments(prevAppointments => {
      return prevAppointments.map(appointment =>
        appointment.appointmentID === updatedAppointment.appointmentID
          ? { ...appointment, ...updatedAppointment }
          : appointment
      );
    });
  });

  // Add new appointment
  connection.on('AppointmentNew', (newAppointment) => {
    console.log('🆕 New appointment received:', newAppointment);

    setAppointments(prevAppointments => {
      const exists = prevAppointments.some(
        a => a.appointmentID === newAppointment.appointmentID
      );
      return exists ? prevAppointments : [...prevAppointments, newAppointment];
    });
  });

  return () => {
    connection.stop()
      .then(() => console.log('SignalR connection stopped'))
      .catch(err => console.error('Error stopping SignalR connection:', err));
  };
}, []);

 



  useEffect(() => {
    if (roleName && roleName !== 'Patient') {
      console.log('Calling fetchPatients...');
      fetchPatients();
    }
  }, [roleName]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/Patient'); // 🔗 Relative to baseURL
      console.log('Patient API Response:', res.data);
      setPatients(res.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in.');
      return;
    }

    setUserID(userID); // Store the userID in state
    initializeUserRoleAndAppointments(userID); // Initialize the role and appointments
  }, []);

  const initializeUserRoleAndAppointments = () => {
    try {
      // Step 1: Get userID and roleName from session storage
      const userID = sessionStorage.getItem('userID');
      const role = sessionStorage.getItem('roleName');

      if (!userID || !role) {
        console.warn('⚠️ Missing userID or roleName in session storage');
        return;
      }

      // Step 2: Set role in state (if needed)
      setRoleName(role);

      console.log('✅ Retrieved from session - Role:', role);

      // Step 3: Fetch appointments based on role
      fetchAppointmentsBasedOnRole(userID, role);
    } catch (error) {
      console.error('❌ Error initializing from session:', error);
    }
  };

  const handleCheckPatientClick = async () => {
    if (!mobileNo && !email) {
      toast.warning('Please enter phone number or email.');
      return;
    }

    setCheckAttempted(true);
    setLoading(true);

    try {
      const params = {};
      if (mobileNo) params.MobileNo = mobileNo;
      if (email) params.Email = email;

      const res = await api.get('/Patient/CheckPatientExist', { params });

      if (res.data.success) {
        setPatients(res.data.data || []);
      } else {
        setPatients([]);
        toast.info('Patient not found.');
      }
    } catch (error) {
      console.error('Check patient error:', error);
      toast.error('An error occurred while checking the patient.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollPatient = async () => {
    try {
      const tenantID = sessionStorage.getItem('tenantID');

      if (!tenantID) {
        toast.error('Tenant ID not found in session.');
        return;
      }

      if (!patients || patients.length === 0) {
        toast.warning('No patient data available to enroll.');
        return;
      }

      const payload = {
        patientTenantID: patients[0].patientTenantID,
        patientID: patients[0].patientID,
        tenantID: tenantID,
        isActive: true,
      };

      const response = await api.post('/Patient/EnrollPatient', payload);
      const result = response.data;

      if (response.status === 200) {
        if (result.success) {
          toast.success('Patient enrolled successfully.');
          setIsModalOpen(false);
        } else {
          const uhid = patients[0].uhid || 'Unknown UHID';
          toast.warn(`Patient is already enrolled. UHID: ${uhid}`);
        }
      } else {
        toast.error('Enrollment failed. Please try again.');
      }
    } catch (error) {
      console.error('Enroll error:', error);
      toast.error('An error occurred while enrolling the patient.');
    }
  };

  const handleAddPatientClick = () => {
    if (unitID) {
      navigate(`/signup`, { state: { unitID } });
    } else {
      console.warn('unitID is missing');
    }
  };

  const fetchAppointmentsBasedOnRole = async (userID: string, role: string) => {
  setLoading(true);
  setAppointments([]);

  try {
    const todayDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    let endpoint = `/Appointment/GetAppointment?StartDate=${todayDate}`; // relative path

    if (role === 'Patient') {
      const patientID = sessionStorage.getItem('patientID');
      if (!patientID) {
        console.warn('⚠️ patientID not found in sessionStorage.');
        return;
      }
      endpoint += `&PatientID=${patientID}`;
    } else if (role === 'Doctor') {
      const doctorID = sessionStorage.getItem('doctorID');
      if (!doctorID) {
        console.warn('⚠️ doctorID not found in sessionStorage.');
        return;
      }
      endpoint += `&DoctorID=${doctorID}`;
    } else if (
      ['Reception', 'Medical', 'LABIncharge', 'Cash'].includes(role)
    ) {
      const unitID = sessionStorage.getItem('unitID');
      if (!unitID) {
        console.warn('⚠️ unitID not found in sessionStorage.');
        return;
      }
      endpoint += `&HospitalID=${unitID}`;

      const statusMap: Record<string, string> = {
        Medical: 'af33b3bb-b1b7-46f5-b4bf-08dd57ac7396',
        LABIncharge: 'a1c4ba4c-a87b-4b25-b4c0-08dd57ac7396',
        Cash: '5855b16d-1447-4856-b4be-08dd57ac7396',
      };

      if (statusMap[role]) {
        endpoint += `&StatusID=${statusMap[role]}`;
      }
    } else if (role === 'TenantAdmin') {
      const tenantID = sessionStorage.getItem('tenantID');
      if (!tenantID) {
        console.warn('⚠️ tenantID not found in sessionStorage.');
        return;
      }
      endpoint += `&TenantID=${tenantID}`;
    }

    const response = await api.get(endpoint);
    const apptData = response.data;

    if (Array.isArray(apptData)) {
      setAppointments(apptData);
      setNoAppointments(apptData.length === 0);
    } else {
      setAppointments([]);
      setNoAppointments(true);
    }
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
  } finally {
    setLoading(false);
  }
};



  const filteredTimeSlots = availableSlots.filter(
    (slot) => slot.date === selectedDate,
  );

  const handleSaveEdit = async () => {
    if (!selectedAppointment) return;

    if (!selectedAppointment.appointmentTime) {
      alert('Please select an appointment time.');
      return;
    }

    const loggedInUserID = sessionStorage.getItem('userID');
    const role = sessionStorage.getItem('role');
    if (!loggedInUserID) {
      alert('Session expired. Please log in again.');
      return;
    }

    const appointmentDate = selectedAppointment.appointmentDate?.split('T')[0];
    const appointmentTime = selectedAppointment.appointmentTime;

    if (!appointmentDate || !appointmentTime) {
      alert('Appointment date or time is missing.');
      return;
    }

    const convertTo24HourFormat = (time12h: string): string => {
      if (!time12h.includes(' ')) return time12h;
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier.toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}:00`;
    };

    let timeFormatted = '';
    try {
      timeFormatted = convertTo24HourFormat(appointmentTime);
    } catch {
      alert('Invalid time format.');
      return;
    }

    const [hours, minutes, seconds] = timeFormatted.split(':').map(Number);
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const appointmentDateObj = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds || 0,
    );

    if (isNaN(appointmentDateObj.getTime())) {
      console.error('⛔ Invalid datetime:', {
        appointmentDate,
        timeFormatted,
      });
      alert('Invalid appointment date/time.');
      return;
    }

    if (appointmentDateObj < new Date()) {
      toast.error('Appointment cannot be scheduled in the past.');
      return;
    }

    const payload = {
      appointmentID: selectedAppointment.appointmentID,
      doctorID: selectedAppointment.doctorID,
      patientID: selectedAppointment.patientID,
      timeSlotID: selectedAppointment.timeSlotID,
      appointmentDate,
      appointmentTime: timeFormatted,
      statusID: '82d2585e-3e84-404d-b4c2-08dd57ac7396', // 💥 Force "Reschedule" status
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

    console.log('📦 Payload:', payload);

    try {
      const response = await api.put(
        `/Appointment/${selectedAppointment.appointmentID}`,
        payload,
      );

      console.log('✅ Updated:', response.data);
      toast.success('Appointment updated successfully!');

      // ✅ Don't navigate away, just close modal and refresh
      setTimeout(() => setIsEditModalOpen(false), 100);
      fetchAppointmentsBasedOnRole(loggedInUserID, role);
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error('Failed to update appointment');
    }
  };

  const loggedInUserID = 'your-logged-in-user-id'; // get dynamically from auth context or state

  const updateAppointmentStatus = async (
    appointmentID: string,
    payload: Partial<AppointmentPayload>,
  ) => {
    try {
      const updatedPayload: AppointmentPayload = {
        ...payload,
        updatedBy: loggedInUserID,
        updatedOn: new Date().toISOString(),
      };

      const response = await axios.put(
        `https://predart003-001-site1.anytempurl.com/api/Appointment/${appointmentID}`,
        updatedPayload,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isEditModalOpen && selectedAppointment) {
      setSelectedDoctorID(selectedAppointment.doctorID || '');
    }
  }, [isEditModalOpen, selectedAppointment]);

  const handleBookNow = () => {
    navigate('/appointment/booking'); // Replace with the actual booking route
  };

  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
      case 'Waiting':
        return '#FFE082'; // Soft Amber
      case 'Waiting for Schedule':
        return '#FFCC80'; // Muted Orange
      case 'Waiting for Doctor Schedule':
        return '#FFB74D'; // Slightly Deeper Orange
      case 'Confirmed':
        return '#A5D6A7'; // Mellow Green
      case 'Assign to Billing':
        return '#90CAF9'; // Soft Blue
      case 'Assign to Medical':
        return '#81D4FA'; // Light Aqua Blue
      case 'Assign to Lab':
        return '#BA68C8'; // Light Purple
      case 'Closed':
        return '#BDBDBD'; // Mid Gray
      case 'Rescheduled':
        return '#A1887F'; // Muted Brown
      case 'Cancel':
        return '#EF9A9A'; // Light Red
      case 'Rejected':
        return '#E57373'; // Slightly Deeper Red
      case 'Consult Another Doctor':
        return '#4DB6AC'; // Balanced Teal
      case 'Recommend to Admit':
        return '#FF8A65'; // Soft Deep Orange
      case 'Doctor Review':
        return '#9575CD'; // Gentle Indigo
      default:
        return '#E0E0E0'; // Default Mid-Light Gray
    }
  };

  useEffect(() => {
    const fetchStatusList = async () => {
      try {
        const response = await api.get('/AppLOV?type=appointmentstauts');
        // Filter only active items
        if (Array.isArray(response.data?.data)) {
          const activeStatusList = response.data.data.filter(
            (item: any) => item.isActive === true,
          );
          setStatusList(activeStatusList);
        }
      } catch (error) {
        console.error('Failed to fetch status list.', error);
      }
    };

    fetchStatusList();
  }, []);

useEffect(() => {
  api
    .get('/Doctor')
    .then((response) => {
      if (response.data.success && Array.isArray(response.data.data)) {
        // Step 1: Remove duplicates
        const uniqueMap = new Map();

        response.data.data.forEach((doctor) => {
          const nameKey = doctor.doctorName.toLowerCase().trim();
          if (!uniqueMap.has(nameKey)) {
            uniqueMap.set(nameKey, doctor);
          }
        });

        const uniqueDoctors = Array.from(uniqueMap.values());

        // Step 2: Forcefully sort Dr. names under 'D'
        const sortedDoctors = uniqueDoctors.sort((a, b) => {
          const nameA = a.doctorName.trim();
          const nameB = b.doctorName.trim();

          // Dr. names go by full string comparison as-is
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });

        setDoctors(sortedDoctors);
      } else {
        console.error('Invalid data format');
      }
    })
    .catch((error) => {
      console.error('Error fetching doctors:', error);
    });
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
    const [year, month, day] = date.split('T')[0].split('-');
    return `${year}-${month}-${day}`; // preserves original date without shifting
  };

  // Function to format the time to "hh:mm"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleEditClick = (appointment: Appointment) => {
    console.log('📝 Editing Appointment:', appointment);
    console.log('🔍 createdBy:', appointment.createdBy);

    // Remove old date before setting
    const { appointmentDate, ...rest } = appointment;

    setSelectedAppointment({
      ...rest,
      appointmentDate: '', // reset the date field
    });

    setIsEditModalOpen(true);
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));
    setSelectedAppointment((prev) => ({ ...prev, doctorID }));

    fetchDoctorTimeSlots(doctorID);
  };

  useEffect(() => {
    if (selectedDoctorID) {
      // Manually trigger the handleDoctorChange logic
      fetchDoctorTimeSlots(selectedDoctorID);
    }
  }, [selectedDoctorID]);

  const fetchDoctorTimeSlots = async (doctorID: string) => {
    if (!doctorID) {
      setAvailableTimeSlots([]);
      setGeneratedTimeSlots([]);
      return;
    }

    try {
      const response = await api.get(
        `/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
      );

      const rawSlots = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const formattedSlots = rawSlots.map((slot) => ({
        timeSlotID: slot.timeSlotID,
        fromTime: slot.fromTime,
        toTime: slot.toTime,
        slotDuration: slot.slotDuration,
        day: slot.dayofWeek,
        doctorID: slot.doctorID,
      }));

      setAvailableTimeSlots(formattedSlots);

      console.log('📥 Selected Doctor ID:', doctorID);
      console.log('🕒 All Time Slots from API:', formattedSlots);

      if (selectedDate) {
        handleDateChange(selectedDate, formattedSlots);
      } else {
        setGeneratedTimeSlots([]);
      }
    } catch (error) {
      console.error('❌ Error fetching time slots:', error);
      setAvailableTimeSlots([]);
      setGeneratedTimeSlots([]);
    }
  };

  const openEditModal = (appointment) => {
    setSelectedDoctor(appointment.doctorID); // Set default doctor ID
    setAppointmentDate(appointment.date); // Set default date
    setSelectedTimeSlot(appointment.timeSlot); // Set default time slot
    setCurrentAppointment(appointment); // Store the current appointment
    setIsEditModalOpen(true); // Open modal
  };

  const handleUpdateStatusClick = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDoctorID(appointment.doctorID); // <-- This will prefill the dropdown
    setIsEditModalOpen(true);
  };

  const handleDateChange = async (
    date: Date | null,
    slots?: TimeSlotType[],
  ) => {
    if (!date) return;

    const localDate = formatLocalDate(date); // "YYYY-MM-DD"
    console.log('📅 Selected Date (Full):', date);
    console.log('📅 Selected Date (Local):', localDate);

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    setSelectedAppointment((prev) => ({
      ...prev,
      appointmentDate: localDate,
    }));

    // Update selectedTime synced with new date (keep old time if exists)
    setSelectedTime((prevSelectedTime) => {
      if (prevSelectedTime) {
        const newDateTime = new Date(date);
        newDateTime.setHours(prevSelectedTime.getHours());
        newDateTime.setMinutes(prevSelectedTime.getMinutes());
        newDateTime.setSeconds(0);
        newDateTime.setMilliseconds(0);
        return newDateTime;
      } else {
        const newDateTime = new Date(date);
        newDateTime.setHours(0, 0, 0, 0);
        return newDateTime;
      }
    });

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('❌ Invalid timeSlots:', timeSlots);
      return;
    }

    const dayOfWeek = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
      .trim();

    console.log('Selected Day of Week:', dayOfWeek);

    const matchedDaySlots = timeSlots.filter(
      (slot) => slot.day?.toLowerCase().trim() === dayOfWeek,
    );

    const doctorDays = [
      ...new Set(timeSlots.map((slot) => slot.day?.toLowerCase().trim())),
    ];
    console.log('✅ Doctor Available Days:', doctorDays);

    timeSlots.forEach((slot) => {
      console.log(`Checking slot day "${slot.day}" against "${dayOfWeek}"`);
    });

    console.log('🕒 Matched Slots for Day:', matchedDaySlots);

    if (matchedDaySlots.length === 0) {
      console.warn(`⚠️ Doctor NOT available on ${dayOfWeek}. No slots.`);
      setGeneratedTimeSlots([]);
      return;
    }

    try {
      // Fetch existing booked appointments for this doctor & date
      const appointmentResponse = await api.get(
        `/Appointment/GetAppointment?DoctorID=${selectedDoctorID}&StartDate=${localDate}&EndDate=${localDate}`,
      );

      const appointmentData = appointmentResponse.data;
      const appointmentList = Array.isArray(appointmentData)
        ? appointmentData
        : [];

      const bookedSlots = appointmentList.map((appointment: any) => ({
        appointmentDate: appointment?.appointmentDate,
        appointmentTime: appointment?.appointmentTime,
      }));

      console.log('📋 Booked Slots:', bookedSlots);

      // Generate all available time slots considering booked ones
      let generated: { time: Date; timeSlotID: number }[] = [];

      matchedDaySlots.forEach(
        ({ fromTime, toTime, slotDuration, timeSlotID }) => {
          const slots = generateTimeSlots(
            fromTime,
            toTime,
            slotDuration,
            timeSlotID,
            bookedSlots,
            date,
          );
          generated = [...generated, ...slots];
        },
      );

      console.log('⏰ Generated Available Time Slots:', generated);

      setBookedSlots(bookedSlots);
      setGeneratedTimeSlots(generated);

      // Optionally preselect the first available time slot id in formData
      if (matchedDaySlots.length > 0) {
        setFormData((prev) => ({
          ...prev,
          timeSlotID: matchedDaySlots[0].timeSlotID,
        }));
      }
    } catch (error) {
      console.error('🚨 Error fetching appointments:', error);
      setGeneratedTimeSlots([]);
    }
  };

  const convertTo24HourFormat = (time: Date | string): string => {
    if (!time) return '00:00:00';

    const date =
      typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time;

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
    timeSlotID: number,
    bookedSlots: { appointmentDate: string; appointmentTime: string }[],
    selectedDate: Date,
  ) => {
    const fromTime24 = convertTo24HourFormat(fromTime);
    const toTime24 = convertTo24HourFormat(toTime);

    const [fromHours, fromMinutes] = fromTime24.split(':').map(Number);
    const [toHours, toMinutes] = toTime24.split(':').map(Number);

    const currentSlot = new Date(selectedDate);
    currentSlot.setHours(fromHours, fromMinutes, 0, 0);

    const endSlot = new Date(selectedDate);
    endSlot.setHours(toHours, toMinutes, 0, 0);

    const availableSlots: { time: Date; timeSlotID: number }[] = [];

    while (currentSlot < endSlot) {
      const slotTime = new Date(currentSlot); // Clone to avoid mutation

      const isBooked = bookedSlots.some((b) => {
        const combinedBookedTime = new Date(
          `${b.appointmentDate.split('T')[0]}T${b.appointmentTime}`,
        );
        return combinedBookedTime.getTime() === slotTime.getTime();
      });

      if (!isBooked) {
        console.log(
          `✅ Available Slot: ${slotTime.toTimeString().slice(0, 5)}`,
        );
        availableSlots.push({ time: new Date(slotTime), timeSlotID });
      } else {
        console.log(
          `⛔ Skipping Booked Slot: ${slotTime.toTimeString().slice(0, 5)}`,
        );
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
    }

    return availableSlots;
  };

  const formatLocalDate = (dateInput: Date | string): string => {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      // Handle invalid date input gracefully
      console.error('Invalid date passed to formatLocalDate:', dateInput);
      return ''; // or throw error if you prefer
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const validateField = (name: string, value: string | Date | null): string => {
    let error = '';

    // Conditional validation for 'Others' appointment type
    if (appointmentType === 'Others' && name === 'relationship' && !value) {
      return 'Relationship is required.';
    }

    if (name === 'name' && !value) error = 'Name is required.';
    if (name === 'hospital' && !value) error = 'Hospital is required.';
    if (name === 'doctor' && !value) error = 'Doctor is required.';
    if (name === 'reason' && !value) error = 'Reason is required.';

    if (name === 'phoneNumber') {
      if (!value) {
        error = 'Phone number is required.';
      } else if (typeof value === 'string' && !/^\d{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits.';
      }
    }

    // Date validation
    // Date validation
    if (name === 'date') {
      const dateValue = formData.date;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Clear time for accurate comparison

      if (!dateValue) {
        error = 'Date is required.';
      } else if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
        error = 'Invalid date.';
      } else if (dateValue < today) {
        error = 'Past dates are not allowed.';
      } else {
        error = ''; // Clear error when valid
      }
    }

    // Time validation
    if (name === 'time') {
      console.log('Validating Time:', value, typeof value);

      if (!value || !(value instanceof Date)) {
        error = 'Time is required.';
      } else if (isNaN(value.getTime())) {
        error = 'Invalid time.';
      } else if (formData.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(formData.date);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate.getTime() === today.getTime() && value < new Date()) {
          error = 'Past time is not allowed for today.';
        }
      }
    }

    return error;
  };

  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    console.log('Time Selected:', time);
    console.log('Time Slot ID Selected:', timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time,
      timeSlotID,
    }));
    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    const timeError = validateField('time', time);
    setErrors((prev) => ({ ...prev, time: timeError }));
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedTimeSlot(selected);

    // Also update the appointment time inside selectedAppointment
    setSelectedAppointment((prev) => ({
      ...prev,
      appointmentTime: selected,
    }));

    console.log('🕒 Selected Time Slot:', selected);
  };

  const handleSaveChanges = () => {
    console.log('Saving changes for appointment:', selectedAppointment);
    // Perform the save logic here
    setIsEditModalOpen(false);
  };
  const [reason, setReason] = useState('');

  const handleStatusChange = async (
    appointmentID: string,
    newStatusID: string,
    reason: string,
    newDoctorID?: string, // ⬅️ Add this
  ) => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const appointment = appointments.find(
      (appt) => appt.appointmentID === appointmentID,
    );

    if (!appointment) {
      alert('Appointment not found.');
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      ...appointment,
      statusID: newStatusID,
      reason: reason,
      updatedBy: userID,
      updatedOn: now,
      createdBy: appointment.createdBy || userID,
      createdOn: appointment.createdOn || now,
      assignToID:
        newStatusID === '71cb1b67-af86-48f0-b4c5-08dd57ac7396' && newDoctorID
          ? newDoctorID
          : appointment.doctorID,
    };

    // ✅ Log the full payload
    console.log('Payload being sent:', payload);

    try {
      const response = await api.post(
        '/Appointment/AppointmentStatus',
        payload,
      );

      if (response.status === 200) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) =>
            appt.appointmentID === appointmentID
              ? { ...appt, statusID: newStatusID }
              : appt,
          ),
        );

        // Reset modals and state
        setShowReasonModal(false);
        setShowDoctorDropdown(false);
        setReasonText('');
        setSelectedNewDoctorID('');

        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status');
    }
  };

  const formatLocalDateTime = (date, isEnd = false) => {
    const d = new Date(date);
    d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  };

  const handleSearch = async () => {
    if (fromTime && toTime && new Date(fromTime) > new Date(toTime)) {
      alert('To Date should be greater than or equal to From Date.');
      return;
    }

    const hasAnyFilter =
      fromTime ||
      toTime ||
      selectedDoctorID ||
      selectedPatientID ||
      selectedStatusID;

    if (!hasAnyFilter) {
      toast.warn('Please select at least one filter.');
      return;
    }

    setLoading(true);
    setAppointments([]);

    try {
      const params: Record<string, string> = {};

      if (
        roleName !== 'Patient' &&
        roleName !== 'SuperAdmin' &&
        roleName !== 'TenantAdmin'
      ) {
        const unitID = sessionStorage.getItem('unitID');
        if (!unitID) {
          alert('Hospital ID (unitID) is missing. Please login again.');
          setLoading(false);
          return;
        }
        params.HospitalID = unitID;
      }
      if (roleName === 'TenantAdmin') {
        const tenantID = sessionStorage.getItem('tenantID');
        if (!tenantID) {
          alert('Tenant ID is missing. Please login again.');
          setLoading(false);
          return;
        }
        params.tenantID = tenantID;
      }
      if (roleName === 'Doctor' || roleName === 'Reception') {
        const doctorID = sessionStorage.getItem('doctorID');
        if (!doctorID && roleName === 'Doctor') {
          alert('Doctor ID is missing. Please login again.');
          setLoading(false);
          return;
        }

        if (roleName === 'Doctor') {
          params.DoctorID = doctorID!;
        }

        if (selectedPatientID) {
          params.PatientName = selectedPatientID.trim();
        }
      } else if (roleName === 'Patient') {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
          alert('Patient ID is missing. Please login again.');
          setLoading(false);
          return;
        }
        params.PatientID = patientID;

        if (selectedDoctorID) {
          params.DoctorID = selectedDoctorID;
        }
      } else {
        if (selectedPatientID) {
          params.PatientID = selectedPatientID;
        }
      }

      if (selectedStatusID) {
        params.StatusID = selectedStatusID;
      }

      if (fromTime) {
        params.StartDate = formatLocalDateTime(fromTime);
      }

      if (toTime) {
        params.EndDate = formatLocalDateTime(toTime, true);
      }

      const response = await api.get('/Appointment/GetAppointment', { params });
      const result = response.data;

      if (Array.isArray(result)) {
        setAppointments(result);
      } else if (result?.data && Array.isArray(result.data)) {
        setAppointments(result.data);
      } else {
        console.error('Unexpected response format:', result);
        setAppointments([]);
      }
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
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let val = e.target.value;

    // Check length
    if (val.length > 20) {
      setError('Maximum 20 characters allowed');
      return;
    } else {
      setError(''); // clear error if length is okay
    }

    // Check for special characters or emojis (allow only letters and digits)
    if (/[^a-zA-Z0-9]/.test(val)) {
      setError('Only letters and numbers allowed (no special chars or emojis)');
      return;
    } else {
      setError('');
    }

    // Check repeated digits
    const digits = val.match(/\d/g) || [];
    const digitsSet = new Set(digits);
    if (digits.length !== digitsSet.size) {
      setError('Repeated digits are not allowed');
      return;
    } else {
      setError('');
    }

    setSelectedPatientID(val);
  };

  // Regex to allow only letters, spaces, and basic punctuation
  const allowedCharsRegex = /^[A-Za-z\s.,!?;:'"-]*$/;

  // Regex to detect emojis
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/;

  // Regex to detect 3 or more repeated characters (letters, punctuation, or digits)
  const repeatedCharRegex = /(.)\1{2,}/;

  // Final validity check
  const isReasonValid =
    allowedCharsRegex.test(reasonText) &&
    !emojiRegex.test(reasonText) &&
    !repeatedCharRegex.test(reasonText);

  const isSubmitDisabled = !reasonText.trim() || !isReasonValid;

  return (
    <div className="p-4">
      {/* Wrap both in a common column grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ml-5">
        <div className="flex items-start gap-x-4 mb-4">
          {/* Doctor Dropdown (only for Patient) */}
          {roleName === 'Patient' && (
            <select
              onChange={handleDoctorSelect}
              value={selectedDoctorID}
              className="w-full rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctorID} value={doctor.doctorID}>
                  {doctor.doctorName}
                </option>
              ))}
            </select>
          )}

          {/* Patient Dropdown (for non-Patient roles) */}
          {roleName !== 'Patient' && (
            <div className="flex flex-col w-full min-w-0">
              <input
                type="text"
                placeholder="Enter Patient Name"
                maxLength={30}
                value={selectedPatientID}
                onChange={handleChange}
                className="rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          )}

          <select
            value={selectedStatusID}
            onChange={(e) => setSelectedStatusID(e.target.value)}
            className="rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">-- Select Status --</option>
            {statusList.map((item) => (
              <option key={item.appLOVID} value={item.appLOVID}>
                {item.name}
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
            className="rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            placeholder="To Date"
            value={toTime ? toTime.split('T')[0] : ''}
            onFocus={(e) => {
              e.target.type = 'date';
              e.target.min = fromTime
                ? new Date(fromTime).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            }}
            onBlur={(e) => {
              if (!toTime) e.target.type = 'text';
            }}
            onChange={(e) => setToTime(e.target.value)}
            className="w-[50%] rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />

          {/* Buttons */}
          <CustomButton onClick={handleSearch}>Search</CustomButton>

          <CustomButton
            onClick={() => {
              setSelectedDoctorID('');
              setFromTime('');
              setToTime('');
              setSelectedPatientID('');
              setSelectedStatusID('');
              fetchAppointmentsBasedOnRole(userID, roleName);
            }}
            className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
          >
            Reset
          </CustomButton>
        </div>

        {roleName === 'Reception' && (
          <div className="flex space-x-5">
            <CustomButton onClick={() => setIsModalOpen(true)}>
              Check Patient
            </CustomButton>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" />
      {/* Render message only if not loading and no appointments exist */}
 <div>
      <h2>Live Appointment Status Updates</h2>
      <ul>
        {updates.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center font-bold text-gray-600 py-6">
          No appointments found...
        </p>
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
                    src={patientIcon}
                    alt="Patient"
                    className="w-6 h-6 rounded-full mr-2"
                  />

                  {/* Patient Name with Truncation and Hover Tooltip */}
                  <div
                    className="text-lg font-bold text-black-600 truncate max-w-[150px]" // Adjust width as needed
                    title={appointment.patientName}
                  >
                    {appointment.patientName}
                  </div>

                  <span className="ml-2 text-sm text-gray-500">
                    ({calculateAge(appointment.patientDateOfBirth)} years)
                  </span>
                </div>

                {/* Appointment & Token Numbers */}
                <div className="ml-8 text-sm text-black">
                  Appointment No:{' '}
                  <span className="font-semibold">
                    {appointment.appointmentNumber}
                  </span>{' '}
                  | Token No:{' '}
                  <span className="font-semibold">
                    {appointment.tokenNumber}
                  </span>
                </div>

                <div className="flex items-center">
                  {/* Gender Icon */}
                  {['male', 'm'].includes(
                    appointment.patientGender?.toLowerCase(),
                  ) ? (
                    <FaMale className="text-blue-500 mr-2" />
                  ) : ['female', 'f'].includes(
                      appointment.patientGender?.toLowerCase(),
                    ) ? (
                    <FaFemale className="text-pink-500 mr-2" />
                  ) : (
                    <FaGenderless className="text-gray-500 mr-2" />
                  )}

                  {/* Edit icon: show if not a Patient, or if statusName === 'Consult Another Doctor' */}
                  {/* Edit icon logic */}
                  {((roleName === 'Patient' &&
                    appointment?.statusID ===
                      '71cb1b67-af86-48f0-b4c5-08dd57ac7396') ||
                    roleName === 'Reception' ||
                    roleName === 'SuperAdmin') && (
                    <FaEdit
                      className="cursor-pointer text-gray-500 hover:text-blue-500"
                      onClick={() => handleEditClick(appointment)}
                    />
                  )}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-4 items-start">
                {/* Column 1 - Doctor & Phone */}
                <div className="flex flex-col">
                  {/* Phone */}
                  <div className="flex items-center">
                    <img src={PhoneIcon} alt="phone" className="w-5 h-5 mr-2" />
                    <div className="truncate max-w-[160px]">
                      {appointment.patientPhoneNumber}
                    </div>
                  </div>
                  {/* Doctor */}
                  <div className="flex items-center mb-1">
                    <img
                      src={DoctorIcon}
                      alt="doctor"
                      className="w-4 h-5 mr-2"
                    />
                    <div className="truncate max-w-[160px]">
                      {appointment.doctorName}
                    </div>
                  </div>
                </div>

                {/* Column 2 - Hospital & Date */}
                <div className="flex flex-col">
                  {/* Date */}
                  <div className="flex items-center">
                    <img
                      src={CalendarIcon}
                      alt="calendar"
                      className="w-5 h-5"
                    />
                    <div>{formatDate(appointment.appointmentDate)}</div>
                  </div>
                  {/* Hospital */}
                  <div className="flex items-center mb-1">
                    <img
                      src={HospitalIcon}
                      alt="hospital"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="truncate max-w-[160px]">
                      {appointment.hospitalName}
                    </div>
                  </div>
                </div>

                {/* Column 3 - Empty & Time */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <img src={ClockIcon} alt="clock" className="w-4 h-5 mr-2" />
                    <div>{formatTime(appointment.appointmentTime)}</div>
                  </div>
                  <div className="h-[24px] mb-1"></div>{' '}
                  {/* Empty space same height as icon+text */}
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
                    Update Status
                  </button>
                )}
              </div>

              {/* Status Dropdown */}
              {dropdownVisible[index] && (
                <select
                  className="w-full rounded-lg mt-1 border border-stroke bg-white dark:bg-form-input p-2 text-black dark:text-white outline-none"
                  style={{ height: '40px' }}
                  onChange={(e) => {
                    const status = e.target.value;
                    if (!status) return;

                    setSelectedStatus(status);
                    setSelectedAppointmentId(appointment.appointmentID);

                    if (status === '82d2585e-3e84-404d-b4c2-08dd57ac7396') {
                      // Reschedule
                      setSelectedAppointment(appointment);
                      setIsEditModalOpen(true);
                    } else if (
                      status === '71cb1b67-af86-48f0-b4c5-08dd57ac7396'
                    ) {
                      // Consult Another Doctor
                      setShowDoctorDropdown(true);
                      setShowReasonModal(true);
                    } else {
                      // Other statuses
                      setShowDoctorDropdown(false);
                      setShowReasonModal(true);
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

          {showReasonModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2 className="font-bold text-xl">Enter Reason</h2>
                </div>
                {showDoctorDropdown && (
                  <select
                    className="w-full mt-4 border rounded p-2"
                    value={selectedNewDoctorID}
                    onChange={(e) => setSelectedNewDoctorID(e.target.value)}
                  >
                    <option value="">Select New Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctorID} value={doc.doctorID}>
                        {doc.doctorName}
                      </option>
                    ))}
                  </select>
                )}
                <div className="modal-body mt-4">
                  <textarea
                    className="w-full border rounded p-2"
                    placeholder="Enter reason"
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                  />
                  {!isReasonValid && reasonText && (
                    <p className="text-red-500 text-sm mt-1">
                      Reason should not contain emojis or repeated characters
                      (e.g. aaa, !!!).
                    </p>
                  )}
                </div>
                <div className="modal-footer flex justify-end mt-4">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded mr-2"
                    onClick={() => {
                      setShowReasonModal(false);
                      setShowDoctorDropdown(false);
                      setReasonText('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      isSubmitDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white'
                    }`}
                    onClick={() =>
                      handleStatusChange(
                        selectedAppointmentId,
                        selectedStatus,
                        reasonText,
                        selectedNewDoctorID, // still passed even if empty
                      )
                    }
                    disabled={isSubmitDisabled}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    value={selectedDoctorID}
                    className={`${inputFieldClass} mb-4`}
                    disabled
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctorID} value={doctor.doctorID}>
                        {doctor.doctorName}
                      </option>
                    ))}
                  </select>

                  {/* Appointment Date */}
                  {/* Date input */}
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={
                      selectedAppointment.appointmentDate &&
                      !isNaN(Date.parse(selectedAppointment.appointmentDate))
                        ? selectedAppointment.appointmentDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) => {
                      // Convert string to Date safely and update state
                      const newDate = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      if (newDate && !isNaN(newDate.getTime())) {
                        handleDateChange(newDate);
                        setSelectedAppointment((prev: any) => ({
                          ...prev,
                          appointmentDate: newDate.toISOString(),
                        }));
                      } else {
                        // Clear or handle invalid date input
                        setSelectedAppointment((prev: any) => ({
                          ...prev,
                          appointmentDate: '',
                        }));
                      }
                    }}
                    className={`${inputFieldClass} mb-4`}
                  />

                  {/* Time Picker */}
                  <DatePicker
                    selected={
                      selectedTime instanceof Date &&
                      !isNaN(selectedTime.getTime())
                        ? selectedTime
                        : null
                    }
                    onChange={(time) => {
                      if (!time) {
                        // Clear time and related data safely
                        setSelectedTime(null);
                        setFormData((prev) => ({
                          ...prev,
                          time: null,
                          timeSlotID: '',
                        }));
                        setSelectedAppointment((prev: any) => ({
                          ...prev,
                          appointmentTime: '',
                          appointmentDate: '', // Clear date as well if needed
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          time: 'Time is required',
                        }));
                        return;
                      }

                      // Find matching slot based on time.getTime()
                      const matchedSlot = generatedTimeSlots.find(
                        (slot) => slot.time.getTime() === time.getTime(),
                      );

                      // Format time to HH:mm:ss (24-hour format)
                      const formattedTime =
                        time
                          .toLocaleTimeString('en-GB', { hour12: false })
                          .split(':')
                          .slice(0, 2)
                          .join(':') + ':00';

                      if (matchedSlot) {
                        handleTimeSlotSelect(time, matchedSlot.timeSlotID);
                      } else {
                        setSelectedTime(time);
                        setFormData((prev) => ({
                          ...prev,
                          time,
                          timeSlotID: prev.timeSlotID || '',
                        }));
                      }

                      setSelectedAppointment((prev: any) => ({
                        ...prev,
                        appointmentTime: formattedTime,
                        appointmentDate:
                          prev.appointmentDate &&
                          !isNaN(Date.parse(prev.appointmentDate))
                            ? prev.appointmentDate
                            : new Date().toISOString(),
                      }));

                      const timeError = validateField('time', time);
                      setErrors((prev) => ({ ...prev, time: timeError }));
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={slotDuration}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    placeholderText="Appointment Time"
                    includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                    isClearable
                    className={`${inputFieldClass} mb-4 w-full`}
                  />

                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
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



      {/* Modal Backdrop */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h2 className="text-xl font-semibold mb-4">Check Patient</h2>
            <div>
              <input
                type="text"
                placeholder="Enter Phone Number"
                maxLength={10}
                value={mobileNo}
                onChange={(e) => {
                  const value = e.target.value;
                  setMobileNo(value);
                  if (value && !phoneRegex.test(value)) {
                    setPhoneError(
                      'Enter a valid 10-digit phone number starting with 6-9',
                    );
                  } else {
                    setPhoneError('');
                  }
                }}
                className={`w-full mb-3 p-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {phoneError && (
                <p className="text-red-500 text-sm mb-2">{phoneError}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (value && !emailRegex.test(value)) {
                    setEmailError('Enter a valid email address');
                  } else {
                    setEmailError('');
                  }
                }}
                className={`w-full mb-3 p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mb-2">{emailError}</p>
              )}
            </div>
            <button
              onClick={handleCheckPatientClick}
              disabled={
                loading ||
                (!mobileNo && !email) ||
                (mobileNo && phoneError) ||
                (email && emailError)
              }
              className={`w-full bg-gradient-to-b from-[#004A99] to-[#007BFF] 
    hover:from-[#007BFF] hover:to-[#004A99] text-white 
    transition duration-150 ease-out hover:ease-in 
    py-2 px-5 rounded-lg ${
      loading ||
      (!mobileNo && !email) ||
      (mobileNo && phoneError) ||
      (email && emailError)
        ? 'opacity-50 cursor-not-allowed'
        : ''
    }`}
            >
              {loading ? 'Checking...' : 'Check Now'}
            </button>

            {/* Patient Cards */}
            <div className="mt-6 max-h-72 overflow-y-auto space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.patientID}
                  className="border rounded p-4 shadow-sm hover:shadow-md transition"
                >
                  <p>
                    <span className="font-semibold">Name:</span>{' '}
                    {patient.patientName}
                  </p>
                  <p>
                    <span className="font-semibold">DOB:</span>{' '}
                    {new Date(patient.patientDateOfBirth).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Gender:</span>{' '}
                    {patient.patientGender}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    {patient.patientPhoneNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    {patient.patientEmail}
                  </p>
                  <p>
                    <span className="font-semibold">UHID:</span> {patient.uhid}
                  </p>
                </div>
              ))}

              {checkAttempted && !loading && (
                <div className="mt-4 text-center text-gray-600">
                  {patients.length === 0 ? (
                    <p>No patients found, please register.</p>
                  ) : (
                    <p>Please click Enroll.</p>
                  )}
                </div>
              )}
            </div>
            {/* Action Button based on API response */}
            <div className="mt-4 flex justify-between items-center space-x-4">
              {checkAttempted && patients.length === 0 && !loading ? (
                <CustomButton
                  onClick={handleAddPatientClick}
                  className="flex-1"
                >
                  Add New Patient
                </CustomButton>
              ) : (
                checkAttempted &&
                patients.length > 0 &&
                !loading && (
                  <CustomButton
                    className="flex-1"
                    onClick={handleEnrollPatient}
                  >
                    Enroll
                  </CustomButton>
                )
              )}

              <CustomButton
                onClick={() => setIsModalOpen(false)}
                className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
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

export default AppointmentCard;
