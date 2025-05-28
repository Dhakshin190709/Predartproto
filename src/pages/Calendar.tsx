import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
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

const Calendar: React.FC = () => {
  const [selectedDoctorID, setSelectedDoctorID] = useState(null);

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedHospitalID, setSelectedHospitalID] = useState(
    sessionStorage.getItem('unitID') || '',
  );
  const [selectedDoctor, setSelectedDoctor] = useState(
    sessionStorage.getItem('doctorID') || '',
  );
const hasFetched = useRef(false);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [appointmentType, setAppointmentType] = useState('');
  const [relationships, setRelationships] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredRelationships, setFilteredRelationships] = useState<string[]>(
    [],
  );
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // default today

  const [doctorName, setDoctorName] = useState('');

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
  const [selectedEvent, setSelectedEvent] = useState({
    title: '',
    start: null,
    end: null,
    status: '',
    doctor: '',
    patient: '',
    patientId: '',
    timeSlotID: null, // <-- add this
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const [currentDate, setCurrentDate] = useState(moment()); // Manage the current date for custom toolbar
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showMessage, setShowMessage] = useState<string | null>(null); // State for custom alert message
  // Default to 15 minutes interval

  const [doctors, setDoctors] = useState([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState([]);

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
    const doctorID = selectedDoctorID || sessionStorage.getItem('doctorID');
    if (!doctorID) return;

    const fetchTimeSlots = async () => {
      try {
        const response = await api.get('/Doctor/GetDoctorTimeSlot');
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        console.log('Fetched Time Slots Data:', data);

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

 const fetchAppointments = async (doctorID: string) => {
  try {
    const response = await api.get(`/Appointment/GetAppointment?DoctorID=${doctorID}`);
    const data = response.data;

    if (Array.isArray(data)) {
      const parsedAppointments = data.map((appt: any) => {
        const date = new Date(appt.appointmentDate);
        const [hours, minutes] = appt.appointmentTime.split(':');
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(0);

        return {
          start: new Date(date),
          end: new Date(date.getTime() + timeInterval * 60000), // add slot duration
          title: appt.patientName,
          status: 'booked',
        };
      });

      setBookedAppointments(parsedAppointments);
    }
  } catch (err) {
    console.error('Failed to fetch appointments', err);
  }
};


  const fetchRelationships = async () => {
    try {
      const response = await api.get('/AppLOV?type=Relationship');
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

  // Handle selecting a time slot and matching it to available slots

  // const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  //   const toMinutes = (timeStr: string) => {
  //     const [hh, mm, ss] = timeStr.split(':').map(Number);
  //     return hh * 60 + mm;
  //   };

  //   const formatDateToMinutes = (date: Date) => {
  //     return date.getHours() * 60 + date.getMinutes();
  //   };

  //   const selectedStartMin = formatDateToMinutes(start);
  //   const selectedEndMin = formatDateToMinutes(end);

  //   console.log('Slot selected:');

  //   const formatToHHMMSS = (date: Date) =>
  //     date.toTimeString().split(' ')[0]; // returns 'HH:MM:SS'

  //   console.log('Start Time:', formatToHHMMSS(start));
  //   console.log('End Time:', formatToHHMMSS(end));

  //   const selectedDay = start.toLocaleDateString('en-US', { weekday: 'long' });

  //   // Check if the selected start time (both date and time) is in the past
  //   const now = new Date();
  //   now.setSeconds(0, 0); // Reset seconds and milliseconds to make sure we're comparing minutes accurately

  //   if (start < now) {
  //     toast.error('Please select a time that is in the future ');
  //     return; // Prevent the selection of past times and dates
  //   }

  //   // Check if the selected slot is already booked in the future
  //   const isSlotBooked = bookedAppointments.some((appointment) => {
  //     return (
  //       appointment.start.getTime() === start.getTime() && // Compare start times
  //       appointment.status === 'booked' &&
  //       appointment.start >= now // Ensure it's a future booking
  //     );
  //   });

  //   if (isSlotBooked) {
  //     toast.error('This appointment slot is already booked for the future. Please choose another time.');
  //     return; // Prevent booking for already booked slots in the future
  //   }

  //   const matchingSlot = availableTimeSlots.find((slot) => {
  //     const slotStart = toMinutes(slot.fromTime); // e.g., 540
  //     const slotEnd = toMinutes(slot.toTime); // e.g., 720
  //     return (
  //       selectedStartMin >= slotStart &&
  //       selectedEndMin <= slotEnd &&
  //       slot.day === selectedDay
  //     );
  //   });

  //   if (!matchingSlot) {
  //     console.warn('No matching timeslot found for selected time.');
  //     toast.error('No available time slots for the selected date and time.');
  //   } else if (matchingSlot.status === 'booked') {
  //     console.warn('Selected timeslot is already booked.');
  //     toast.error('You cannot select a booked appointment. Please choose another time.');
  //   } else {
  //     console.log('✅ Matched Slot Details:');
  //     console.log('TimeSlot ID:', matchingSlot.timeSlotID);

  //     setSelectedEvent({
  //       title: '',
  //       start,
  //       end,
  //       status: 'Pending',
  //       doctor: '',
  //       patient: '',
  //       patientId: '',
  //       timeSlotID: matchingSlot.timeSlotID,
  //     });

  //     setSelectedDoctor('');
  //     setPatientName('');
  //     setShowAddModal(true);
  //   }
  // };

  // Handle the click event of an existing event (Edit Event)
  const handleEventClick = (event: Event) => {
    // Set the selected event
    setSelectedEvent(event);

    // Optionally, if the event has a timeSlotID, you could do something with it
    if (event.timeSlotID) {
      console.log('TimeSlot ID from Event:', event.timeSlotID);
    }

    // Set the selected doctor (assuming the event contains a doctor)
    setSelectedDoctor(event.doctor);

    // Show the edit modal
    setShowEditModal(true);
  };

  // Function to validate and handle time change for the selected event

  // const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const doctorID = e.target.value;
  //   setSelectedDoctor(doctorID); // ✅ Update selectedDoctor state
  //   setFormData((prev) => ({ ...prev, doctor: doctorID })); // ✅ Ensure doctorID is updated in formData

  //   // Find the associated hospital for the selected doctor
  //   const selectedDoctorDetails = doctors.find(
  //     (doctor) => doctor.doctorID === doctorID,
  //   );
  //   if (selectedDoctorDetails) {
  //     setSelectedHospitalID(selectedDoctorDetails.hospitalID || ''); // ✅ Auto-set hospital
  //   }

  //   console.log('Selected Doctor ID:', doctorID);
  //   fetchDoctorTimeSlots(doctorID);
  // };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/Hospital/List');
        const result = response.data;

        let hospitals = [];

        if (Array.isArray(result)) {
          hospitals = result;
        } else if (Array.isArray(result?.data)) {
          hospitals = result.data;
        } else {
          console.error('Invalid hospital data format:', result);
          setHospitals([]);
          return;
        }

        const activeHospitals = hospitals.filter((h) => h.isActive === true);
        setHospitals(activeHospitals);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
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

  // Fetch Doctors
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/Doctor');
      const result = response.data;

      if (result.success && Array.isArray(result.data)) {
        setDoctors(result.data);

        const loggedInDoctorID = sessionStorage.getItem('doctorID');

        const loggedInDoctor = result.data.find(
          (doc) => String(doc.doctorID) === String(loggedInDoctorID),
        );
        if (loggedInDoctor) {
          setSelectedDoctor(loggedInDoctor.doctorID);
          setDoctorName(loggedInDoctor.doctorName);
         // fetchDoctorTimeSlots(loggedInDoctor.doctorID);
        }
      } else {
        console.error('Invalid doctor data format:', result.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  
  // Fetch Doctor Time Slots
  const fetchDoctorTimeSlots = async (doctorID) => {
    if (!doctorID) return;

    try {
      const response = await api.get(
        `/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
      );
      const result = response.data;

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        let fromTime = null;
        let toTime = null;
        let slotDuration = result.data[0]?.slotDuration || 10;

        result.data.forEach((slot) => {
          const slotFromTime = new Date(`1970-01-01T${slot.fromTime}`);
          const slotToTime = new Date(`1970-01-01T${slot.toTime}`);

          console.log('TimeSlot ID:', slot.timeSlotID);

          if (!fromTime || slotFromTime < fromTime) fromTime = slotFromTime;
          if (!toTime || slotToTime > toTime) toTime = slotToTime;
        });

        setTimeInterval(slotDuration);
        setAvailableTimeRange({ fromTime, toTime });
      } else {
        console.error('No valid slots found for this doctor.');
        setTimeInterval(10);
        setAvailableTimeRange({
          fromTime: new Date('1970-01-01T00:00:00'),
          toTime: new Date('1970-01-01T23:50:00'),
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

  // Use effect to fetch doctors when the component mounts
  useEffect(() => {
    fetchDoctors(); // Fetch the doctor data
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');

    if (!userID || !doctorID) {
      toast.error('User or Doctor not logged in. Please log in again.');
      return;
    }

    // Ensure a slot is selected
    if (!selectedEvent || !selectedEvent.start || !selectedEvent.timeSlotID) {
      toast.error('No timeslot has been selected.');
      return;
    }

    const appointmentDate = selectedEvent.start.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    const appointmentTime = selectedEvent.start.toTimeString().split(' ')[0]; // Format: HH:MM:SS

    const appointmentDay = new Date(appointmentDate).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      },
    );

    console.log('appointmentDay:', appointmentDay);
    console.log(
      'doctorAvailability days:',
      doctorAvailability.map((s) => s.dayofWeek),
    );

    if (!formData.patientID) {
      toast.warn('Please select a patient.');
      return;
    }

    if (!formData.reason || formData.reason.trim() === '') {
      toast.warn('Please enter notes before submitting.');
      return;
    }

    const payload = {
      createdBy: userID,
      isActive: true,
      doctorID,
      patientID: formData.patientID,
      timeSlotID: selectedEvent.timeSlotID,
      appointmentDate,
      appointmentTime,
      statusID: 'f79e15f9-61ec-41ba-9b62-289025f6a2a8',
      notes: formData.reason,
      toWhom: 'ae34b43e-74cf-4328-7794-08dd561d6477',
      relationship: 'ae34b43e-74cf-4328-7794-08dd561d6477',
      phoneNumber: formData.phoneNumber || '',
    };

    console.log(payload);

    try {
      const response = await api.post('/Appointment', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Appointment booked successfully!');
        setFormData({
          doctor: '',
          date: '',
          time: '',
          reason: '',
          phoneNumber: '',
          patientID: '',
        });
        setSelectedDoctor('');
        setSelectedHospitalID('');
        setAppointmentType('');
        setShowAddModal(false);
      } else {
        toast.error('Submission failed. Please try again.');
        console.error('Submission failed:', response.data);
      }
    } catch (error) {
      console.error(
        'Error during submission:',
        error.response || error.message || error,
      );
      toast.error('An error occurred. Please try again later.');
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

  const generateTimeSlots = (fromTime, toTime, interval) => {
    const slots = [];
    let current = new Date(fromTime);

    // Clear seconds and milliseconds
    current.setSeconds(0, 0);
    toTime.setSeconds(0, 0);

    while (current < toTime) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#4CAF50'; // Default color
    if (event.status === 'booked') {
      backgroundColor = '#f44336'; // Red for booked events
    }

    return {
      style: {
        backgroundColor,
        color: 'white',
        border: 'none',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center', // vertical centering
        justifyContent: 'center', // horizontal centering
        fontSize: '12px',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        textAlign: 'center',
        boxSizing: 'border-box',
      },
    };
  };

 

  useEffect(() => {
  if (hasFetched.current) return; // 🚫 If already called, do nothing

  hasFetched.current = true; // ✅ Mark it as called once

  const doctorID = sessionStorage.getItem('doctorID');

  if (doctorID) {
    setSelectedDoctor(doctorID);
    fetchDoctorTimeSlots(doctorID);
    fetchAppointments(doctorID);
  }
}, []);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(bookedAppointments); // You can later merge with custom user events
  }, [bookedAppointments]);

  const handleOptionChange = (selectedOption: AppLOVOption) => {
    setAppointmentType(selectedOption.appLOVID); // ✅ Store the ID
    console.log(
      `Selected: ${selectedOption.name}, appLOVID: ${selectedOption.appLOVID}`,
    );
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
              name="doctor"
              value={selectedDoctor || ''}
              className="w-fit rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              disabled
            >
              <option value={selectedDoctor}>
                {doctorName || 'Doctor Name'}
              </option>
            </select>
          </div>

          {/* center Dropdown */}
          <div className="flex items-center">
            <label className="mr-2 text-black"> Interval:</label>
            <select
              value={timeInterval}
              className="w-fit rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              disabled
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
              className="text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().subtract(1, 'month'));
                onNavigate('PREV');
              }}
            >
              <ChevronsLeft className="w-6 h-6 hover:text-primary transition" />
            </span>

            {/* Previous Week Button (<) */}
            <span
              className="text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().subtract(1, 'week'));
                onNavigate('PREV');
              }}
            >
              <ChevronLeft className="w-6 h-6 hover:text-primary transition" />
            </span>

            {/* Current Week Display */}
            <span className="text-xl font-bold text-black dark:text-white">
              {dateRange}
            </span>

            {/* Next Week Button (>) */}
            <span
              className="text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().add(1, 'week'));
                onNavigate('NEXT');
              }}
            >
              <ChevronRight className="w-6 h-6 hover:text-primary transition" />
            </span>

            {/* Next Month Button (>>) */}
            <span
              className="text-black dark:text-white cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.clone().add(1, 'month'));
                onNavigate('NEXT');
              }}
            >
              <ChevronsRight className="w-6 h-6 hover:text-primary transition" />
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
    console.log('Formatted Date:', date.toISOString().split('T')[0]);
    console.log('Formatted Time:', date.toTimeString().split(' ')[0]); // HH:MM:SS format

    setSelectedDate(date);

    setFormData((prev) => ({
      ...prev,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      time: date.toTimeString().split(' ')[0], // HH:MM:SS
    }));
  };
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/Patient');
        const activePatients =
          response.data?.data?.filter((p) => p.isActive) ?? [];
        setPatients(activePatients);
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
          // onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          formats={{
            eventTimeRangeFormat: () => '', // Hide event time range
          }}
          components={{
            event: ({ event }) => <span>{event.title}</span>,
            toolbar: CustomToolbar,
          }}
          selectable={true}
          scrollToTime={getAvailableTimeRange().fromTime} // ✅ Scrolls to 12 AM if no slots
          min={getAvailableTimeRange().fromTime} // ✅ Ensures min is 12 AM
          max={getAvailableTimeRange().toTime} // ✅ Ensures max is 11:50 PM
        />
      </div>

      {/* Add Appointment Modal */}
      {/* {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="mb-2.5 text-2xl font-bold text-black dark:text-white">
              Add New Appointment
            </h2>

            <form onSubmit={handleSubmit}>     

            
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

             
              <div className="mb-4 flex gap-4">
             
                <div className="relative w-1/2">
                  <select
                    name="hospital"
                    value={selectedHospitalID}
                    onChange={(e) => setSelectedHospitalID(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled
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

              
                <div className="relative w-1/2">
                  <select
                    name="doctor"
                    value={selectedDoctor || ''}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled
                  >
                    <option value={selectedDoctor}>
                      {doctorName || 'Doctor Name'}
                    </option>
                  </select>
                </div>
              </div>

             
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
            
              <div className="mb-2.5 block font-medium text-black dark:text-white">
                <DatePicker
                  selected={selectedEvent ? selectedEvent.start : new Date()}
                  onChange={handleDateChange}
                  showTimeSelect
                  minTime={fromTime} 
                  maxTime={toTime} 
                  dateFormat="Pp"
                  className="w-full rounded-lg border border-stroke 
  bg-transparent py-4 pl-6 pr-10 text-black outline-none
   focus:border-primary focus-visible:shadow-none
    dark:border-stroke-dark dark:bg-transparent
     dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
                />
              </div>
           
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-gray-500 text-black py-1 px-3 rounded-md"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>

                <CustomButton type="submit">save</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )} */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 9999 }}
      />
      {/* Inline styles */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");

        .rbc-event {
  height: 4% !important;
  width: 107% !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius:0 !important;
}
.rbc-timeslot-group {
  position: relative;
}
.rbc-event-content {
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.Toastify__toast {
  z-index: 9999; /* Ensure it's high enough */
}

.popup-modal {
  z-index: 9998; /* Ensure it's below the toast */
}

      `}</style>
    </div>
  );
};

export default Calendar;
