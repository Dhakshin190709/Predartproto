import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchHospitalAPI } from '../../Utils';

import { useLocation } from 'react-router-dom';

import {
  FaMapMarkerAlt,
  FaEnvelope,
 
  FaDirections,
} from 'react-icons/fa';

import {
  FaLandmark,
  FaBuilding,
  FaHospital,
  FaClock,
  FaHospitalUser,
  FaPlusSquare,
} from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';


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
 
  const [hospitals, setHospitals] = useState([]);
const [selectedHospital, setSelectedHospital] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const hospitalNameFromQuery = queryParams.get('hospital');
  const [hospitalTypes, setHospitalTypes] = useState([]);
 
 

  const [showFullAddress, setShowFullAddress] = useState({});

  
  const [showModal, setShowModal] = useState(false);

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

  //fetch hp from utils
  useEffect(() => {
    const getHospitalTypes = async () => {
      const types = await fetchHospitalAPI();
      setHospitalTypes(types);
    };

    getHospitalTypes();
  }, []);
  
  
  
  

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Doctor',
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setDoctors(result.data);
      } else {
        console.error('Invalid doctor data format:', result.data);
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

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Hospital');
        const result = await response.json();
  
        console.log('API Response:', result); // Verify response format
  
        if (Array.isArray(result)) {
          const hospitalData = result.map((hospital) => ({
            hospitalID: hospital.hospitalID || '', // ✅ Add hospitalID
            hospitalName: hospital.hospitalName || 'Unknown Hospital',
            type: hospital.hospitalType || 'Unknown Type',
            location: 'Anna Nagar, Chennai', // Hardcoded location
            email: hospital.email || 'hp@gmail.com', // Hardcoded email
            is24x7: hospital.hospitalType?.toLowerCase() === '24/7',
          }));
          setHospitals(hospitalData);
        } else {
          console.error('Invalid hospital data format:', result);
          setHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setHospitals([]);
      }
    };
  
    fetchHospitals();
  }, []);
  


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
      return 'Relationship is required.'; // ✅ Shows error if not selected
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
    if (name === 'date') {
      const dateValue = formData.date; // Use formData.date for consistency
      if (!dateValue) {
        error = 'Date is required.';
      } else if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
        error = 'Invalid date.';
      } else {
        error = ''; // Clear error when valid
      }
    }

    // Time validation
    if (name === 'time') {
      if (!value) {
        error = 'Time is required.';
      } else if (value instanceof Date && isNaN(value.getTime())) {
        error = 'Invalid time.';
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

   

    if (name === 'hospital') {
      filterHospitals(value);
    }
    if (name === 'doctor') {
      filterDoctors(value);
    }

    // Validate the field
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    // Validate all fields before submitting
    const newErrors = {
      name: validateField('name', formData.name),
      
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      doctor: validateField('doctor', formData.doctor),
      reason: validateField('reason', formData.reason),
      date: validateField('date', formData.date),
      time: validateField('time', formData.time),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      const payload = {
        createdBy: userID,
        isActive: true,
        doctorID: formData.doctor,
        patientID: '1e3b8a00-d9c7-453d-aa97-005281e76f80',
        timeSlotID: formData.timeSlotID,
        appointmentDate: formData.date
          ? new Date(formData.date).toLocaleDateString('en-CA')
          : null,
        appointmentTime: formData.time ? `${formData.time}:00` : null,
        statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
        notes: formData.reason || '',
        toWhom: 'ae34b43e-74cf-4328-7794-08dd561d6477',
        relationship: 'ae34b43e-74cf-4328-7794-08dd561d6477',
        phoneNumber: formData.phoneNumber || '',
      };

      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Appointment',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          setSuccessMessage('Form submitted successfully!');
          console.log('Form Submitted:', payload);

          // Reset form fields after successful submission
          setFormData({
            name: '',
            relationship: '',
            phoneNumber: '',
            doctor: '',
            reason: '',
            date: null,
            time: '', // ✅ Ensure this resets correctly
            timeSlotID: '',
          });
          setSelectedTime(null); 

          setSelectedDate(null);
          setErrors({});

          // Close the modal
          setTimeout(() => {
            setShowModal(false);
          }, 500); // Delay slightly for better UX
        } else {
          const errorData = await response.json();
          console.error('Submission failed:', errorData);
          setSuccessMessage('Submission failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during submission:', error);
        setSuccessMessage('An error occurred. Please try again later.');
      }
    } else {
      setSuccessMessage('');
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
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSlotID: timeSlotID, // ✅ Correctly pass timeSlotID
    }));
  };

  const handleDateChange = (date: Date | null, slots?: TimeSlotType[]) => {
    if (!date) return;

    // Fix: Convert to local timezone by setting time to noon
    const localDate = new Date(date);
    localDate.setHours(12, 0, 0, 0); // Avoid timezone shifts

    setSelectedDate(localDate);
    setFormData((prev) => ({ ...prev, date: localDate }));

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('Invalid timeSlots:', timeSlots);
      return;
    }

    const dayOfWeek = localDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });
    const matchedDaySlots = timeSlots.filter(
      (slot) =>
        slot.day?.toLowerCase().trim() === dayOfWeek.toLowerCase().trim(),
    );

    if (matchedDaySlots.length) {
      matchedDaySlots.forEach(
        ({ fromTime, toTime, slotDuration, timeSlotID }) => {
          generateTimeSlots(fromTime, toTime, slotDuration, timeSlotID);
        },
      );
      setFormData((prev) => ({
        ...prev,
        timeSlotID: matchedDaySlots[0].timeSlotID,
      }));
    } else {
      console.warn(`No time slots found for ${dayOfWeek}`);
      setGeneratedTimeSlots([]);
    }
  };

  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
    timeSlotID: string,
  ) => {
    console.log('Generating slots for timeSlotID:', timeSlotID);

    const slots = [];
    const today = new Date();
    const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
    const [toHours, toMinutes] = toTime.split(':').map(Number);

    let current = new Date(today.setHours(fromHours, fromMinutes, 0, 0));
    const end = new Date(today.setHours(toHours, toMinutes, 0, 0));

    while (current <= end) {
      slots.push({ time: new Date(current), timeSlotID });
      current = new Date(current.getTime() + slotDuration * 60000); // Add slot duration
    }

    setGeneratedTimeSlots(slots); // ✅ Save slots with IDs
  };

  const handleDoctorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const doctorID = e.target.value;
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));

    if (!doctorID) return;

    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot',
      );
      const responseData = await response.json();
      const data = Array.isArray(responseData.data) ? responseData.data : [];

      console.log('Fetched Time Slots Data:', data);

      const matchedTimeSlots = data.filter(
        (slot) => String(slot.doctorID) === doctorID,
      );

      if (matchedTimeSlots.length) {
        console.log('Matched Time Slots:', matchedTimeSlots);

        const formattedSlots = matchedTimeSlots.map((slot) => ({
          timeSlotID: slot.timeSlotID,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          slotDuration: slot.slotDuration,
          day: slot.dayofWeek, // Ensure this matches the API field
        }));

        setAvailableTimeSlots(formattedSlots);
        console.log('Formatted Slots:', formattedSlots);

        if (selectedDate) {
          handleDateChange(selectedDate, formattedSlots); // ✅ Pass updated slots
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

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Search Hospital
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          id="location"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter Location"
        />
        <input
          type="text"
          id="hospitalName"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter Hospital Name"
        />
 <select
  id="hospitalType"
  name="hospitalType"
  value={formData.hospitalType}
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
  onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
  required
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







      
    
        <div className="flex justify-start mt-4">
        <CustomButton>
     Search
    </CustomButton>
        </div>
      </form>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {hospitals.map((hospital, index) => (
    <div
      key={index}
      className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 
      transition-transform transform hover:scale-105 hover:shadow-lg md:col-span-3"
    >
      {/* First Row: Hospital Name & Type (Left), Email (Center), Directions (Right) */}
      <div className="grid grid-cols-3 items-center mb-2">
        <div className="flex items-center">
          {getHospitalIcon(hospital?.type || '')}
          <h2 className="ml-2 text-md font-semibold text-blue-800">
            {hospital.hospitalName} ({hospital.type})
          </h2>
        </div>
        <p className="text-blue-400 text-center">
          <FaEnvelope className="inline mr-1" />
          <a href={`mailto:${hospital.email}`} className="hover:underline">
            {hospital.email}
          </a>
        </p>
        <div className="text-right">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:underline flex items-center justify-end"
          >
            <FaDirections className="mr-1" /> Directions
          </a>
        </div>
      </div>

      {/* Second Row: Location (Left), View More (Center), Book Now (Right) */}
      <div className="grid grid-cols-3 items-center text-gray-700 mt-2">
        <div>
          <FaMapMarkerAlt className="inline mr-1 text-red-500" />
          {hospital.location ? (
            <>
              {showFullAddress[index]
                ? hospital.location
                : `${hospital.location.substring(0, 15)}...`}
              <button
                className="text-blue-500 ml-2"
                onClick={() => toggleAddress(index)}
              >
                {showFullAddress[index] ? 'View Less' : 'View More'}
              </button>
            </>
          ) : (
            'Location not available'
          )}
        </div>
        <div></div> {/* Empty div to push "Book Now" to the right */}
        <div className="text-right">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded"
            onClick={() => handleBookNow(hospital.hospitalID)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  ))}
</div>










      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>

            {/* ✅ Pre-selected hospital dropdown with changeable selection */}
            <form onSubmit={handleSubmit}>
              {/* Appointment Type */}

              {/* Name */}
              <div className="mb-4 flex gap-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="name"
                    maxLength={30}
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    // disabled={appointmentType === 'Self'}
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
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Hospital Dropdown */}
              <div className="mb-4 flex gap-4">
                {/* Hospital Dropdown */}
                <div className="relative w-1/2">
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
                <div className="relative w-1/2">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => handleDateChange(date)}
                    placeholderText="Select Date"
                    className={`w-full rounded-lg border border-stroke py-4 pl-4 pr-12 text-black outline-none focus:border-primary ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}

                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                  {/* Calendar Icon */}
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-calendar-alt fa-xs"></i>
                  </span>
                </div>

                {/* Time Picker */}
                <div className="relative w-1/2">
                <DatePicker
  selected={selectedTime} // ✅ Ensure this is updated when resetting
  onChange={(time) => {
    if (time) {
      const matchedSlot = generatedTimeSlots.find(
        (slot) =>
          slot.time.getHours() === time.getHours() &&
          slot.time.getMinutes() === time.getMinutes(),
      );

      if (matchedSlot) {
        handleTimeSlotSelect(time, matchedSlot.timeSlotID); // ✅ Pass ID on selection
      }

      setSelectedTime(time); // ✅ Update state with selected time
    }
  }}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={slotDuration}
  timeCaption="Time"
  dateFormat="h:mm aa"
  placeholderText="Select a time"
  className="w-full rounded-lg border border-stroke py-4 pl-4 pr-12 text-black outline-none focus:border-primary"
  includeTimes={generatedTimeSlots.map((slot) => slot.time)}
/>


                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                  {/* Timer Icon */}
                  <span
                    className="absolute left-35 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-clock fa-xs"></i>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                {/* Buttons */}

                <button
                  className="bg-gradient-to-b from-[#B22222] to-[#FF4500] 
                 hover:from-[#FF4500] hover:to-[#B22222] 
                 text-white transition duration-150 
                 ease-out hover:ease-in py-2 px-2 rounded-lg"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="bg-gradient-to-b from-[#008000] to-[#00C853] 
                  hover:from-[#00C853] hover:to-[#008000] 
                  text-white transition duration-150 
                  ease-out hover:ease-in py-2 px-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalCards;
