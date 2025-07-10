import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import emailIcon from '../../images/icon/Email.svg';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (1).svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HospitalIcon from '../../images/icon/Hospital solid (2).svg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import {
  FaUserAlt,
  FaPhoneAlt,
  FaGenderless,
  FaEnvelope,
  FaMars,
  FaVenus,
  FaMapMarkerAlt,
  FaDirections,
} from 'react-icons/fa';
import api from '../../api/request';

interface RowData {
  id: number;
  patientName: string;
  patientId: string; // Appointment ID
  mobileNumber: string; // Mobile Number
  fromDate: string; // From Date
  toDate: string; // To Date
  patientDateOfBirth: number;
}

interface PatientData {
  patientName: string;
  patientGender: string;
  patientPhoneNumber: string;
  patientEmail: string;
  patientDateOfBirth: number;
}

const SearchPatient: React.FC = () => {
  const [formData, setFormData] = useState({
    relationship: '',
    // name: patientName || "",
    timeSlotID: '',
    phoneNumber: '',
    patientName: '',
    hospital: '',
    doctor: '',
    reason: '',
    date: null as Date | null,
    time: null as Date | null,
  });

  const [errors, setErrors] = useState({
    relationship: '',
    // name: patientName || "",
    // phoneNumber: phoneNumber || "",
    hospital: '',

    doctor: '',
    reason: '',
    date: '',
    time: '',
  });
  const [slotDuration, setSlotDuration] = useState(5); // Default slot duration, adjust as necessary
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  const [rowData, setRowData] = useState<RowData[]>([]); // Data to be displayed in the table
  const [filteredData, setFilteredData] = useState<RowData[]>([]); // Data filtered based on table search
  const [patientData, setPatientData] = useState<PatientData[]>([]); // Patient data for the new card section
  const [quickSearchText, setQuickSearchText] = useState(''); // For global search
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hospitalDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedHospitalID, setSelectedHospitalID] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [toastInProgress, setToastInProgress] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<
    { appointmentDate: string; appointmentTime: string }[]
  >([]);
  const [uhid, setUhid] = useState('');

  const [patientName, setPatientName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const navigate = useNavigate();

  const [relationships, setRelationships] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [appointmentType, setAppointmentType] = useState(''); // Initialize it with a default value or fetch it if necessary.

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const doctorDropdownRef = useRef<HTMLUListElement>(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [doctorID, setDoctorID] = useState<string | null>(null);
  const [selectedDoctorID, setSelectedDoctorID] = useState(null);
  const [hospitals, setHospitals] = useState([]); // Ensure default state is an array
  const [doctors, setDoctors] = useState([]); // Ensure default state is an array

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
    null,
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // To manage loading state

  const getGenderIcon = (gender: string) => {
    const lowerGender = gender?.toLowerCase();

    if (lowerGender === 'male' || lowerGender === 'm') {
      return <FaMars className="text-white" />;
    } else if (lowerGender === 'female' || lowerGender === 'f') {
      return <FaVenus className="text-white" />;
    } else {
      return <FaGenderless className="text-white" />;
    }
  };

  const handleUhidChange = (value: string) => {
    const digitOnlyRegex = /^\d{0,9}$/;

    if (digitOnlyRegex.test(value)) {
      setUhid(value);
      setErrors((prev) => ({ ...prev, uhid: '' }));
    } else {
      setUhid(value); // Optional: keep this if you still want to show the invalid input
      setErrors((prev) => ({
        ...prev,
        uhid: 'UHID must contain only numbers and be up to 9 digits.',
      }));
    }
  };

  const handleBookNow = (patient: PatientData) => {
    if (!patient) {
      console.error('Patient details are missing!');
      return;
    }

    // Store patient info in sessionStorage
    sessionStorage.setItem('patientID', patient.patientID);
    sessionStorage.setItem('patientPhoneNumber', patient.patientPhoneNumber);

    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && selectedPatient) {
      setFormData({
        doctor: '',
        timeSlotID: '',
        date: '',
        time: '',
        reason: '',
      });
      setSelectedDoctorID('');
      setSelectedHospitalID('');
      setSelectedDate(null);
      setSelectedTime(null);
      setErrors({});
    }
  }, [isModalOpen, selectedPatient]); // Runs every time modal opens with a new patient

  const fetchPatients = async () => {
  setLoading(true);
  try {
    const tenantID = sessionStorage.getItem('tenantID');
    const roleName = sessionStorage.getItem('roleName');

    let url = '/Patient';

    // Only add tenantID if NOT SuperAdmin
    if (roleName !== 'SuperAdmin') {
      if (!tenantID) {
        console.error('tenantID not found in session storage');
        setPatientData([]);
        return;
      }
      url += `?tenantID=${tenantID}`;
    }

    const response = await api.get(url);
    const result = response.data;

    if (result.success && Array.isArray(result.data)) {
      setPatientData(result.data);
    } else {
      console.error('Invalid data format:', result);
      setPatientData([]);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    setPatientData([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPatients();
}, []);


 useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const response = await api.get('/Hospital/HospitalsList');
      const result = response.data;

      // Filter only active hospitals
      const activeHospitals = Array.isArray(result)
        ? result.filter((hospital) => hospital.isActive)
        : [];

      setHospitals(activeHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const roleName = sessionStorage.getItem('roleName');

  if (['Doctor', 'SuperAdmin','Reception','HospitalAdmin','TenantAdmin'].includes(roleName)) {
    console.log(`Skipping hospital fetch for ${roleName}`);
    return; // Skip API call
  }

  fetchHospitals();
}, []);

  const handlePatientNameChange = (value: string) => {
    const nameRegex = /^[A-Za-z][A-Za-z0-9]{0,19}$/;
    const repeatedNumberPattern = /(\d)\1{5,}/; // detects 6+ repeated digits like 000000

    setPatientName(value);

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        patientName: 'Patient Name is required',
      }));
    } else if (!nameRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        patientName:
          'Only letters and numbers allowed, must start with a letter, max 20 characters',
      }));
    } else if (repeatedNumberPattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        patientName: 'Do not use repetitive numbers like 000000 or 111111',
      }));
    } else {
      setErrors((prev) => ({ ...prev, patientName: '' }));
    }
  };

  const handleMobileNoChange = (value: string) => {
    const regex = /^[6-9][0-9]{0,9}$/; // starts with 6-9, up to 10 digits
    if (regex.test(value) || value === '') {
      setMobileNo(value);
      if (value.length === 10) {
        setErrors((prev) => ({ ...prev, mobileNo: '' }));
      } else {
        setErrors((prev) => ({
          ...prev,
          mobileNo: 'Mobile number must be 10 digits',
        }));
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        mobileNo:
          'Invalid mobile number. Must start with 6–9 and have 10 digits',
      }));
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospitalID) {
        setFilteredDoctors([]);
        return;
      }

      try {
        const response = await api.get(
          `/Doctor?hospitalId=${selectedHospitalID}`,
        );
        const result = response.data;

        if (result.success && Array.isArray(result.data)) {
          setDoctors(result.data);
          setFilteredDoctors(result.data);
        } else {
          console.error('Invalid doctor data format:', result);
          setDoctors([]);
          setFilteredDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [selectedHospitalID]);

  // useEffect(() => {
  //   if (selectedHospitalID) {
  //     const filtered = doctors.filter(
  //       (doctor) => doctor.hospitalID === selectedHospitalID,
  //     );
  //     setFilteredDoctors(filtered);
  //   } else {
  //     setFilteredDoctors([]);
  //   }
  // }, [selectedHospitalID, doctors]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching
  }
  // Function to calculate age from Date of Birth
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A'; // If DOB is missing, return "N/A"
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} yrs`; // Return age in years
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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

  const filterHospitals = (text: string) => {
    setSearchText(text);
    setFilteredHospitals(
      hospitalList.filter((hospital) =>
        hospital.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowHospitalDropdown(true);
  };

  // Apply the global search filter to the data
  const applyGlobalSearch = (data: RowData[]) => {
    return data.filter(
      (row) =>
        row.patientName.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.patientId.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.mobileNumber
          .toLowerCase()
          .includes(quickSearchText.toLowerCase()) ||
        row.fromDate.toLowerCase().includes(quickSearchText.toLowerCase()) ||
        row.toDate.toLowerCase().includes(quickSearchText.toLowerCase()),
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');
    const patientID = sessionStorage.getItem('patientID');
    const phoneNumber = sessionStorage.getItem('patientPhoneNumber');

    if (!userID || !patientID) {
      toast.error('User or Patient not logged in. Please log in again.');
      return;
    }

    const newErrors = {
      hospital: validateField('hospital', selectedHospitalID),
      doctor: validateField('doctor', formData.doctor),
      reason: validateField('reason', formData.reason),
      date: validateField('date', formData.date),
      time: validateField('time', formData.time),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        const appointmentTimeFormatted = formData.time
          ? convertTo24HourFormat(formData.time)
          : '00:00:00';

        const formatDateYYYYMMDD = (dateString: string) => {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = `0${date.getMonth() + 1}`.slice(-2);
          const day = `0${date.getDate()}`.slice(-2);
          return `${year}-${month}-${day}`;
        };

        const payload = {
          createdBy: userID,
          isActive: true,
          doctorID: formData.doctor,
          patientID: patientID,
          timeSlotID: formData.timeSlotID,
          appointmentDate: formData.date
            ? formatDateYYYYMMDD(formData.date)
            : null,
          appointmentTime: appointmentTimeFormatted,
          statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
          notes: formData.reason?.trim() || 'No additional notes',
          toWhom: 'ae34b43e-74cf-4328-7794-08dd561d6477',
          relationShip: 'ae34b43e-74cf-4328-7794-08dd561d6477',
          phoneNumber: phoneNumber, // ✅ Use stored phone number here
        };

        const response = await api.post('/Appointment', payload);

        if (response.status >= 200 && response.status < 300) {
          const message =
            response.data?.message || 'Appointment booked successfully!';
          toast.success(message);
          resetForm(); // Reset form after successful submission
          setIsModalOpen(false);
        } else {
          const message =
            response.data?.message || 'Submission failed. Please try again.';
          toast.error(message);
        }
      } catch (error) {
        console.error('Error during submission:', error);
        toast.error('An error occurred. Please try again later.');
      }
    } else {
      toast.warning('Please fix the highlighted errors before submitting.');
    }
  };

  // Assuming you have a resetForm function that resets the form state
  const resetForm = () => {
    setFormData({
      doctor: '',
      reason: '',
      date: '',
      time: '',
      phoneNumber: '',
      // Add other fields as necessary
    });

    setSelectedHospitalID(''); // Reset hospital dropdown
    setErrors({}); // Clear any validation errors
  };

  // Function to filter doctors based on user input
  const filterDoctors = (text: string) => {
    setDoctorSearchText(text);
    setFilteredDoctors(
      doctorList.filter((doctor) =>
        doctor.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowDoctorDropdown(true);
  };
  const selectHospital = (hospital: string) => {
    setFormData((prevData) => ({
      ...prevData,
      hospital,
    }));
    setShowHospitalDropdown(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      hospital: '', // Clear error on valid selection
    }));
  };

  // Select a doctor from the dropdown
  const selectDoctor = (doctor: string) => {
    setFormData((prevData) => ({
      ...prevData,
      doctor,
    }));
    setShowDoctorDropdown(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      doctor: '', // Clear error on valid selection
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'relationship' && value.length > 0) {
      setShowSuggestions(true);
      setFilteredRelationships(
        relationships.filter((relation) =>
          relation.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setShowSuggestions(false);
    }

    if (name === 'hospital') {
      filterHospitals(value);
    }

    if (name === 'doctor') {
      filterDoctors(value);
    }
    // Validate the field
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleDoctorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));

    if (!doctorID) return;

    try {
      const timeSlotResponse = await api.get(`/Doctor/GetDoctorTimeSlot`, {
        params: { doctorId: doctorID },
      });
      const timeSlotData = timeSlotResponse.data;
      console.log('Fetched Time Slot Data:', timeSlotData);

      const data = Array.isArray(timeSlotData.data) ? timeSlotData.data : [];
      console.log('Processed Time Slot Data:', data);

      const matchedTimeSlots = data.filter(
        (slot) => String(slot.doctorID) === doctorID,
      );

      console.log('Matched Time Slots:', matchedTimeSlots);

      if (matchedTimeSlots.length) {
        const formattedSlots = matchedTimeSlots.map((slot) => ({
          timeSlotID: slot.timeSlotID,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          slotDuration: slot.slotDuration,
          day: slot.dayofWeek,
        }));

        setAvailableTimeSlots(formattedSlots);
        console.log('Formatted Slots:', formattedSlots);

        if (selectedDate) {
          handleDateChange(selectedDate, formattedSlots); // Pass updated slots
        }
      } else {
        console.warn('No matching time slots found for this doctor.');
        setAvailableTimeSlots([]);
        setGeneratedTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
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
      console.log('Doctor is available on this date based on their schedule.');

      try {
        const appointmentResponse = await api.get(
          '/Appointment/GetAppointment',
          {
            params: { DoctorID, StartDate, EndDate },
          },
        );
        const appointmentData = appointmentResponse.data;

        console.log('Raw Appointment Data:', appointmentData);

        const appointmentList = Array.isArray(appointmentData)
          ? appointmentData
          : [];

        const bookedSlots = appointmentList.map((appointment: any) => ({
          appointmentDate: appointment?.appointmentDate,
          appointmentTime: appointment?.appointmentTime,
        }));

        console.log('Booked Slots:', bookedSlots);

        // ✅ Generate time slots using the fetched bookedSlots
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

        setBookedSlots(bookedSlots); // store after use
        setGeneratedTimeSlots(generated); // set available slots

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

 const handleSearch = async () => {
  if (!uhid && !patientName && !mobileNo) {
    if (!toastInProgress) {
      setToastInProgress(true);
      toast.warning('Please enter any one field.', {
        onClose: () => setToastInProgress(false),
      });
    }
    return;
  }

  const tenantID = sessionStorage.getItem('tenantID');
  const roleName = sessionStorage.getItem('roleName');

  // For non-SuperAdmin, tenantID must exist
  if (roleName !== 'SuperAdmin' && !tenantID) {
   if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Tenant ID not found. Please log in again.', {
        onClose: () => setToastInProgress(false),
      });
    }
    return;
  }
  try {
    const params: Record<string, string> = {};

    // For non-SuperAdmin, add tenantID
    if (roleName !== 'SuperAdmin') {
      params.tenantID = tenantID!;
    }

    // Add filters if provided
    if (uhid) params.UHID = uhid;
    if (patientName) params.PatientName = patientName;
    if (mobileNo) params.MobileNo = mobileNo;

    const response = await api.get('/Patient', { params });

    console.log('Search Results:', response.data);

    if (response.data?.data?.length > 0) {
      setPatientData(response.data.data);
    } else {
      setPatientData([]);
    }
  } catch (error) {
    console.error('Error fetching patient data:', error);
    if (!toastInProgress) {
      setToastInProgress(true);
      toast.error('Error fetching patient data.', {
        onClose: () => setToastInProgress(false),
      });
    }
    setPatientData([]);
  }
};

 const handleReset = () => {
  setPatientName('');
  setMobileNo('');
  setUhid(''); // ✅ Clear UHID too
  fetchPatients();
};

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Search Patients
      </h1>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex gap-4 flex-col mb-4">
        <div className="flex gap-4 flex-wrap items-start">
          {/* UHID Input */}
          <div className="flex flex-col w-full md:w-[30%]">
            <input
              type="text"
              value={uhid}
              maxLength={10}
              onChange={(e) => handleUhidChange(e.target.value)}
              placeholder="Enter UHID"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.uhid && (
              <div className="text-red-500 text-sm mt-1">{errors.uhid}</div>
            )}
          </div>
          {/* Patient Name Input */}
          <div className="flex flex-col w-full md:w-[30%]">
            <input
              type="text"
              value={patientName}
              maxLength={30}
              onChange={(e) => handlePatientNameChange(e.target.value)}
              placeholder="Enter Patient Name"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.patientName && (
              <div className="text-red-500 text-sm mt-1">
                {errors.patientName}
              </div>
            )}
          </div>

          {/* Mobile Number Input */}
          <div className="flex flex-col w-full md:w-[30%]">
            <input
              type="text"
              value={mobileNo}
              onChange={(e) => handleMobileNoChange(e.target.value)}
              placeholder="Enter Mobile Number"
              maxLength={10}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.mobileNo && (
              <div className="text-red-500 text-sm mt-1">{errors.mobileNo}</div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-7 rounded-lg mt-4 md:mt-0"
          >
            Search
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-7 rounded-lg mt-4 md:mt-0
        border-gray-300 opacity-80 hover:opacity-100 flex items-center gap-1"
          >
            Reset
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        List of patients
      </h1>

      <div className="mt-6 w-full">
        {patientData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patientData
              .filter((patient) => patient && patient.patientName) // basic check
              .map((patient, index) => {
                const gender = patient.patientGender?.toLowerCase();
                const isFemale = gender === 'female' || gender === 'f';

                const borderColorClass = isFemale
                  ? 'border-pink-300'
                  : 'border-blue-300';
                const bgColorClass = isFemale ? 'bg-pink-200' : 'bg-blue-200';

                return (
                  <div
                    key={index}
                    className={`relative border-2 ${borderColorClass} rounded-xl shadow bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg`}
                  >
                    {/* Gender Badge */}
                    <div
                      className={`absolute top-0 left-0 ${bgColorClass} w-10 h-10 rounded-br-md flex items-center justify-center`}
                    >
                      <span className="text-white text-lg">
                        {getGenderIcon(patient.patientGender)}
                      </span>
                    </div>

                    {/* Top Right: Book Now Button */}
                    {!['Doctor', 'HospitalAdmin','SuperAdmin','Reception','TenantAdmin'].includes(
                      sessionStorage.getItem('roleName') || '',
                    ) && (
                      <div className="flex justify-end mt-2 mr-2">
                        <button
                          className="bg-blue-300 text-white px-4 py-1 rounded-md hover:bg-blue-400 transition"
                          onClick={() => handleBookNow(patient)}
                        >
                          Book Now
                        </button>
                      </div>
                    )}

                    {/* Second Row: Name | Age */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 text-sm font-medium text-gray-800 ml-2">
                      <div className="flex items-center space-x-1 max-w-full">
                        <img
                          src={patientIcon}
                          alt="Patient"
                          className="w-5 h-6 rounded-full"
                        />
                        <span className="text-black shrink-0">Name:</span>
                        <span
                          title={patient.patientName}
                          className="truncate max-w-[160px] text-black"
                        >
                          {patient.patientName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 max-w-full">
                        <img
                          src={HospitalIcon}
                          alt="calendar"
                          className="w-6 h-6"
                        />
                        <span className="text-black">UHID:</span>
                        <span className="text-black">
                          {patient.uhid || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Third Row: Phone | Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm font-medium text-gray-800 ml-2 mb-4">
                      <div className="flex items-center space-x-1 max-w-full">
                        <img src={PhoneIcon} alt="phone" className="w-5 h-5" />
                        <span className="text-black">Phone:</span>
                        <span className="text-black">
                          {patient.patientPhoneNumber}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 max-w-full">
                        <img
                          src={emailIcon}
                          alt="Email"
                          className="w-5 h-6 rounded-full"
                        />
                        <span className="text-black shrink-0">Email:</span>
                        <a
                          href={`mailto:${patient.patientEmail}`}
                          title={patient.patientEmail}
                          className="text-black hover:underline truncate max-w-[160px]"
                        >
                          {patient.patientEmail}
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-end mb-2 mr-2">
                      <button
                        onClick={() =>
                          navigate('/ProfilePatient', {
                            state: {
                              patientID: patient.patientID,
                              patientName: patient.patientName,
                            },
                          })
                        }
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        View More Profile Info
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No patients found</p>
        )}
      </div>

      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-lg font-semibold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              {/* Name & Phone (Non-editable, same row) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-stroke bg-gray-100 py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={selectedPatient.patientName}
                    readOnly
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-stroke bg-gray-100 py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={selectedPatient.patientPhoneNumber}
                    readOnly
                  />
                </div>
              </div>

              {/* HP & Doctor (Editable, same row) */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div>
                  <select
                    name="hospital"
                    value={selectedHospitalID}
                    onChange={(e) => setSelectedHospitalID(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital) => (
                      <option
                        key={hospital.hospitalID}
                        value={hospital.hospitalID}
                      >
                        {hospital.hospitalName}
                      </option>
                    ))}
                  </select>
                  {errors.hospital && (
                    <p className="text-red-500 text-sm">{errors.hospital}</p>
                  )}
                </div>
                <div>
                  <select
                    name="doctor"
                    value={selectedDoctorID}
                    onChange={handleDoctorChange}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Doctor</option>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <option key={doctor.doctorID} value={doctor.doctorID}>
                          {doctor.doctorName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </select>
                  {errors.doctor && (
                    <p className="text-red-500 text-sm">{errors.doctor}</p>
                  )}
                </div>
              </div>

              {/* Additional Notes (Textarea) */}
              <div className="mt-4">
                <textarea
                  name="reason"
                  placeholder="Enter your text here..."
                  value={formData.reason}
                  maxLength={200}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
           text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
                {errors.reason && (
                  <p className="text-red-500 text-sm">{errors.reason}</p>
                )}
              </div>

              {/* Date & Time (Same Row) */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => handleDateChange(date)}
                    placeholderText="Appointment Date"
                    minDate={new Date()}
                    className="w-full rounded-lg border border-stroke bg-gray-100 py-4 pl-6 pr-19
                    text-black outline-none focus:border-primary dark:border-form-strokedark
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {/* <img
                    src={CalendarIcon}
                    alt="Calendar Icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70 pointer-events-none"
                  /> */}
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}
                </div>
                <div>
                  <DatePicker
                    selected={selectedTime}
                    onChange={(time) => {
                      if (!time) return;

                      const matchedSlot = generatedTimeSlots.find(
                        (slot) => slot.time.getTime() === time.getTime(),
                      );

                      console.log('Matched Slot:', matchedSlot);

                      if (matchedSlot) {
                        handleTimeSlotSelect(time, matchedSlot.timeSlotID);
                      } else {
                        setSelectedTime(time);

                        // Only update formData.timeSlotID if matchedSlot is found, otherwise keep it as is
                        setFormData((prev) => ({
                          ...prev,
                          time,
                          timeSlotID: prev.timeSlotID || '', // Keep existing timeSlotID if it's already set, else clear it
                        }));

                        const timeError = validateField('time', time);
                        setErrors((prev) => ({ ...prev, time: timeError }));
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={slotDuration}
                    timeCaption="Time"
                    dateFormat="HH:mm" // 24-hour format
                    placeholderText="Appointment Time"
                    className="w-full rounded-lg border border-stroke bg-gray-100 py-4 pl-6 pr-19
                    text-black outline-none focus:border-primary dark:border-form-strokedark
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                    includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}

              <div className="flex justify-between items-center mt-4">
                {/* Cancel Button - Aligned Left */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#d4d4d4] text-white py-2 px-4 rounded shadow-none hover:bg-[#808080] border border-[#d4d4d4]"
                >
                  Cancel
                </button>

                {/* Confirm Button - Aligned Right with Blue Gradient */}
                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SearchPatient;
