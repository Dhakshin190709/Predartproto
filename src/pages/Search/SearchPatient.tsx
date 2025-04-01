import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
  const [slotDuration, setSlotDuration] = useState(10); // Default slot duration, adjust as necessary
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
    const lowerGender = gender.toLowerCase();

    if (lowerGender === 'male' || lowerGender === 'm') {
      return <FaMars className="text-blue-500 ml-1" />;
    } else if (lowerGender === 'female' || lowerGender === 'f') {
      return <FaVenus className="text-pink-500 ml-1" />;
    } else {
      return <FaGenderless className="text-black ml-1" />;
    }
  };

  const handleBookNow = (patient: PatientData) => {
    if (!patient) {
      console.error('Patient details are missing!');
      return;
    }
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

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Hospital',
        );
        const result = await response.json();

        console.log('API Response:', result); // Verify the entire response

        // Since the response is already an array:
        if (Array.isArray(result)) {
          setHospitals(result); // Set the hospitals directly
        } else if (Array.isArray(result?.data)) {
          setHospitals(result.data); // Fallback if data is nested
        } else {
          console.error('Invalid hospital data format:', result);
          setHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

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

    fetchHospitals();
    fetchDoctors();
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

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Patient',
        );
        const data = await response.json();
        if (data?.success && Array.isArray(data.data)) {
          setPatientData(data.data); // Set the patient data
        } else {
          console.error('Unexpected response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false); // Set loading to false after the fetch is done
      }
    };

    if (patientData.length === 0) {
      // Fetch only if the data is not already fetched
      fetchPatientData();
    }
  }, [patientData.length]); // Only refetch if patientData is empty

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

    if (!value) {
      if (['name', 'hospital', 'doctor', 'reason'].includes(name)) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
      }
    }

    // Phone Number Validation
    if (name === 'phoneNumber' && typeof value === 'string') {
      if (!/^\d{10}$/.test(value)) {
        return 'Phone number must be exactly 10 digits.';
      }
    }

    // Date Validation
    if (name === 'date') {
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        return 'Invalid date.';
      }
    }

    // Time Validation
    // if (name === 'time') {
    //   if (!(value instanceof Date) || isNaN(value.getTime())) {
    //     return 'Invalid time.';
    //   }
    // }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const payload = {
      createdBy: userID,
      isActive: true,
      doctorID: formData.doctor,
      patientID: selectedPatient?.patientID || '',
      timeSlotID: formData.timeSlotID,
      appointmentDate: formData.date
        ? new Date(formData.date).toISOString().split('T')[0]
        : null,
      appointmentTime: formData.time ? `${formData.time}:00` : null,
      statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
      notes: formData.reason || '',
      toWhom: 'ae34b43e-74cf-4328-7794-08dd561d6477',
      relationship: 'ae34b43e-74cf-4328-7794-08dd561d6477',
      phoneNumber: selectedPhoneNumber?.PhoneNumber || '0000000000',
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

        // ✅ Reset form after successful submission
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
        setErrors({}); // Clear validation errors

        // ✅ Close modal after submission
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData);
        setSuccessMessage('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setSuccessMessage('An error occurred. Please try again later.');
    }
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

  const handleDateChange = (date: Date | null, slots?: TimeSlotType[]) => {
    if (!date) return;

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('Invalid timeSlots:', timeSlots); // Ensure no event is passed
      return;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
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

  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSlotID: timeSlotID, // ✅ Correctly pass timeSlotID
    }));
  };

  return (
    <div className="w-full p-4 sm:p-8 xl:p-12 bg-white">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Search Patient
      </h1>

      {/* Filters Section (Type, Code, Active) */}
      <div className="flex flex-col gap-4 mb-4">
        {/* First Row (Filter) */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Patient Id"
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            placeholder="Patient Name"
            className="w-[30%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-[25%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = 'text')}
            placeholder="From Date"
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <input
            type="text"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = 'text')}
            placeholder="To Date"
            className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-start mt-4">
          <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">
            Search
          </button>
        </div>
      </div>
      <div className="space-y-6 mt-6">
  {patientData.length > 0 ? (
    patientData.map((patient, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-100 
        transition-transform transform hover:scale-105 hover:shadow-lg w-[100%]"
      >
        {/* Grid Layout for Perfect Alignment */}
        <div className="grid grid-cols-4 gap-4 items-center">
  {/* First Row: Name + Gender | Age | Phone | Email */}
  <div className="flex items-center gap-2">
    <FaUserAlt className="text-blue-400 text-lg shrink-0" />
    <h2 className="text-sm font-semibold text-gray-800">{patient.patientName}</h2>
    <span className="text-gray-600">{getGenderIcon(patient.patientGender)}</span>
  </div>

  <div>
    <span className="text-gray-600 text-sm">{calculateAge(patient.patientDateOfBirth)}</span>
  </div>

  <div>
    <a
      href={`tel:${patient.patientPhoneNumber}`}
      className="flex items-center text-gray-700 font-medium hover:text-green-600 transition"
    >
      <FaPhoneAlt className="text-green-400 mr-1" />
      {patient.patientPhoneNumber}
    </a>
  </div>

  <div>
    <a
      href={`mailto:${patient.patientEmail}`}
      className="flex items-center text-gray-700 font-medium hover:text-orange-600 transition truncate w-full"
    >
      <FaEnvelope className="text-orange-400 mr-1 shrink-0" />
      <span className="truncate">{patient.patientEmail}</span>
    </a>
  </div>

  {/* Second Row: Directions | Location | View More | Book Now */}
  <div>
    <a
      href="https://www.google.com/maps/search/Anna+nagar,+chennai"
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-500 hover:underline flex items-center"
    >
      <FaDirections className="mr-1" /> Directions
    </a>
  </div>

  <div className="text-gray-700 font-medium flex items-center space-x-2">
    <FaMapMarkerAlt className="text-red-500 mr-0" />
    <span>Anna Nagar, Chennai</span>
  </div>

  <div>
    <button
      className="text-blue-500 hover:underline"
      onClick={() => setShowMore(!showMore)}
    >
      {showMore ? "View Less" : "View More"}
    </button>
  </div>

  <div>
    <button
      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
      onClick={() => handleBookNow(patient)}
    >
      Book Now
    </button>
  </div>

  {/* Additional content spans full row below */}
{showMore && (
  <div className="col-span-4 mt-1 text-gray-600 p-1">
    Additional patient details can be shown here...
  </div>
)}

</div>



       
            
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500">No patients found</p>
  )}
</div>








      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
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
                <div>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => handleDateChange(date)}
                    placeholderText="Select Date"
                    className={`w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black outline-none focus:border-primary ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}

                  {/* Calendar Icon */}
                  {/* <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-calendar-alt fa-xs"></i>
                  </span> */}
                </div>
                <div>
                  <DatePicker
                    selected={selectedTime}
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
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={slotDuration}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select a time"
                    className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10
         text-black outline-none focus:border-primary"
                    includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                  />

                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                  {/* Timer Icon */}
                  {/* <span
                    className="absolute left-35 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-clock fa-xs"></i>
                  </span> */}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="bg-gradient-to-b from-[#B22222] to-[#FF4500] 
                 hover:from-[#FF4500] hover:to-[#B22222] 
                 text-white transition duration-150 
                 ease-out hover:ease-in py-2 px-2 rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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

export default SearchPatient;
