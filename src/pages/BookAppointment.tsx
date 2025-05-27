import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CalendarIcon from '../../src/images/icon/calendar.svg';
import ClockIcon from '../../images/icon/Clock.png';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import api from '../api/request';
interface AppLOVOption {
  appLOVID: string;
  name: string;
}

const BookAppointment = () => {
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
     appointmentType: '',
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
  const [slotDuration, setSlotDuration] = useState(5); // Default slot duration, adjust as necessary
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [appointmentType, setAppointmentType] = useState(null);
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [patientData, setPatientData] = useState({ name: '', phoneNumber: '' });
  const [bookedSlots, setBookedSlots] = useState<
    { appointmentDate: string; appointmentTime: string }[]
  >([]);

  const [isSelf, setIsSelf] = useState(false);
  const [isOthers, setIsOthers] = useState(false);
const [loading, setLoading] = useState(false); // ✅ default is false

  const [doctorID, setDoctorID] = useState('');

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      setSelectedTime(time);
      setFormData((prev) => ({
        ...prev,
        time: time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timeSlotID: selectedTimeSlotID, // ✅ Pass selectedTimeSlotID here
      }));
    }
  };

  const [selectedHospitalID, setSelectedHospitalID] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [relationships, setRelationships] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  // Initialize it with a default value or fetch it if necessary.

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const doctorDropdownRef = useRef<HTMLUListElement>(null);

  const [hospitals, setHospitals] = useState([]); // Ensure default state is an array
  const [doctors, setDoctors] = useState([]); // Ensure default state is an array



  const [selectedDoctorID, setSelectedDoctorID] = useState(null);

  const fetchRelationships = async () => {
  try {
    const response = await api.get('/AppLOV', { params: { type: 'Relationship' } });
    const result = response.data;

    console.log('API Response:', result);

    if (Array.isArray(result.data)) {
      setRelationships(result.data);
    } else {
      console.error('Invalid relationship data format:', result.data);
      setRelationships([]);
    }
  } catch (error) {
    console.error('Error fetching relationships:', error);
  }
};


  // Fetch on component mount
  useEffect(() => {
    fetchRelationships();
  }, []);

 useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const response = await api.get('/Hospital/List');
      const result = response.data;

      let hospitalData = [];

      if (Array.isArray(result)) {
        hospitalData = result;
      } else if (Array.isArray(result?.data)) {
        hospitalData = result.data;
      } else {
        console.error('Invalid hospital data format:', result);
        setHospitals([]);
        return;
      }

      const activeHospitals = hospitalData.filter(
        (hospital) => hospital.isActive,
      );

      setHospitals(activeHospitals);

      // ❌ Don’t prefill hospital
      // setSelectedHospitalID(activeHospitals[0]?.hospitalID);
      // ❌ Don’t fetch doctors yet
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  fetchHospitals();
}, []);

  const fetchDoctors = async (hospitalId: string) => {
  try {
    const response = await api.get(`/Doctor?HospitalID=${hospitalId}`);
    const result = response.data;

    if (result.success && Array.isArray(result.data)) {
      setDoctors(result.data);
    } else {
      console.error('Invalid doctor data format:', result.data);
      setDoctors([]);
    }
  } catch (error) {
    console.error('Error fetching doctors:', error);
  }
};

  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('roleName');
    setRoleName(storedRole);
    console.log('Retrieved role:', storedRole);
  }, []);

 useEffect(() => {
  const fetchOptions = async () => {
    try {
      const response = await api.get('/AppLOV?type=toWhom');
      console.log('API Response:', response.data);
      setOptions(response.data?.data ?? []);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  fetchOptions();
}, []);


  useEffect(() => {
  const fetchPatientData = async () => {
    const userID = sessionStorage.getItem('userID');
    const roleName = sessionStorage.getItem('roleName');

    if (userID && roleName !== 'Reception') {
      try {
        const response = await api.get(`/Patient/GetPatientByUserID?userId=${userID}`);
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

  const handleOptionChange = (selectedOption: AppLOVOption) => {
    setAppointmentType(selectedOption.appLOVID); // ✅ Store the ID
    console.log(
      `Selected: ${selectedOption.name}, appLOVID: ${selectedOption.appLOVID}`,
    );
  };

  const hospitalDropdownRef = useRef<HTMLDivElement>(null);

  const validateField = (name: string, value: string | Date | null): string => {
    let error = '';

    // Conditional validation for 'Others' appointment type
    if (appointmentType === 'Others' && name === 'relationship' && !value) {
      return 'Relationship is required.';
    }

    if (name === 'name' && !value) error = 'Name is required.';
    if (name === 'hospital' && !value) error = 'Hospital is required.';
    if (name === 'doctor' && !value) error = 'Doctor is required.';
  if (name === 'reason') {
  const desc = (value || '').toString().trim();

  if (!desc) {
    error = 'Reason is required.';
  } else if (desc.length > 255) {
    error = 'Reason cannot exceed 255 characters.';
  } else if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(desc)) {
    error = 'Emojis are not allowed.';
  } else if (/[^a-zA-Z0-9\s.,!?'"@#&()\-:;/]/.test(desc)) {
    error = 'Reason contains invalid characters.';
  } else if (/(.)\1{3,}/.test(desc)) {
    error = 'Too many repeated characters.';
  } else if (/\d{5,}/.test(desc)) {
    error = 'Too many consecutive digits.';
  }
}



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

  const handleSuggestionClick = (suggestion: string) => {
    setFormData((prevData) => ({
      ...prevData,
      relationship: suggestion,
    }));
    setShowSuggestions(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      relationship: '',
    }));
  };

  const handleBlur = (name: string, value: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
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
 

  setLoading(true); // Start loading

  const userID = sessionStorage.getItem('userID');

  if (!userID) {
    toast.error('User not logged in. Please log in again.');
      setLoading(false);
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
      const patientRes = await api.get(`/Patient/GetPatientByUserID?userId=${userID}`);
      const patientData = patientRes.data;
      const patientID = patientData?.data?.patientID;

      if (!patientID) {
        toast.error('Patient ID not found for the logged-in user.');
         setLoading(false); 
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
        timeSlotID: formData.timeSlotID, // Pass this correctly
        appointmentDate: formData.date ? formatDateYYYYMMDD(formData.date) : null,
        appointmentTime: appointmentTimeFormatted,
        statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
        notes: formData.reason?.trim() || 'No additional notes',
        toWhom: appointmentType,
        relationShip: selectedRelationship,
        phoneNumber: formData.phoneNumber || '',
      };

      // Make the API request to book the appointment
      const response = await api.post('/Appointment', payload);
      const responseData = response.data;

      // Check if response status is 200 (success)
      if (response.status === 200) {
        const message = responseData?.message || 'Appointment booked successfully!';
        toast.success(message);
        console.log('Form Submitted:', payload);
        resetForm();
      } else {
        const message = responseData?.message || 'Submission failed. Please try again.';
        toast.error(message);
      }
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('An error occurred. Please try again later.');
    }
      setLoading(false);
  } else {
    toast.warning('Please fix the highlighted errors before submitting.');
     setLoading(false);
  }
};


  // ✅ Helper function to reset the form completely
 const resetForm = () => {
  setFormData({
    name: formData.name, // Keep the current name value
    relationship: '',
    phoneNumber: formData.phoneNumber, // Keep the current phone number value
    doctor: '',
    reason: '',
    date: '',
    time: '',
    timeSlotID: '',
  });
  setSelectedRelationship('');
  setAppointmentType(formData.appointmentType); // Keep the current appointment type
  setSelectedHospitalID('');
  setSelectedDoctorID('');
  setSelectedDate(null);
  setSelectedTime(null);
  setErrors({});
};

  const handleHospitalChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const hospitalId = event.target.value;
    setSelectedHospitalID(hospitalId);
    setSelectedDoctorID(''); // clear doctor selection

    if (hospitalId) {
      await fetchDoctors(hospitalId);
    } else {
      setDoctors([]);
    }
  };

  const [selectedRelationship, setSelectedRelationship] = useState('');

  const handleDoctorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));

    if (!doctorID) return;

    try {
      // Fetch the time slots for the selected doctor using the correct API
     const timeSlotResponse = await api.get(
  `/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`
);
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
    `/Appointment/GetAppointment`,
    {
      params: {
        DoctorID: selectedDoctorID,
        StartDate: localDate,
        EndDate: localDate,
      },
    }
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

  const formattedTime =
    formData.time instanceof Date
      ? formData.time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : formData.time;

  useEffect(() => {
    console.log('Form Data Updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Selected Time Slot ID:', selectedTimeSlotID);
  }, [selectedTimeSlotID]);

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
    if (!appointmentType && options.length > 0) {
      const defaultOption = options.find((opt) => opt.name === 'Self');
      if (defaultOption) {
        setAppointmentType(defaultOption.appLOVID);
        handleOptionChange(defaultOption); // optional
      }
    }
  }, [options]);

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

  return (
    <div className="dark:border-strokedark dark:bg-boxdark">
      {/* Right Section */}
      <div className="w-full border-stroke dark:border-strokedark">
        <div className="w-full p-0 sm:px-4 xl:px-6">
          {' '}
          {/* Reduced padding */}
          <h2 className="mt-0 mb-3 text-2xl font-semibold text-black dark:text-white sm:text-title-xl2">
            Book Appointment
          </h2>
          <form className="w-full px-0 sm:px-0 xl:px-0 py-4">
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
              <div className="relative w-full sm:w-1/2">
                <input
                  type="text"
                  name="name"
                  maxLength={30}
                  placeholder={isOthers ? 'Enter your Name' : 'Name'}
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSelf && roleName !== 'Reception'}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="relative w-full sm:w-1/2">
                <input
                  type="text"
                  name="phoneNumber"
                  maxLength={10}
                  placeholder={isOthers ? 'Enter your number' : 'Phone Number'}
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
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              {/* Hospital Dropdown */}
              <div className="relative w-full sm:w-1/2">
                <select
                  value={selectedHospitalID}
                  onChange={handleHospitalChange}
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
              <div className="relative w-full sm:w-1/2">
                <select
                  name="doctor"
                  value={selectedDoctorID}
                  onChange={handleDoctorChange}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Doctor</option>
                  {doctors.length > 0
                    ? doctors.map((doctor) => (
                        <option key={doctor.doctorID} value={doctor.doctorID}>
                          {doctor.doctorName}
                        </option>
                      ))
                    : selectedHospitalID && (
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
                maxLength={255}
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
            <div className="mb-4 flex flex-col sm:flex-row md:flex-wrap gap-4">
              {/* Appointment Date */}
              <div className="w-full sm:w-1/2 md:w-1/4 relative">
                <div className="relative flex items-center rounded-lg border border-stroke px-4 py-2 focus-within:border-primary">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => handleDateChange(date)}
                    placeholderText="Appointment Date"
                    minDate={new Date()}
                    className="w-full bg-transparent outline-none py-2 text-black placeholder:text-gray-400 pr-8"
                  />
                  <img
                    src={CalendarIcon}
                    alt="Calendar Icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70 pointer-events-none"
                  />
                </div>

                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Appointment Time */}
              <div className="w-full sm:w-1/2 md:w-1/4 relative">
                <div className="relative flex items-center rounded-lg border border-stroke px-4 py-2 focus-within:border-primary">
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
                    className="w-full bg-transparent outline-none py-2 text-black placeholder:text-gray-400 pr-8"
                    includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                  />

                  <i className="fas fa-clock text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 text-sm w-4 h-4 pointer-events-none"></i>
                </div>

                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>
          </form>
          <div className="w-full px-0 sm:px-0 xl:px-0 flex justify-start">
            <div className="w-full sm:w-1/2 md:w-1/4">
             <CustomButton onClick={handleSubmit} disabled={loading}>
  {loading ? 'Booking...' : 'Book Now'}
</CustomButton>

              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
