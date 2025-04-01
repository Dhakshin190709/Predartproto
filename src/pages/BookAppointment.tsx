import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import CustomButton from '../components/CustomButton';

interface AppLOVOption {
  appLOVID: string;
  name: string;
}

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',

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

  const doctorID = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
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

  const [hospitals, setHospitals] = useState([]); // Ensure default state is an array
  const [doctors, setDoctors] = useState([]); // Ensure default state is an array

  const [loading, setLoading] = useState(true);

  const [selectedDoctorID, setSelectedDoctorID] = useState(null);
  const fetchRelationships = async () => {
    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Relationship',
      );
      const result = await response.json();

      console.log('API Response:', result); // Check the response structure

      if (Array.isArray(result.data)) {
        setRelationships(result.data); // Set the fetched relationships
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

  const [options, setOptions] = useState<AppLOVOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=toWhom',
        );
        console.log('API Response:', response.data);
        setOptions(response.data?.data ?? []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userID = sessionStorage.getItem('userID');
    if (!userID || !doctorID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    // Validate all fields before submitting
    const newErrors = {
      name: validateField('name', formData.name),
      relationship: validateField('relationship', formData.relationship),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      // hospital: validateField('hospital', formData.hospital),
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
          ? new Date(formData.date).toISOString().split('T')[0]
          : null,
        appointmentTime: formData.time ? `${formData.time}:00` : null,
        statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
        notes: formData.reason || '',
        toWhom: appointmentType, // ✅ Send the ID, not name
        relationship: selectedRelationship,
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

  const [selectedRelationship, setSelectedRelationship] = useState('');

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

  useEffect(() => {
    const selectedOption = options.find(
      (opt) => opt.appLOVID === appointmentType,
    );

    if (selectedOption?.name === 'Self') {
      setFormData((prev) => ({
        ...prev,
        relationship: selectedOption.appLOVID, // ✅ Set relationship as Self's appLOVID
      }));
      setSelectedRelationship(selectedOption.appLOVID);
    }
  }, [appointmentType]);

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
    <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Right Section */}
      <div className="w-full border-stroke dark:border-strokedark">
        <div className="w-full p-0 sm:p-4 xl:p-6">
          {' '}
          {/* Reduced padding */}
          <h2 className="mt-0 mb-3 text-2xl font-semibold text-black dark:text-white sm:text-title-xl2">
            Book Appointment
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Appointment Type */}
            <div className="mb-4 flex justify-center gap-4">
              {options.map((option) => (
                <label
                  key={option.appLOVID}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value={option.appLOVID} // ✅ Pass ID instead of name
                    checked={appointmentType === option.appLOVID}
                    onChange={() => {
                      setAppointmentType(option.appLOVID); // ✅ Store the ID
                      handleOptionChange(option); // Pass the entire option for name reference if needed
                    }}
                    className="form-radio text-primary-600"
                  />
                  <span>{option.name}</span> {/* Display name, but store ID */}
                </label>
              ))}
            </div>

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
                      setSelectedRelationship(value);
                      setFormData((prev) => ({
                        ...prev,
                        relationship: value,
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

            <div className="mb-4 flex flex-wrap gap-4">
  {/* Date Picker */}
  <div className="relative w-1/4">
    <DatePicker
      selected={selectedDate}
      onChange={(date) => handleDateChange(date)}
      placeholderText="Select Date"
      className={`w-full rounded-lg border border-stroke py-4 pl-4 pr-12 text-black outline-none focus:border-primary ${
        errors.date ? 'border-red-500' : ''
      }`}
    />
    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}

    {/* Calendar Icon */}
    <span
      className="absolute right-4 top-1/2 transform -translate-y-1/2"
      style={{ color: '#c2c3c4' }}
    >
      <i className="fas fa-calendar-alt fa-xs"></i>
    </span>
  </div>

  {/* Time Picker */}
  <div className="relative w-1/4">
    <DatePicker
      selected={selectedTime}
      onChange={(time) => {
        if (time) {
          const matchedSlot = generatedTimeSlots.find(
            (slot) =>
              slot.time.getHours() === time.getHours() &&
              slot.time.getMinutes() === time.getMinutes()
          );
          if (matchedSlot) {
            handleTimeSlotSelect(time, matchedSlot.timeSlotID);
          }
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
    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}

    {/* Timer Icon */}
    <span
      className="absolute right-4 top-1/2 transform -translate-y-1/2"
      style={{ color: '#c2c3c4' }}
    >
      <i className="fas fa-clock fa-xs"></i>
    </span>
  </div>

  {/* Column 3 (Submit Button) */}
  <div className="relative w-1/4 flex items-center justify-start">
  <CustomButton>
      Book Now
    </CustomButton>
  </div>

  {/* Column 4 (Empty Space) */}
  <div className="relative w-1/4"></div>
</div>


           
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
