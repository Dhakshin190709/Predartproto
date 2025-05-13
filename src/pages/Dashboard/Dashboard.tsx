import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (1).svg';
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
    if (roleName && roleName !== 'Patient') {
      console.log('Calling fetchPatients...');
      fetchPatients();
    }
  }, [roleName]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        'https://predart003-001-site1.anytempurl.com/api/Patient',
      );
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

  const fetchAppointmentsBasedOnRole = async (userID: string, role: string) => {
    setLoading(true);
    setAppointments([]); // Clear previous appointments

    try {
      let apiUrl = '';
      if (role === 'Patient') {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
          console.warn('⚠️ patientID not found in sessionStorage.');
          return;
        }

        apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?PatientID=${patientID}`;
      } else if (role === 'Doctor') {
        const doctorID = sessionStorage.getItem('doctorID');
        if (!doctorID) {
          console.warn('⚠️ doctorID not found in sessionStorage.');
          return;
        }

        apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${doctorID}`;
      } else if (
        ['Reception', 'Medical', 'LABIncharge', 'Cash'].includes(role)
      ) {
        const unitID = sessionStorage.getItem('unitID');
        if (!unitID) {
          console.warn('⚠️ unitID not found in sessionStorage.');
          return;
        }

        apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?HospitalID=${unitID}`;

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
      } else {
        apiUrl = `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment`;
      }

      const apptRes = await fetch(apiUrl);
      const apptData = await apptRes.json();

      // Ensure the response is valid and an array
      if (Array.isArray(apptData)) {
        // Get today's date in local time zone (without the time part)
        const currentDate = new Date();
        const todayStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

        const filteredAppointments = apptData.filter((appointment: any) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          const appointmentDateStr = `${appointmentDate.getFullYear()}-${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}-${appointmentDate.getDate().toString().padStart(2, '0')}`;

          return appointmentDateStr === todayStr;
        });

        setAppointments(filteredAppointments);
        setNoAppointments(filteredAppointments.length === 0); // 👈 Set message flag
      } else {
        setAppointments([]); // Fallback if data isn't valid
        setNoAppointments(true);
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
      alert('Please select an appointment time.');
      return;
    }

    const loggedInUserID = sessionStorage.getItem('userID');
    const role = sessionStorage.getItem('role');
    if (!loggedInUserID) {
      alert('Session expired. Please log in again.');
      return;
    }

    const appointmentDate = selectedAppointment.appointmentDate?.split('T')[0]; // Ensure only YYYY-MM-DD
    const appointmentTime = selectedAppointment.appointmentTime;

    // ✅ Validate both values are present
    if (!appointmentDate || !appointmentTime) {
      alert('Appointment date or time is missing.');
      return;
    }

    // ✅ Optional: Convert time to 24-hour if needed
    const convertTo24HourFormat = (time12h: string): string => {
      if (!time12h.includes(' ')) return time12h; // already 24h

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

    // ✅ Manually build the Date object with date and time
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
      console.error('⛔ Invalid datetime:', { appointmentDate, timeFormatted });
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
      appointmentDate: appointmentDate, // ✔ original date
      appointmentTime: timeFormatted, // ✔ converted time
      statusID:
    roleName === "Doctor"
      ? "82d2585e-3e84-404d-b4c2-08dd57ac7396"
      : selectedAppointment.statusID,
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
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Appointment/${selectedAppointment.appointmentID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error('Failed to update appointment');

      // ✅ Handle JSON or text response safely
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // fallback for plain text like "updated success"
      }

      console.log('✅ Updated:', data);

      toast.success('Appointment updated successfully!');
      setTimeout(() => setIsEditModalOpen(false), 100);
      fetchAppointmentsBasedOnRole(loggedInUserID, role);
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error('Failed to update appointment');
    }
  };

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
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=appointmentstauts',
        );
        // Filter data to only include entries where isActive is true
        if (Array.isArray(response.data?.data)) {
          const activeStatusList = response.data.data.filter(
            (item: any) => item.isActive === true,
          );
          setStatusList(activeStatusList);
        }
      } catch {
        console.error('Failed to fetch status list.');
      }
    };

    fetchStatusList();
  }, []);

  useEffect(() => {
    axios
      .get("https://predart003-001-site1.anytempurl.com/api/Doctor")
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          setDoctors(response.data.data);
        } else {
          console.error("Invalid data format");
        }
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
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

  const handleDoctorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const doctorID = e.target.value;
  setSelectedDoctorID(doctorID);
  setFormData((prev) => ({ ...prev, doctor: doctorID }));

  // ✅ Update selectedAppointment too
  setSelectedAppointment((prev) => ({
    ...prev,
    doctorID,
  }));

  if (!doctorID) return;

  try {
    const timeSlotResponse = await fetch(
      `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
    );
    const timeSlotData = await timeSlotResponse.json();
    const data = Array.isArray(timeSlotData.data) ? timeSlotData.data : [];

    const matchedTimeSlots = data.filter(
      (slot) => String(slot.doctorID) === doctorID,
    );

    if (matchedTimeSlots.length) {
      const formattedSlots = matchedTimeSlots.map((slot) => ({
        timeSlotID: slot.timeSlotID,
        fromTime: slot.fromTime,
        toTime: slot.toTime,
        slotDuration: slot.slotDuration,
        day: slot.dayofWeek,
      }));

      setAvailableTimeSlots(formattedSlots);

      if (selectedDate) {
        handleDateChange(selectedDate, formattedSlots); // Pass updated slots
      }
    } else {
      setAvailableTimeSlots([]);
      setGeneratedTimeSlots([]);
    }
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
};


  const openEditModal = (appointment) => {
    setSelectedDoctor(appointment.doctorID); // Set default doctor ID
    setAppointmentDate(appointment.date); // Set default date
    setSelectedTimeSlot(appointment.timeSlot); // Set default time slot
    setCurrentAppointment(appointment); // Store the current appointment
    setIsEditModalOpen(true); // Open modal
  };

  const handleDateChange = async (
    date: Date | null,
    slots?: TimeSlotType[],
  ) => {
    if (!date) return;

    const localDate = formatLocalDate(date); // "YYYY-MM-DD"
    console.log('Selected Date (Full):', date);
    console.log('Selected Date (Local):', localDate);

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    // ✅ Fix: Also update selectedAppointment's appointmentDate
    setSelectedAppointment((prev) => ({
      ...prev,
      appointmentDate: localDate,
    }));

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('Invalid timeSlots:', timeSlots);
      return;
    }

    const dayOfWeek = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .trim();
    console.log('Selected Day:', dayOfWeek);

    const matchedDaySlots = timeSlots.filter(
      (slot) => slot.day?.toLowerCase().trim() === dayOfWeek.toLowerCase(),
    );

    if (matchedDaySlots.length) {
      try {
        const appointmentResponse = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${selectedDoctorID}&StartDate=${localDate}&EndDate=${localDate}`,
        );
        const appointmentData = await appointmentResponse.json();

        const appointmentList = Array.isArray(appointmentData)
          ? appointmentData
          : [];

        const bookedSlots = appointmentList.map((appointment: any) => ({
          appointmentDate: appointment?.appointmentDate,
          appointmentTime: appointment?.appointmentTime,
        }));

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

        setBookedSlots(bookedSlots);
        setGeneratedTimeSlots(generated);

        setFormData((prev) => ({
          ...prev,
          timeSlotID: matchedDaySlots[0].timeSlotID,
        }));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    } else {
      console.warn(`Doctor is NOT available on ${dayOfWeek}.`);
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

  const formatLocalDate = (date: Date) => {
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
   newDoctorID?: string // ⬅️ Add this
) => {
  const userID = sessionStorage.getItem('userID');
  if (!userID) {
    alert('User not logged in. Please log in again.');
    return;
  }

  const appointment = appointments.find(
    (appt) => appt.appointmentID === appointmentID
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
    const response = await axios.post(
      'https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentStatus',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
  setAppointments((prevAppointments) =>
    prevAppointments.map((appt) =>
      appt.appointmentID === appointmentID
        ? { ...appt, statusID: newStatusID }
        : appt
    )
  );

  // ✅ Reset modals and state
  setShowReasonModal(false);
  setShowDoctorDropdown(false);
  setReasonText('');
  setSelectedNewDoctorID('');

  // ✅ Toast or alert
  alert('Status updated successfully');
}
 else {
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
      toast.error('Please select at least one filter.');
      return;
    }

    setLoading(true);
    setAppointments([]);

    try {
      let apiUrl =
        'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?';
      const queryParams = [];

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
        queryParams.push(`HospitalID=${unitID}`);
      }

      if (roleName === 'Doctor' || roleName === 'Reception') {
        const doctorID = sessionStorage.getItem('doctorID');
        if (!doctorID && roleName === 'Doctor') {
          alert('Doctor ID is missing. Please login again.');
          setLoading(false);
          return;
        }

        if (roleName === 'Doctor') {
          queryParams.push(`DoctorID=${doctorID}`);
        }

        // Use PatientName instead of PatientID
        if (selectedPatientID) {
          queryParams.push(
            `PatientName=${encodeURIComponent(selectedPatientID.trim())}`,
          );
        }
      } else if (roleName === 'Patient') {
        const patientID = sessionStorage.getItem('patientID');
        if (!patientID) {
          alert('Patient ID is missing. Please login again.');
          setLoading(false);
          return;
        }
        queryParams.push(`PatientID=${patientID}`);

        if (selectedDoctorID) {
          queryParams.push(`DoctorID=${selectedDoctorID}`);
        }
      } else {
        // Admin or other roles
        if (selectedPatientID) {
          queryParams.push(`PatientID=${selectedPatientID}`);
        }
      }

      if (selectedStatusID) {
        queryParams.push(`StatusID=${selectedStatusID}`);
      }

      if (fromTime) {
        const formattedStart = formatLocalDateTime(fromTime);
        queryParams.push(`StartDate=${encodeURIComponent(formattedStart)}`);
      }

      if (toTime) {
        const formattedEnd = formatLocalDateTime(toTime, true);
        queryParams.push(`EndDate=${encodeURIComponent(formattedEnd)}`);
      }

      apiUrl += queryParams.join('&');
      console.log('Final API URL:', apiUrl);

      const response = await fetch(apiUrl);
      const result = await response.json();

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

  return (
    <div className="p-4">
      {/* Wrap both in a common column grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ml-5">
        <div className="flex items-center gap-x-4 mb-4">
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
            <input
              type="text"
              placeholder="Enter Patient Name"
              value={selectedPatientID}
              onChange={(e) => setSelectedPatientID(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
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
                : new Date().toISOString().split('T')[0]; // Set min to From Date if available, else today
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
              setSelectedStatusID(''); // Reset the status field
              fetchAppointmentsBasedOnRole(userID, roleName);
            }}
            className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
          >
            Reset
          </CustomButton>
        </div>
      </div>

      <ToastContainer position="top-right" />
      {/* Render message only if not loading and no appointments exist */}

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
  } else if (status === '71cb1b67-af86-48f0-b4c5-08dd57ac7396') {
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
  className="bg-blue-500 text-white px-4 py-2 rounded"
  onClick={() =>
    handleStatusChange(
      selectedAppointmentId,
      selectedStatus,
      reasonText ,// ✅ This can be empty
       selectedNewDoctorID
    )
  }
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
                    min={new Date().toISOString().split('T')[0]}
                    value={
                      selectedAppointment.appointmentDate &&
                      !isNaN(Date.parse(selectedAppointment.appointmentDate))
                        ? selectedAppointment.appointmentDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    className={`${inputFieldClass} mb-4`}
                  />

                  <DatePicker
                    selected={selectedTime}
                    onChange={(time) => {
                      if (!time) return;

                      const matchedSlot = generatedTimeSlots.find(
                        (slot) => slot.time.getTime() === time.getTime(),
                      );

                      console.log('Matched Slot:', matchedSlot);

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
    </div>
  );
};

export default AppointmentCard;
