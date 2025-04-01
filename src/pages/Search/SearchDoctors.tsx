import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { FaStethoscope, FaMapMarkerAlt, FaDirections,FaPhoneAlt,FaHospital } from "react-icons/fa";
import { fetchSpecializations } from '../../Utils';
import CustomButton from '../../components/CustomButton';

interface Doctor {
  doctorID: string;
  doctorName: string;
  doctorPhoneNumber: string;
  qualificationID: string;
  specializationID: string;
  hospitalID: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
}

const SearchDoctors: React.FC = () => {
  
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState([]);
  
  
  const [selectedHospital, setSelectedHospital] = useState('');
  const [specializations, setSpecializations] = useState<{
    [key: string]: string;
  }>({});
  const [selectedHospitalID, setSelectedHospitalID] = useState("");
    const [selectedDoctorID, setSelectedDoctorID] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [slotDuration, setSlotDuration] = useState(10); // Default slot duration, adjust as necessary
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string>('');
  // States for popup
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);

  const [appointmentType, setAppointmentType] = useState(''); // Initialize it with a default value or fetch it if necessary.

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [hospitalID, setHospitalID] = useState('');
  const [doctorID, setDoctorID] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
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
  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/Doctor")
      .then((response) => response.json())
      .then((data) => {
        setDoctorData(data.data);
        setFilteredDoctors(data.data); // Initially show all doctors
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching doctor data:", error));

    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const hospitalMap = data.reduce(
            (acc, hospital) => {
              acc[hospital.hospitalID] = hospital.hospitalName;
              return acc;
            },
            {} as { [key: string]: string },
          );
          setHospitals(hospitalMap);
        }
      })
      .catch((error) => console.error('Error fetching hospitals:', error));

     
      
      
  }, []);

  useEffect(() => {
    const getSpecializations = async () => {
      const specMap = await fetchSpecializations();
      setSpecializations(specMap);
    };

    getSpecializations();
  }, []);

  
  useEffect(() => {
    if (selectedHospital) {
      setFilteredDoctors(
        doctorData.filter((doc) => doc.hospitalID === selectedHospital),
      );
    } else {
      setFilteredDoctors(doctorData);
    }
  }, [selectedHospital, doctorData]);

  // Open popup and set doctor details
  const handleBookNow = (doctor: Doctor) => {
    console.log('Booking doctor:', doctor); // Debugging
    setSelectedDoctor(doctor);
    setSelectedDoctorID(doctor.doctorID); // Set the doctor ID for the dropdown
    setHospitalID(doctor.hospitalID);
    setDoctorID(doctor.doctorID);
    setShowPopup(true);
  };

  useEffect(() => {
    if (selectedDoctorID) {
      // Instead of simulating an event, you could call the fetch logic directly:
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch(
            'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot',
          );
          const responseData = await response.json();
          const data = Array.isArray(responseData.data) ? responseData.data : [];
    
          console.log('Fetched Time Slots Data:', data);
    
          const matchedTimeSlots = data.filter(
            (slot) => String(slot.doctorID) === selectedDoctorID,
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
    
            // Optionally, if a date is selected, update slots for that date:
            if (selectedDate) {
              handleDateChange(selectedDate, formattedSlots);
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
      fetchTimeSlots();
    }
  }, [selectedDoctorID]); // Run whenever selectedDoctorID changes
  

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
  const handleTimeSlotSelect = (time: Date, timeSlotID: string) => {
    setSelectedTime(time);
    setSelectedTimeSlotID(timeSlotID);

    setFormData((prev) => ({
      ...prev,
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSlotID: timeSlotID, // ✅ Correctly pass timeSlotID
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
    // if (name === 'doctor' && !value) error = 'Doctor is required.';
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
      doctorID: selectedDoctorID, // Use the doctor ID from the popup (preselected)
      patientID: "1e3b8a00-d9c7-453d-aa97-005281e76f80",
      timeSlotID: formData.timeSlotID,
      appointmentDate: formData.date
        ? new Date(formData.date).toLocaleDateString('en-CA')
        : null,
      appointmentTime: formData.time ? `${formData.time}:00` : null,
      statusID: "f79e15f9-61ec-41ba-9b62-289025f6a2a8",
      notes: notes || '', // Use the notes entered in the popup textarea
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
        }
      );
  
      if (response.ok) {
        setSuccessMessage('Form submitted successfully!');
        console.log('Form Submitted:', payload);
        
        // Reset only the popup form fields, without affecting other states
        setFormData((prev) => ({
           ...prev,
           name: '',
           phoneNumber: '',
           timeSlotID: '',
           date: '',
           time: '',
           doctor: ''
        }));
        setNotes('');
          // Close the modal
          setTimeout(() => {
            setShowPopup(false);
          }, 500);
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
  


  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <div className="p-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Search Doctor
        </h1>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Doctor Name"
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Doctor ID"
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">-- Select Specialization --</option>
              {Object.entries(specializations).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              id="hospital"
              value={selectedHospital}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              <option value="">-- Select Hospital --</option>
              {Object.entries(hospitals).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Location"
            />
          </div>
          <div>
          <CustomButton>
     Search
    </CustomButton>
          </div>
        </form>
      </div>

      <DoctorCard
        doctorData={filteredDoctors}
        loading={loading}
        hospitals={hospitals}
        specializations={specializations}
        onBookNow={handleBookNow}
      />

      {showPopup && selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit}>
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
            <div className="mb-4 flex gap-4">
              <div className="relative w-1/2">
                <select
                  value={hospitalID}
                  onChange={(e) => setHospitalID(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 
                  pl-6 pr-10 text-black outline-none focus:border-primary
                   dark:border-form-strokedark dark:bg-form-input dark:text-white
                    dark:focus:border-primary"
                >
                  {Object.entries(hospitals).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-1/2">
  <select
    name="doctor"
    value={selectedDoctorID}
    // Make sure this updates selectedDoctorID accordingly if the user changes the selection manually
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
                  className="w-full rounded-lg border border-stroke py-4 pl-4 pr-12
               text-black outline-none focus:border-primary"
                  includeTimes={generatedTimeSlots.map((slot) => slot.time)}
                />

                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
                {/* Timer Icon */}
                <span
                  className="absolute left-52 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#c2c3c4' }}
                >
                  <i className="fas fa-clock fa-xs"></i>
                </span>
              </div>
            </div>

            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
             className="w-full rounded-lg border border-stroke bg-transparent py-4 
                  pl-6 pr-10 text-black outline-none focus:border-primary
                   dark:border-form-strokedark dark:bg-form-input dark:text-white
                    dark:focus:border-primary"
              rows={3}
            ></textarea>

<div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gradient-to-b from-[#B22222] to-[#FF4500] 
                 hover:from-[#FF4500] hover:to-[#B22222] 
                 text-white transition duration-150 
                 ease-out hover:ease-in py-2 px-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
              type="submit"
              className="bg-gradient-to-b from-[#008000] to-[#00C853] 
              hover:from-[#00C853] hover:to-[#008000] 
              text-white transition duration-150 
              ease-out hover:ease-in py-2 px-2 rounded-lg">
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

const DoctorCard = ({ doctorData, loading, specializations,hospitals, onBookNow }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
    {loading ? (
      <p>Loading...</p>
    ) : (
      doctorData.map((doctor) => {
        const specializationName =
          doctor.specializationID && specializations[String(doctor.specializationID).trim()]
            ? specializations[String(doctor.specializationID).trim()]
            : "Unknown";
  
        return (
          <div
            key={doctor.doctorID}
           className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-100 
        transition-transform transform hover:scale-105 hover:shadow-lg w-full">
            {/* Line 1: Doctor Specialization | Hospital Name */}
            <div className="flex items-center w-full">
  {/* Doctor Name & Specialization - Left Aligned */}
  <div className="w-1/3 flex items-center">
  <FaStethoscope className="mr-2 text-blue-500" />
  <span className="font-bold text-gray-800 truncate">
    {doctor.doctorName} ({specializationName})
  </span>
</div>

{/* Extra Spacing Between Specialization and Hospital Name */}
<div className="w-1/3"></div> {/* Empty div for spacing */}

{/* Hospital Name - Center Aligned, Fixed Width to Align Properly */}
<div className="w-1/3 flex items-center justify-start text-orange-500 font-medium min-w-[200px] ml-8">
  <FaHospital className="mr-2 text-orange-400 flex-shrink-0" />
  <span className="truncate">{hospitals[doctor.hospitalID] || "Unknown"}</span>
</div>



  {/* Directions - Right Aligned */}
  <div className="w-1/3 flex justify-end">
    <a
      href="https://www.google.com/maps/search/Anna+nagar,+chennai"
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-500 hover:underline flex items-center"
    >
      <FaDirections className="mr-1" /> Directions
    </a>
  </div>
</div>





  
            {/* Line 2: Location | View More | Directions | Book Now */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <p className="flex items-center text-gray-700 font-medium truncate">
                  <FaMapMarkerAlt className="text-red-500 mr-2" /> Anna Nagar, Chennai
                </p>
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "View Less" : "View More"}
                </button>
              </div>
              <div className="flex items-center space-x-4">
              
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => onBookNow(doctor)}
                >
                  Book Now
                </button>
              </div>
            </div>
  
            {/* Show More Section */}
            {showMore && (
              <div className="mt-3 text-gray-600 truncate">
                Additional patient details can be shown here...
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
  
  
  
  );
};

export default SearchDoctors;
