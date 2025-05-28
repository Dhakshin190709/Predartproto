import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchHospitalAPI } from '../../Utils';
import HospitalIcon from '../../images/icon/Hospital solid (2).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import EmailIcon from '../../images/icon/Email.svg';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FaMapMarkerAlt, FaEnvelope, FaDirections } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import {
  FaLandmark,
  FaBuilding,
  FaHospital,
  FaClock,
  FaHospitalUser,
  FaPlusSquare,
} from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';
import api from '../../api/request';
interface AppLOVOption {
  appLOVID: string;
  name: string;
}

const getHospitalIcon = (type) => {
  if (!type) return <FaHospitalUser className="text-gray-500 text-2xl" />; // Default icon for undefined type

  switch (type.toLowerCase()) {
    case 'government':
      return <FaLandmark className="text-blue-500 text-2xl" />; // Town hall style for Government hospitals
    case 'private':
      return <FaBuilding className="text-purple-500 text-2xl" />; // Office-style icon for Private hospitals
    case 'clinic':
      return <FaHospital className="text-orange-500 text-2xl" />; // Standard hospital icon for Clinics
    case '24/7':
      return <FaClock className="text-green-500 text-2xl" />; // Clock icon for 24/7 hospitals
    case 'multispeciality':
      return <FaPlusSquare className="text-red-500 text-2xl" />; // Medical cross icon for Multi-speciality hospitals
    default:
      return <FaHospitalUser className="text-blue-500 text-2xl" />; // Default hospital user icon
  }
};

const HospitalCards = () => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    hospitalType: '',
    hospitalName: '',

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
  const [slotDuration, setSlotDuration] = useState(10); // Default slot duration, adjust as necessary
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  const location = useLocation();
  const today = new Date();
  // State declaration
  const [hospitals, setHospitals] = useState([]);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitalResults, setHospitalResults] = useState([]);
  const [isSelf, setIsSelf] = useState(false);
  const [isOthers, setIsOthers] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const hospitalNameFromQuery = queryParams.get('hospital');
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [bookedSlots, setBookedSlots] = useState<
    { appointmentDate: string; appointmentTime: string }[]
  >([]);
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [showFullAddress, setShowFullAddress] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [patientData, setPatientData] = useState({ name: '', phoneNumber: '' });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [selectedHospitalID, setSelectedHospitalID] = useState(null);

  const [relationships, setRelationships] = useState([]);

  const [searchText, setSearchText] = useState('');

  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);

  const [appointmentType, setAppointmentType] = useState(''); // Initialize it with a default value or fetch it if necessary.

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<string[]>([]);

  const [successMessage, setSuccessMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const doctorDropdownRef = useRef<HTMLUListElement>(null);

  const [doctors, setDoctors] = useState([]); // Ensure default state is an array

  const [selectedDoctorID, setSelectedDoctorID] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    phoneNumber: '',
    doctor: '',
    notes: '',
    appointmentDate: '',
  });

  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName');
    setRoleName(storedRole);
    console.log('Retrieved role:', storedRole);
  }, []);
  //fetch hp from utils
  useEffect(() => {
    const getHospitalTypes = async () => {
      const types = await fetchHospitalAPI();
      setHospitalTypes(types);
    };

    getHospitalTypes();
  }, []);

  const handleOptionChange = (selectedOption: AppLOVOption) => {
    setAppointmentType(selectedOption.appLOVID); // ✅ Store the ID
    console.log(
      `Selected: ${selectedOption.name}, appLOVID: ${selectedOption.appLOVID}`,
    );
  };

  const fetchRelationships = async () => {
    try {
      const response = await api.get('/AppLOV', {
        params: {
          type: 'Relationship',
        },
      });

      console.log('API Response:', response.data); // Check the response structure

      if (Array.isArray(response.data.data)) {
        setRelationships(response.data.data);
      } else {
        console.error('Invalid relationship data format:', response.data.data);
        setRelationships([]);
      }
    } catch (error) {
      console.error('Error fetching relationships:', error);
      setRelationships([]);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchRelationships();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get('/AppLOV', {
          params: { type: 'toWhom' },
        });

        console.log('API Response:', response.data);
        setOptions(response.data?.data ?? []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

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

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/Doctor');

      if (response.data.success && Array.isArray(response.data.data)) {
        setDoctors(response.data.data);
      } else {
        console.error('Invalid doctor data format:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Auto-select hospital from query when hospitals are loaded
  useEffect(() => {
    if (hospitalNameFromQuery && hospitals.length > 0) {
      const matchingHospital = hospitals.find(
        (hospital) =>
          hospital.hospitalName.toLowerCase() ===
          hospitalNameFromQuery.toLowerCase(),
      );
      if (matchingHospital) {
        setSelectedHospitalID(matchingHospital.hospitalID);
      }
    }
  }, [hospitals, hospitalNameFromQuery]);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/Hospital/List');

      console.log('API Response:', response.data); // Verify response format

      if (Array.isArray(response.data)) {
        const hospitalData = response.data.map((hospital) => ({
          hospitalID: hospital.hospitalID || '',
          tenantID: hospital.tenantID || '',
          hospitalName: hospital.hospitalName || 'Unknown Hospital',
          hospitalCode: hospital.hospitalCode || '',
          hospitalType: hospital.hospitalType || 'Unknown Type',
          email: hospital.email || '',
          mobile: hospital.mobile || '',
          landline: hospital.landline || '',
          gst: hospital.gst || '',

          isActive: hospital.isActive ?? false,
        }));

        setHospitals(hospitalData);
      } else {
        console.error('Invalid hospital data format:', response.data);
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!appointmentType && options.length > 0) {
      const defaultOption = options.find((opt) => opt.name === 'Self');
      if (defaultOption) {
        setAppointmentType(defaultOption.appLOVID);
        handleOptionChange(defaultOption); // optional
      }
    }
  }, [options]);

  useEffect(() => {
    if (selectedHospitalID) {
      const filtered = doctors.filter(
        (doctor) => doctor.hospitalID === selectedHospitalID,
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedHospitalID, doctors]);

  const toggleAddress = (index) => {
    setShowFullAddress((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const newErrors = {
      name: validateField('name', formData.name),
      relationship: validateField('relationship', selectedRelationship),
      hospital: validateField('hospital', selectedHospitalID),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      doctor: validateField('doctor', formData.doctor),
      reason: validateField('reason', formData.reason),
      date: validateField('date', formData.date),
      time: validateField('time', formData.time),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        const patientRes = await api.get('/Patient/GetPatientByUserID', {
          params: { userId: userID },
        });
        const patientData = patientRes.data;

        const patientID = patientData?.data?.patientID;

        if (!patientID) {
          toast.error('Patient ID not found for the logged-in user.');
          return;
        }

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
        console.log('Form Data:', formData);
       const payload = {
  createdBy: userID,
  isActive: true,
  doctorID: formData.doctor,
  patientID: patientID,
  hospitalID: selectedHospitalID,      // <-- Add this line
  timeSlotID: formData.timeSlotID,     // Pass this correctly
  appointmentDate: formData.date
    ? formatDateYYYYMMDD(formData.date)
    : null,
  appointmentTime: appointmentTimeFormatted,
  statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
  notes: formData.reason?.trim() || 'No additional notes',
  toWhom: appointmentType,
  relationShip: selectedRelationship,
  phoneNumber: formData.phoneNumber || '',
  appointmentNumber: 0,  // <-- Add this line
  tokenNumber: 0         // <-- Add this line
};


        const response = await api.post('/Appointment', payload);
        const responseData = response.data;

        if (response) {
          const message =
            responseData?.message || 'Appointment booked successfully!';
          toast.success(message);
          console.log('Form Submitted:', payload);
          resetForm();
          setShowModal(false);
        } else {
          const message =
            responseData?.message || 'Submission failed. Please try again.';
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

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phoneNumber: '',
      doctor: '',
      reason: '',
      date: '',
      time: '',
      timeSlotID: '',
    });
    setSelectedRelationship('');
    setAppointmentType('');
    setSelectedHospitalID('');
    setSelectedDoctorID('');
    setSelectedDate(null);
    setSelectedTime(null);
    setErrors({});
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim values directly here and check if they are non-empty
    const hospitalName = formData.hospitalName.trim();
    const hospitalType = formData.hospitalType.trim();

    // If both fields are empty, show a warning
    if (!hospitalName && !hospitalType) {
      toast.warning('Please select or enter at least one field to search.');
      return;
    }

    // Construct the query string dynamically
    const queryParams = new URLSearchParams();
    if (hospitalName) queryParams.append('hospitalName', hospitalName); // If hospitalName is not empty
    if (hospitalType) queryParams.append('hospitalType', hospitalType); // If hospitalType is not empty

    try {
      const res = await api.get('/Hospital/List', {
        params: {
          hospitalName: hospitalName || undefined,
          hospitalType: hospitalType || undefined,
        },
      });

      const data = res.data;

      console.log('Search Results:', data);
      setHospitals(data); // Set the fetched hospital data
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while searching.');
    }
  };

  // ✅ Handle Book Now

  const handleBookNow = (hospitalID: string) => {
    setSelectedHospitalID(hospitalID);
    fetchDoctors(hospitalID); // ✅ Use hospitalID instead of undefined hospitalName
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHospital(null);
    setAppointmentData({
      patientName: '',
      phoneNumber: '',
      doctor: '',
      notes: '',
      appointmentDate: '',
    });
  };

  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time, // ✅ Keep time as Date
      timeSlotID,
    }));
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDoctorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));

    if (!doctorID) return;

    try {
      // Fetch the time slots for the selected doctor using the correct API
      const timeSlotResponse = await api.get('/Doctor/GetDoctorTimeSlot', {
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
            params: {
              DoctorID: selectedDoctorID,
              StartDate: localDate,
              EndDate: localDate,
            },
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

  const handleReset = () => {
    setFormData({ hospitalName: '', hospitalType: '' });
    fetchHospitals(); // Re-fetch all hospitals
  };
  useEffect(() => {
    const selectedOption = options.find(
      (opt) => opt.appLOVID === appointmentType,
    );

    if (selectedOption?.name === 'Self') {
      setIsSelf(true);
      setIsOthers(false);

      setFormData((prev) => ({
        ...prev,
        name: patientData.name, // ✅ refill from stored patient data
        phoneNumber: patientData.phoneNumber,
        relationship: selectedOption.appLOVID,
      }));
      setSelectedRelationship(selectedOption.appLOVID);
    } else if (selectedOption?.name === 'Others') {
      setIsSelf(false);
      setIsOthers(true);

      setFormData((prev) => ({
        ...prev,
        name: '',
        phoneNumber: '',
        relationship: '',
      }));
      setSelectedRelationship('');
    } else {
      setIsSelf(false);
      setIsOthers(false);
    }
  }, [appointmentType, options, patientData]);

  useEffect(() => {
    const fetchPatientData = async () => {
      const userID = sessionStorage.getItem('userID');
      const roleName = sessionStorage.getItem('roleName');

      if (userID && roleName !== 'Reception') {
        try {
          const response = await api.get('/Patient/GetPatientByUserID', {
            params: { userId: userID },
          });

          const data = response.data;

          if (data.success && data.data) {
            const name = data.data.patientName || '';
            const phoneNumber = data.data.patientPhoneNumber || '';

            // Save it separately
            setPatientData({ name, phoneNumber });

            // Initialize formData if needed
            setFormData((prev) => ({
              ...prev,
              name,
              phoneNumber,
            }));
          } else {
            console.warn('⚠️ Failed to fetch patient data');
          }
        } catch (err) {
          console.error('❌ Error fetching patient data:', err);
        }
      }
    };

    fetchPatientData();
  }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-semibold text-black mb-6">
        Search Hospital
      </h1>
      <form
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          id="hospitalName"
          value={formData.hospitalName}
          onChange={(e) =>
            setFormData({ ...formData, hospitalName: e.target.value })
          }
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter Hospital Name"
        />

        <select
          id="hospitalType"
          name="hospitalType"
          value={formData.hospitalType}
          onChange={(e) =>
            setFormData({ ...formData, hospitalType: e.target.value })
          }
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Hospital Type</option>
          {hospitalTypes.length > 0 ? (
            hospitalTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))
          ) : (
            <option value="">No Hospital Types Available</option>
          )}
        </select>

        <div className="flex items-center gap-4 mt-4">
          <CustomButton type="submit">Search</CustomButton>

          <CustomButton
            onClick={handleReset}
            className="opacity-60 hover:opacity-100 border border-gray-300 flex items-center gap-2"
          >
            Reset
          </CustomButton>
        </div>
      </form>

      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        List of Hospital's
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative">
        {hospitals.length > 0 ? (
          hospitals.map((hospital, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-200 relative
        transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              {/* Icon Badge - Top Left */}
              <div className="absolute top-0 left-0 bg-blue-300 w-10 h-10 rounded-tl-lg rounded-br-md flex items-center justify-center">
                <img
                  src={HospitalIcon}
                  alt="hospital"
                  className="w-5 h-5 text-white text-xl "
                />
              </div>

              {/* Top Row: Book Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="bg-blue-300 text-white px-4 py-1 rounded-md hover:bg-blue-400 transition"
                  onClick={() => handleBookNow(hospital.hospitalID)}
                >
                  Book Now
                </button>
              </div>

              {/* Info Grid: Hospital Name & Type */}
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-800">
  <div className="flex items-center gap-2">
    <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
    <span className="text-black font-medium">
      Name: <span className="font-normal">{hospital.hospitalName}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
    <span className="text-black font-medium">
      Type: <span className="font-normal">{hospital.hospitalType}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
    <span className="text-black font-medium">
      Code: <span className="font-normal">{hospital.hospitalCode}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={EmailIcon} alt="email" className="w-5 h-5" />
    <span className="text-black font-medium">
      Email: <span className="font-normal">{hospital.email || 'N/A'}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={PhoneIcon} alt="phone" className="w-5 h-5" />
    <span className="text-black font-medium">
      Mobile: <span className="font-normal">{hospital.mobile || 'N/A'}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
    <span className="text-black font-medium">
      Landline: <span className="font-normal">{hospital.landline || 'N/A'}</span>
    </span>
  </div>

  <div className="flex items-center gap-2">
    <img src={HospitalIcon} alt="hospital" className="w-5 h-5" />
    <span className="text-black font-medium">
      GST: <span className="font-normal">{hospital.gst || 'N/A'}</span>
    </span>
  </div>
</div>



              <div className="flex justify-end mb-2 mr-2">
                <button
                  onClick={() => {
                    console.log('Navigating with state:', {
                      hospitalID: hospital.hospitalID,
                      hospitalName: hospital.hospitalName,
                    });
                    navigate('/ProfileHospital', {
                      state: {
                        hospitalID: hospital.hospitalID,
                        hospitalName: hospital.hospitalName,
                      },
                    });
                  }}
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  View More Profile Info
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 text-center text-gray-600">
            <p>No hospital data found</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>

            {/* ✅ Pre-selected hospital dropdown with changeable selection */}
            <form onSubmit={handleSubmit}>
              {/* Appointment Type */}
              <div className="flex justify-center mt-4 mb-6">
                <div className="flex rounded-full border-2 border-blue-300 overflow-hidden">
                  {options.map((option) => (
                    <label
                      key={option.appLOVID}
                      className={`px-6 py-2 cursor-pointer font-semibold text-center transition-all duration-300
        ${appointmentType === option.appLOVID ? 'bg-blue-500 text-white' : 'bg-gray-500 text-black'}`}
                    >
                      <input
                        type="radio"
                        name="appointmentType"
                        value={option.appLOVID}
                        checked={appointmentType === option.appLOVID}
                        onChange={() => {
                          setAppointmentType(option.appLOVID);
                          handleOptionChange(option);
                        }}
                        className="hidden"
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4 flex gap-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="name"
                    maxLength={30}
                    placeholder={isOthers ? 'Enter your Name' : 'Name'}
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSelf && roleName !== 'Reception'}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                  text-black outline-none focus:border-primary dark:border-form-strokedark
                   dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="phoneNumber"
                    maxLength={10}
                    placeholder={
                      isOthers ? 'Enter your number' : 'Phone Number'
                    }
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={isSelf && roleName !== 'Reception'}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>
              {/* Relationship (for Others) */}
              {appointmentType ===
                options.find((opt) => opt.name === 'Others')?.appLOVID && (
                <div className="mb-4">
                  <div className="relative">
                    {/* Relationship Dropdown */}
                    <select
                      name="relationship"
                      value={selectedRelationship || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRelationship(value); // Updates selectedRelationship
                        setFormData((prev) => ({
                          ...prev,
                          relationship: value, // Updates formData.relationship
                        }));
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Relationship</option>
                      {relationships.length > 0 ? (
                        relationships.map((relation) => (
                          <option
                            key={relation.appLOVID}
                            value={relation.appLOVID}
                          >
                            {relation.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No relationships available</option>
                      )}
                    </select>
                  </div>

                  {/* Error Message */}
                  {errors.relationship && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.relationship}
                    </p>
                  )}
                </div>
              )}
              {/* Hospital Dropdown */}
              <div className="mb-4 flex gap-4">
                {/* Hospital Dropdown */}
                <div className="relative w-1/2">
                  <select
                    name="hospital"
                    disabled
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

                {/* Doctor Dropdown */}

                <div className="relative w-1/2">
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

              {/* Reason */}
              <div className="mb-4">
                <textarea
                  name="reason"
                  placeholder="Enter your text here..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
                 text-black outline-none focus:border-primary dark:border-form-strokedark
                  dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
                {errors.reason && (
                  <p className="text-red-500 text-sm">{errors.reason}</p>
                )}
              </div>

              {/* Date and Time */}

              <div className="mb-4 flex gap-4">
                {/* Date Picker */}
                <div className="w-1/2">
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => handleDateChange(date)}
                      placeholderText="Appointment Date"
                      minDate={new Date()}
                      className={`w-full rounded-lg border border-stroke py-4 pl-4 pr-20 text-black outline-none focus:border-primary ${errors.date ? 'border-red-500' : ''}`}
                    />
                    {/* Calendar Icon */}
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <i className="fas fa-calendar-alt fa-xs"></i>
                    </span>
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Time Picker */}
                <div className="w-1/2">
                  <div className="relative">
                    <DatePicker
                      selected={selectedTime}
                      onChange={(time) => {
                        if (!time) return;

                        const matchedSlot = generatedTimeSlots.find(
                          (slot) => slot.time.getTime() === time.getTime(),
                        );

                        if (matchedSlot) {
                          handleTimeSlotSelect(time, matchedSlot.timeSlotID);
                        } else {
                          setSelectedTime(time);
                          setFormData((prev) => ({
                            ...prev,
                            time,
                            timeSlotID: prev.timeSlotID || '',
                          }));
                          const timeError = validateField('time', time);
                          setErrors((prev) => ({ ...prev, time: timeError }));
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={slotDuration}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      placeholderText="Appointment Time"
                      className="w-full rounded-lg border border-stroke py-4 pl-4 pr-20 text-black outline-none focus:border-primary"
                      includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                    />
                    <i className="fas fa-clock text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none"></i>
                  </div>
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                {/* Buttons */}

                <button
                  className="bg-gray-300 text-black py-2 px-4 rounded shadow-none hover:bg-gray-400"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">
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

export default HospitalCards;
