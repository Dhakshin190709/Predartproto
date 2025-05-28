import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import api from '../api/request';
interface AppLOVOption {
  appLOVID: string;
  name: string;
}

const localizer = momentLocalizer(moment);

// Type definition for events
type Event = {
  title: string;
  start: Date;
  end: Date;
  status: string;
  doctor: string;
  patient: string;
  patientId: string;
};

const doctors = [
  { name: 'Dr. Smith', id: 1 },
  { name: 'Dr. Johnson', id: 2 },
  { name: 'Dr. Lee', id: 3 },
  { name: 'Dr. Brown', id: 4 },
  // Add more doctors as needed
];

const Calendar: React.FC = () => {
  const [selectedDoctorID, setSelectedDoctorID] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedHospitalID, setSelectedHospitalID] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [relationships, setRelationships] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [selectedOutsideDoctor, setSelectedOutsideDoctor] = useState('');

  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timeInterval, setTimeInterval] = useState<number>(10); // Default 10 min
  const [availableTimeRange, setAvailableTimeRange] = useState<{
    fromTime: Date | null;
    toTime: Date | null;
  }>({ fromTime: null, toTime: null });
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
  

  const [events, setEvents] = useState<Event[]>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(moment()); // Manage the current date for custom toolbar
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showMessage, setShowMessage] = useState<string | null>(null); // State for custom alert message
  // Default to 15 minutes interval
const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string | null>(null);

  const [doctors, setDoctors] = useState([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // Handle change of time interval from dropdown
  const handleTimeIntervalChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const interval = parseInt(e.target.value, 10);
    setTimeInterval(interval);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(moment()); // Update current time every minute
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);



useEffect(() => {
  if (!selectedDoctorID) return;

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get('/Doctor/GetDoctorTimeSlot');

      const data = Array.isArray(response.data.data) ? response.data.data : [];

      console.log('Fetched Time Slots Data:', data);

      const matchedTimeSlots = data.filter(
        (slot) => String(slot.doctorID) === selectedDoctorID
      );

      if (matchedTimeSlots.length) {
        console.log('Matched Time Slots:', matchedTimeSlots);

        const formattedSlots = matchedTimeSlots.map((slot) => ({
          timeSlotID: slot.timeSlotID,
          fromTime: slot.fromTime,
          toTime: slot.toTime,
          slotDuration: slot.slotDuration,
          day: slot.dayofWeek, // ensure this matches your API field name
        }));

        setAvailableTimeSlots(formattedSlots);
        console.log('Formatted Slots:', formattedSlots);

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
}, [selectedDoctorID]);


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

  const fetchRelationships = async () => {
  try {
    const response = await api.get('/AppLOV', {
      params: { type: 'Relationship' }, // ✅ Axios handles query params like this
    });

    const result = response.data;

    console.log('API Response:', result); // Check the response structure

    if (Array.isArray(result.data)) {
      setRelationships(result.data); // Set the fetched relationships
    } else {
      console.error('Invalid relationship data format:', result.data);
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



const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  // Get the current date and check if the selected date is in the past
  const currentDate = new Date();
  if (start < currentDate) {
    // If selected date is in the past, show a toast message
    toast.error('Please select date and time in the future');
    return; // Stop further execution
  }

  setSelectedEvent({
    title: '',
    start,
    end,
    status: 'Pending',
    doctor: '',
    patient: '',
    patientId: '',
  });

  setSelectedDoctor('');
  setPatientName('');
  setShowAddModal(true);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDayName = daysOfWeek[start.getDay()];
  const selectedTime = start.toTimeString().slice(0, 5); // HH:MM

  console.log('Selected Day:', selectedDayName);
  console.log('Selected Time:', selectedTime);

  // Find the slot that matches the selected day and time
  const matchedSlot = doctorAvailability.find((slot) => {
    // Convert the slot's fromTime to 'HH:MM' format for comparison
    const slotFromTime = slot.fromTime.slice(0, 5); // '09:00'

    // Compare the selected time with the slot's fromTime
    return (
      slot.dayofWeek === selectedDayName &&
      selectedTime >= slotFromTime &&  // Start time should be after or equal to the selected time
      selectedTime < slot.toTime &&   // Ensure the selected time is less than the slot's end time
      slot.doctorID === selectedDoctor
    );
  });

  if (matchedSlot) {
    console.log('Matched Slot Details:', matchedSlot);
    setSelectedTimeSlotID(matchedSlot.timeSlotID); // ✅ You now pass only selected day's slotID
    setSelectedDate(selectedDayName); // Set selected day along with the timeSlotID (use setSelectedDate here)
  } else {
    console.warn('No matching time slot found for the selected time.');
    setSelectedTimeSlotID(null);
    setSelectedDate(''); // Reset the selected day if no match is found
  }
};




  
  // Handle event click to edit the event
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDoctor(event.doctor);
    setShowEditModal(true);
  };

  // Function to validate and handle time change for the selected event

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const doctorID = e.target.value;
  setSelectedOutsideDoctor(doctorID);

  // Also update formData so that modal shows the correct doctor (for read-only)
  setFormData((prev) => ({ ...prev, doctor: doctorID }));

  // Find the selected doctor details
  const selectedDoctorDetails = doctors.find(
    (doctor) => doctor.doctorID === doctorID,
  );

  // If a valid doctor is selected, update hospital ID
  if (selectedDoctorDetails) {
    setSelectedHospitalID(selectedDoctorDetails.hospitalID || '');
  }

  // Fetch and log doctor time slots with timeslotID
  fetchDoctorTimeSlots(doctorID);
};

 useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const response = await api.get('/Hospital/List'); // use relative path with api instance
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

      // ✅ Filter active hospitals
      const activeHospitals = hospitalData.filter(
        (hospital) => hospital.isActive,
      );

      // ✅ Set hospitals and pre-select the first one
      setHospitals(activeHospitals);

      if (activeHospitals.length > 0) {
        setSelectedHospitalID(activeHospitals[0].hospitalID);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]); // fallback
    }
  };

  fetchHospitals();
}, []);


 const fetchDoctors = async () => {
  try {
    const unitID = sessionStorage.getItem('unitID');

    if (!unitID) {
      console.warn('No unitID found in sessionStorage');
      setDoctors([]);
      return;
    }

    const response = await api.get(`/Doctor`, {
      params: {
        hospitalId: unitID,
      },
    });

    const result = response.data;

    if (result.success && Array.isArray(result.data)) {
      setDoctors(result.data);
    } else {
      console.error('Invalid doctor data format:', result.data);
      setDoctors([]);
    }
  } catch (error) {
    console.error('Error fetching doctors:', error);
    setDoctors([]);
  }
};



  useEffect(() => {
    if (selectedHospitalID) {
      fetchDoctors(selectedHospitalID);
      setSelectedDoctor(''); // reset selected doctor
    }
  }, [selectedHospitalID]);

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

  

const fetchDoctorAvailability = async (doctorID: string) => {
  if (!doctorID) return;

  try {
    const response = await api.get('/Doctor/GetDoctorTimeSlot', {
      params: { doctorId: doctorID }, // Axios handles query params
    });

    const result = response.data;

    if (result.success && Array.isArray(result.data)) {
      setDoctorAvailability(result.data);

      // Log available time slots with their timeSlotID
      console.log('Available Time Slots for Doctor:', result.data);

      result.data.forEach((slot) => {
        console.log(
          `TimeSlot ID: ${slot.timeSlotID}, Time: ${slot.startTime} - ${slot.endTime}`
        );
      });

      // Find the slot duration for the selected day
      const selectedDayOfWeek = selectedDate?.getDay();
      const availability = result.data.find(
        (slot) => slot.dayofWeek === selectedDayOfWeek
      );

      if (availability && availability.slotDuration) {
        setTimeInterval(availability.slotDuration);
      }
    } else {
      console.error('Invalid doctor availability format:', result.data);
      setDoctorAvailability([]);
    }
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    setDoctorAvailability([]);
  }
};

  const getAvailableTimeRange = () => {
    return {
      fromTime: availableTimeRange.fromTime
        ? availableTimeRange.fromTime
        : new Date('1970-01-01T00:00:00'), // Default 12 AM
      toTime: availableTimeRange.toTime
        ? availableTimeRange.toTime
        : new Date('1970-01-01T23:50:00'), // Default 11:50 PM
    };
  };

  // Fetch doctor availability when doctor selection changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorAvailability(selectedDoctor);
    }
  }, [selectedDoctor, selectedDate]);

  const filterTimeSlots = (
    slots: string[],
    fromTime: string,
    toTime: string,
  ) => {
    const from = new Date(`1970-01-01T${fromTime}`); // Convert string to Date
    const to = new Date(`1970-01-01T${toTime}`);

    return slots.filter((slot) => {
      const slotTime = new Date(`1970-01-01T${slot}:00`);
      return slotTime >= from && slotTime <= to;
    });
  };

  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
  ) => {
    const slots = [];
    let start = new Date(`2000-01-01T${fromTime}`);
    const end = new Date(`2000-01-01T${toTime}`);

    while (start <= end) {
      // Format time as HH:mm
      const formattedTime = start.toTimeString().slice(0, 5);
      slots.push(formattedTime);

      // Add slot duration
      start.setMinutes(start.getMinutes() + slotDuration);
    }

    return slots;
  };

const fetchDoctorTimeSlots = async (doctorID: string) => {
  if (!doctorID) return;

  try {
    const response = await api.get(`/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`);
    const result = response.data;

    console.log('API Response:', result); // Log entire response for debugging

    if (
      result.success &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      let fromTime: Date | null = null;
      let toTime: Date | null = null;
      let slotDuration = result.data[0]?.slotDuration || 10; // Default 10 min

      // Iterate over the available time slots
      result.data.forEach((slot: any) => {
        console.log('Slot:', slot); // Log the entire slot object

        if (slot.timeSlotID) {
          console.log('TimeslotID:', slot.timeSlotID); // Log timeslotID for debugging
        } else {
          console.warn('Missing timeSlotID in slot:', slot); // Warn if timeSlotID is missing
        }

        const slotFromTime = new Date(`1970-01-01T${slot.fromTime}`);
        const slotToTime = new Date(`1970-01-01T${slot.toTime}`);

        if (!fromTime || slotFromTime < fromTime) fromTime = slotFromTime;
        if (!toTime || slotToTime > toTime) toTime = slotToTime;
      });

      setTimeInterval(slotDuration);
      setAvailableTimeRange({ fromTime, toTime });
    } else {
      console.error('No valid slots found for this doctor.');
      setTimeInterval(10);
      setAvailableTimeRange({
        fromTime: new Date('1970-01-01T00:00:00'), // Default 12 AM
        toTime: new Date('1970-01-01T23:50:00'),   // Default 11:50 PM
      });
    }
  } catch (error) {
    console.error('Error fetching doctor time slots:', error);
    setTimeInterval(10);
    setAvailableTimeRange({
      fromTime: new Date('1970-01-01T00:00:00'),
      toTime: new Date('1970-01-01T23:50:00'),
    });
  }
};




  // Function to handle start time changes
  const handleStartTimeChange = (date: Date | null) => {
    if (date && selectedEvent) {
      const now = new Date();

      // Prevent selecting past dates/times
      if (date < now) {
        setShowMessage(
          'You cannot select a past time. Please select a future time.',
        );
        return;
      }
      setShowMessage(null);

      // Preserve original date but update time
      const updatedStartTime = new Date(selectedEvent.start);
      updatedStartTime.setFullYear(date.getFullYear());
      updatedStartTime.setMonth(date.getMonth());
      updatedStartTime.setDate(date.getDate());
      updatedStartTime.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        0,
      );

      // Adjust end time based on the new start time
      const updatedEndTime = new Date(
        updatedStartTime.getTime() +
          (selectedEvent.end.getTime() - selectedEvent.start.getTime()),
      );

      // Update the selected event
      const updatedEvent = {
        ...selectedEvent,
        start: updatedStartTime,
        end: updatedEndTime,
      };

      // Update state with the new event details
      setSelectedEvent(updatedEvent);
      setEvents(
        events.map((event) =>
          event.start === selectedEvent.start &&
          event.doctor === selectedEvent.doctor
            ? updatedEvent
            : event,
        ),
      );

      // Ensure the formData is updated with the selected date and time
      setFormData((prev) => ({
        ...prev,
        date: updatedStartTime.toISOString().split('T')[0], // YYYY-MM-DD
        time: updatedStartTime.toTimeString().split(' ')[0], // HH:MM:SS
      }));
    }
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const userID = sessionStorage.getItem('userID');

  if (!userID) {
    alert('User not logged in. Please log in again.');
    return;
  }

  const appointmentDate =
    formData.date || selectedEvent.start.toISOString().split('T')[0];
  console.log('Selected Appointment Date:', appointmentDate);

  const appointmentDay = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  console.log('Converted Appointment Day:', appointmentDay);

  const selectedSlot = doctorAvailability.find(
    (slot) => slot.dayofWeek.toLowerCase() === appointmentDay.toLowerCase(),
  );

  console.log('Selected Slot:', selectedSlot);

  if (!selectedSlot) {
    alert('No available timeslot found for the selected date.');
    return;
  }

  const payload = {
    createdBy: userID,
    isActive: true,
    doctorID: formData.doctor || selectedDoctor,
    patientID: '1e3b8a00-d9c7-453d-aa97-005281e76f80',
    timeSlotID: selectedSlot.timeSlotID,
    appointmentDate,
    appointmentTime:
      formData.time || selectedEvent.start.toTimeString().split(' ')[0],
    statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
    notes: formData.reason || '',
    toWhom: appointmentType,
    relationship: selectedRelationship,
    phoneNumber: formData.phoneNumber || '',
  };

  try {
    const response = await api.post('/Appointment', payload);

    if (response.status === 200 || response.status === 201) {
      setSuccessMessage('Form submitted successfully!');
      console.log('Form Submitted:', payload);

      // Reset form and states
      setFormData({
        doctor: '',
        date: '',
        time: '',
        reason: '',
        phoneNumber: '',
      });
      setSelectedDoctor('');
      setSelectedHospitalID('');
      setSelectedRelationship('');
      setAppointmentType('');
      setShowAddModal(false);
    } else {
      console.error('Submission failed:', response.data);
      setSuccessMessage('Submission failed. Please try again.');
    }
  } catch (error: any) {
    console.error('Error during submission:', error);
    setSuccessMessage('An error occurred. Please try again later.');
  }
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

  useEffect(() => {
  const fetchOptions = async () => {
    try {
      const response = await api.get('/AppLOV', {
        params: { type: 'toWhom' }, // use params instead of query string in URL
      });
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

  // Function to handle the cancellation of an appointment
  const handleCancelAppointment = () => {
    setShowCancelConfirmation(true); // Show the cancel confirmation modal
  };

  // Function to confirm cancellation and delete the event
  const confirmCancel = () => {
    if (selectedEvent) {
      const updatedEvents = events.filter(
        (event) =>
          event.start !== selectedEvent.start ||
          event.doctor !== selectedEvent.doctor,
      );
      setEvents(updatedEvents); // Update the events state
      setShowEditModal(false);
      setShowCancelConfirmation(false);
    }
  };

  // Function to cancel cancellation (close confirmation without deleting)
  const cancelCancel = () => {
    setShowCancelConfirmation(false); // Close the cancel confirmation modal
  };

  // Event style getter
  const eventStyleGetter = (event: Event) => {
    const backgroundColor =
      event.status === 'Booked'
        ? 'width-100% bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 w-fit text-center' // Change 'w-fit' to 'w-full' for full width
        : 'bg-gray-300 text-black';

    return {
      className: `${backgroundColor} rounded-md shadow-md p-2 cursor-pointer`,
      style: {
        border: 'none',
        boxShadow: 'none',
        width: '100%',
      },
    };
  };

  // Custom toolbar component to display current week and navigation buttons
  const CustomToolbar = ({ label, onNavigate }: any) => {
    // Calculate the start and end of the current week
    const startOfWeek = currentDate.clone().startOf('week');
    const endOfWeek = currentDate.clone().endOf('week');
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');

    // Format the week date range
    const dateRange = `${startOfWeek.format('DD/MM/YYYY')} to ${endOfWeek.format('DD/MM/YYYY')}`;

    return (
      <div className="rbc-toolbar w-full flex justify-between items-center">
        {/* Time Interval Dropdown (Left side) */}
        <div className="flex items-center justify-between w-full px-4">
          {/* Left Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-black">Doctor:</label>
            <select
              name="outsideDoctor"
              value={selectedOutsideDoctor} // ✅ Bind the value
              onChange={handleDoctorChange} // ✅ Your existing handler
              className="w-fit rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Select a Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctorID} value={doctor.doctorID}>
                  {doctor.doctorName}
                </option>
              ))}
            </select>
          </div>

          {/* center Dropdown */}
          <div className="flex items-center">
            <label className="mr-2 text-black"> Interval:</label>
            <select
              value={timeInterval}
              onChange={(e) => setTimeInterval(Number(e.target.value))}
              className="w-fit rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          {/* right Week Navigation Buttons */}
          <div className="flex items-center space-x-4">
            {/* Previous Month Button (<<) */}
            <span
              className="text-xl font-bold text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().subtract(1, 'month'));
                onNavigate('PREV');
              }}
            >
              {'<<'}
            </span>

            {/* Previous Week Button (<) */}
            <span
              className="text-xl font-bold text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().subtract(1, 'week'));
                onNavigate('PREV');
              }}
            >
              {'<'}
            </span>

            {/* Current Week Display */}
            <span className="text-xl font-bold text-black dark:text-white">
              {dateRange}
            </span>

            {/* Next Week Button (>) */}
            <span
              className="text-xl font-bold text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().add(1, 'week'));
                onNavigate('NEXT');
              }}
            >
              {'>'}
            </span>

            {/* Next Month Button (>>) */}
            <span
              className="text-xl font-bold text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().add(1, 'month'));
                onNavigate('NEXT');
              }}
            >
              {'>>'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const { fromTime, toTime } = getAvailableTimeRange();
  // Handle Date Selection Change
  const handleDateChange = (date: Date | null) => {
  if (!date) return;

  console.log('Selected Date:', date);
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedTime = date.toTimeString().split(' ')[0]; // HH:MM:SS
  const selectedDay = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

  console.log('Formatted Date:', formattedDate);
  console.log('Formatted Time:', formattedTime);
  console.log('Day of Week:', selectedDay);

  // Match against availableTimeSlots
  const matchedSlot = availableTimeSlots.find(
    (slot) => slot.day.toLowerCase() === selectedDay.toLowerCase()
  );

  if (matchedSlot) {
    console.log('Matched Slot Info:');
    console.log('Day:', matchedSlot.day);
    console.log('From Time:', matchedSlot.fromTime);
    console.log('To Time:', matchedSlot.toTime);
    console.log('Slot Duration:', matchedSlot.slotDuration);
    console.log('TimeSlot ID:', matchedSlot.timeSlotID);
  } else {
    console.warn('No slot found for this day');
  }

  setSelectedDate(date);

  setFormData((prev) => ({
    ...prev,
    date: formattedDate,
    time: formattedTime,
  }));
};

 const [patients, setPatients] = useState([]);

 useEffect(() => {
  const fetchPatients = async () => {
    try {
      const tenantID = sessionStorage.getItem('tenantID');
      if (!tenantID) {
        console.warn('No tenantID found in sessionStorage');
        setPatients([]);
        return;
      }

      const response = await api.get(`/Patient?tenantID=${tenantID}`);

      // Since there's no `isActive` field, just use the full data
      setPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    }
  };

  fetchPatients();
}, []);



  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-full lg:h-full">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['week', 'month']}
          defaultView="week"
          step={timeInterval} // ✅ Uses slot duration dynamically
          timeslots={1}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          formats={{
            eventTimeRangeFormat: () => '', // Hide event time range
          }}
          components={{
            event: ({ event }) => (
              <span>
                {event.patient} ({event.patientId})
              </span>
            ),
            toolbar: CustomToolbar,
          }}
          selectable={true}
          scrollToTime={getAvailableTimeRange().fromTime} // ✅ Scrolls to 12 AM if no slots
          min={getAvailableTimeRange().fromTime} // ✅ Ensures min is 12 AM
          max={getAvailableTimeRange().toTime} // ✅ Ensures max is 11:50 PM
        />
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="mb-2.5 text-2xl font-bold text-black dark:text-white">
              Add New Appointment
            </h2>

            <form onSubmit={handleSubmit}>
             
              {/* Name */}
              <div className="mb-4 flex gap-4">
                <div className="relative w-1/2">
                  <select
                    name="patientID"
                    value={formData.patientID}
                    onChange={(e) => {
                      const selectedID = e.target.value;
                      const selectedPatient = patients.find(
                        (p) => p.patientID === selectedID,
                      );

                      setFormData((prev) => ({
                        ...prev,
                        patientID: selectedID,
                        name: selectedPatient?.patientName || '',
                        phoneNumber: selectedPatient?.patientPhoneNumber || '',
                      }));
                    }}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patientID} value={patient.patientID}>
                        {patient.patientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="phoneNumber"
                    maxLength={10}
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    readOnly
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
                </div>

                {/* Doctor Dropdown in Modal */}
                <div className="relative w-1/2">
                  <select
                    name="doctor"
                    value={formData.doctor || ''}
                    disabled // 👈 Make it read-only
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctorID} value={doctor.doctorID}>
                        {doctor.doctorName}
                      </option>
                    ))}
                  </select>
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
              {/* Start Time (date and time picker) */}
              <div className="mb-2.5 block font-medium text-black dark:text-white">
                <DatePicker
                  selected={selectedEvent ? selectedEvent.start : new Date()}
                  onChange={handleDateChange}
                  showTimeSelect
                  minTime={fromTime} // Restrict minimum selectable time for selected day
                  maxTime={toTime} // Restrict maximum selectable time for selected day
                  dateFormat="Pp"
                  className="w-full rounded-lg border border-stroke 
  bg-transparent py-4 pl-6 pr-10 text-black outline-none
   focus:border-primary focus-visible:shadow-none
    dark:border-stroke-dark dark:bg-transparent
     dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
                />
              </div>
              {/* Save and Cancel Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-gray-500 text-black py-1 px-3 rounded-md"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                 hover:from-[#007BFF] hover:to-[#004A99] text-white
                  transition duration-150 ease-out hover:ease-in rounded-lg px-5 py-2 mt-2 w-fit text-center"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer
              position="top-right"
              autoClose={3000}
              style={{ zIndex: 9999 }}
            />
    </div>
  );
};

export default Calendar;
