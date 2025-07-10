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

interface TimeSlotInput {
  timeSlotID: string;
  fromTime: string; // e.g., "09:00:00"
  toTime: string; // e.g., "12:00:00"
  slotDuration: number;
  day: string;
}

interface BookedSlot {
  appointmentDate: string; // e.g., "2025-06-04T00:00:00"
  appointmentTime: string; // e.g., "09:15:00"
}

interface SubSlot {
  parentSlotID: string;
  fromTime: string;
  toTime: string;
  day: string;
}

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
  const [matchedDaySlots, setMatchedDaySlots] = React.useState<TimeSlotType[]>(
    [],
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotID, setSelectedSlotID] = useState<string | null>(null);
  const [selectedOutsideDoctor, setSelectedOutsideDoctor] = useState('');
  const [availableTimeOptions, setAvailableTimeOptions] = useState([]);
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
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [toastInProgress, setToastInProgress] = useState(false);

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(moment()); // Manage the current date for custom toolbar
  const [options, setOptions] = useState<AppLOVOption[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showMessage, setShowMessage] = useState<string | null>(null); // State for custom alert message
  // Default to 15 minutes interval
  const [selectedTimeSlotID, setSelectedTimeSlotID] = useState<string | null>(
    null,
  );
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null,
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
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

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];

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
    const toMinutes = (timeStr: string) => {
      const [hh, mm, ss] = timeStr.split(':').map(Number);
      return hh * 60 + mm;
    };

    const formatDateToMinutes = (date: Date) => {
      return date.getHours() * 60 + date.getMinutes();
    };

    const selectedStartMin = formatDateToMinutes(start);
    const selectedEndMin = formatDateToMinutes(end);

    console.log('Slot selected:');

    const formatToHHMMSS = (date: Date) => date.toTimeString().split(' ')[0]; // returns 'HH:MM:SS'

    console.log('Start Time:', formatToHHMMSS(start));
    console.log('End Time:', formatToHHMMSS(end));

    const selectedDay = start.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if the selected start time (both date and time) is in the past
    const now = new Date();
    now.setSeconds(0, 0); // Reset seconds and milliseconds to make sure we're comparing minutes accurately

    if (start < now) {
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('Please select a time that is in the future.', {
          onClose: () => setToastInProgress(false),
        });
      }
      return;
    }

    // Check if the selected slot is already booked in the future
    const isSlotBooked = bookedAppointments.some((appointment) => {
      return (
        appointment.start.getTime() === start.getTime() && // Compare start times
        appointment.status === 'booked' &&
        appointment.start >= now // Ensure it's a future booking
      );
    });

    if (isSlotBooked) {
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('This appointment slot is already booked.', {
          onClose: () => setToastInProgress(false),
        });
      }
      return;
    }

    const matchingSlot = availableTimeSlots.find((slot) => {
      const slotStart = toMinutes(slot.fromTime); // e.g., 540
      const slotEnd = toMinutes(slot.toTime); // e.g., 720
      return (
        selectedStartMin >= slotStart &&
        selectedEndMin <= slotEnd &&
        slot.day === selectedDay
      );
    });

    if (!matchingSlot) {
      console.warn('No matching timeslot found for selected time.');
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('No available time slots for the selected date and time.', {
          onClose: () => setToastInProgress(false),
        });
      }
      return; // ← Don't forget this return!
    } else if (matchingSlot.status === 'booked') {
      console.warn('Selected timeslot is already booked.');
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error(
          'You cannot select a booked appointment. Please choose another time.',
          {
            onClose: () => setToastInProgress(false),
          },
        );
      }
      return; // ← Also return here!
    } else {
      console.log('✅ Matched Slot Details:');
      console.log('TimeSlot ID:', matchingSlot.timeSlotID);

      setSelectedEvent({
        title: '',
        start,
        end,
        status: 'Pending',
        doctor: '',
        patient: '',
        patientId: '',
        timeSlotID: matchingSlot.timeSlotID,
      });

      setSelectedDoctor('');
      setPatientName('');
      setShowAddModal(true);
    }
  };

  // Handle event click to edit the event
  const handleEventClick = (event: Event) => {
    console.log('Clicked Slot Details:', event);
    console.log('Selected Slot ID:', event.slotID);

    setSelectedSlotID(event.slotID); // ✅ Store for form use
    setSelectedEvent(event);
    setSelectedDoctor(event.doctor);
    setShowEditModal(true);
  };

  const generateSubSlots = (
    slot: TimeSlotInput,
    bookedSlots: BookedSlot[],
    selectedDate: string,
  ): SubSlot[] => {
    const slots: SubSlot[] = [];

    const [fromHours, fromMinutes] = slot.fromTime.split(':').map(Number);
    const [toHours, toMinutes] = slot.toTime.split(':').map(Number);

    let currentStart = new Date(selectedDate);
    currentStart.setHours(fromHours, fromMinutes, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(toHours, toMinutes, 0, 0);

    while (currentStart < end) {
      const currentEnd = new Date(currentStart);
      currentEnd.setMinutes(currentEnd.getMinutes() + slot.slotDuration);

      const isBooked = bookedSlots.some((b) => {
        const bookedDate = b.appointmentDate.split('T')[0];
        const bookedDateTime = new Date(`${bookedDate}T${b.appointmentTime}`);
        return bookedDateTime.getTime() === currentStart.getTime();
      });

      if (!isBooked && currentEnd <= end) {
        slots.push({
          parentSlotID: slot.timeSlotID,
          fromTime: currentStart.toTimeString().slice(0, 8),
          toTime: currentEnd.toTimeString().slice(0, 8),
          day: slot.day,
        });
      }

      currentStart = currentEnd;
    }

    return slots;
  };

  // Function to validate and handle time change for the selected event

  //   const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //     const doctorID = e.target.value;
  //     setSelectedOutsideDoctor(doctorID);

  //     // Also update formData so that modal shows the correct doctor (for read-only)
  //     setFormData((prev) => ({ ...prev, doctor: doctorID }));

  //     // Find the selected doctor details
  //     const selectedDoctorDetails = doctors.find(
  //       (doctor) => doctor.doctorID === doctorID,
  //     );

  //     // If a valid doctor is selected, update hospital ID
  //     if (selectedDoctorDetails) {
  //       setSelectedHospitalID(selectedDoctorDetails.hospitalID || '');
  //     }

  //     // Fetch and log doctor time slots with timeslotID
  //     fetchDoctorTimeSlots(doctorID);
  //   };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorID = e.target.value;
    setSelectedOutsideDoctor(e.target.value);
    setSelectedDoctorID(doctorID);
    setFormData((prev) => ({ ...prev, doctor: doctorID }));
    setSelectedAppointment((prev) => ({ ...prev, doctorID }));

    fetchDoctorTimeSlots(doctorID);
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/Hospital/HospitalsList'); // use relative path with api instance
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
      const roleName = sessionStorage.getItem('roleName');
      const unitID = sessionStorage.getItem('unitID');

      // Build params conditionally
      const params = roleName === 'SuperAdmin' ? {} : { hospitalId: unitID };

      const response = await api.get(`/Doctor`, { params });

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
            `TimeSlot ID: ${slot.timeSlotID}, Time: ${slot.startTime} - ${slot.endTime}`,
          );
        });

        // Find the slot duration for the selected day
        const selectedDayOfWeek = selectedDate?.getDay();
        const availability = result.data.find(
          (slot) => slot.dayofWeek === selectedDayOfWeek,
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

  //   const generateTimeSlots = (
  //     fromTime: string,
  //     toTime: string,
  //     slotDuration: number,
  //   ) => {
  //     const slots = [];
  //     let start = new Date(`2000-01-01T${fromTime}`);
  //     const end = new Date(`2000-01-01T${toTime}`);

  //     while (start <= end) {
  //       // Format time as HH:mm
  //       const formattedTime = start.toTimeString().slice(0, 5);
  //       slots.push(formattedTime);

  //       // Add slot duration
  //       start.setMinutes(start.getMinutes() + slotDuration);
  //     }

  //     return slots;
  //   };

  const fetchDoctorTimeSlots = async (doctorID: string) => {
    if (!doctorID) return;

    try {
      const response = await api.get(
        `/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
      );
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
          toTime: new Date('1970-01-01T23:50:00'), // Default 11:50 PM
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

  const handleDoctorSelect = (doctor) => {
    console.log('Selected Doctor ID:', doctor.id);
    setSelectedDoctor(doctor.id); // store doctor ID in state if needed

    // Filter that doctor's availability
    const doctorSlots = doctorAvailability.filter(
      (slot) => slot.doctorID === doctor.id,
    );

    if (doctorSlots.length === 0) {
      console.log('No time slots available for this doctor.');
    } else {
      console.log('Available Slot IDs:');
      doctorSlots.forEach((slot) => {
        console.log('Slot ID:', slot.timeSlotID);
      });
    }
  };

  const handleDoctorClick = (doctorID) => {
    logDoctorAvailableSlots(doctorID, allSlots);
  };

  const logDoctorAvailableSlots = (doctorID, allSlots) => {
    // Filter slots only for the given doctorID
    const doctorSlots = allSlots.filter((slot) => slot.doctorID === doctorID);

    if (doctorSlots.length === 0) {
      console.log(`No slots found for doctor ID: ${doctorID}`);
      return;
    }

    // Log each slot with day, fromTime, toTime, slotDuration
    doctorSlots.forEach((slot) => {
      console.log(`Doctor ID: ${doctorID}`);
      console.log(`Day: ${slot.dayofWeek}`);
      console.log(`Available from ${slot.fromTime} to ${slot.toTime}`);
      console.log(`Slot Duration: ${slot.slotDuration} minutes`);
      console.log('------------------------------------');
    });
  };

  useEffect(() => {
    if (!doctorAvailability || doctorAvailability.length === 0) return;

    // Get first doctor id from your doctorAvailability (assuming each slot has a doctorID)
    const firstDoctor = doctorAvailability[0];
    const firstDoctorID = firstDoctor.doctorID || firstDoctor.id || null;

    if (!firstDoctorID) {
      console.log('No doctor ID found in doctorAvailability');
      return;
    }

    // For demo, pick a date (today or formData.date)
    const appointmentDate =
      formData.date || new Date().toISOString().split('T')[0];

    // Get day name from date
    const appointmentDay = new Date(appointmentDate).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      },
    );

    // Filter slots for this doctor and day
    const doctorSlotsForDay = doctorAvailability.filter(
      (slot) =>
        slot.doctorID === firstDoctorID &&
        slot.dayofWeek.toLowerCase() === appointmentDay.toLowerCase(),
    );

    if (doctorSlotsForDay.length === 0) {
      console.log(
        `No availability found for doctor ${firstDoctorID} on ${appointmentDay}`,
      );
      return;
    }

    // For each slot, generate available time slots
    doctorSlotsForDay.forEach((slot) => {
      const slots = generateTimeSlots(
        slot.fromTime,
        slot.toTime,
        slot.duration,
        slot.timeSlotID,
        bookedSlots,
        new Date(appointmentDate),
      );
      console.log(
        `Available slots for doctor ${firstDoctorID} on ${appointmentDate} (${slot.dayofWeek}):`,
        slots,
      );
    });
  }, [doctorAvailability, bookedSlots, formData.date]);

  const convertTo24HourFormat = (time12h: string): string => {
    if (!time12h.includes(' ')) return time12h;
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:00`;
  };

  const generateTimeSlots = (
    fromTime,
    toTime,
    slotDuration,
    timeSlotID,
    bookedSlots,
    selectedDate,
  ) => {
    const fromTime24 = convertTo24HourFormat(fromTime);
    const toTime24 = convertTo24HourFormat(toTime);

    const [fromHours, fromMinutes] = fromTime24.split(':').map(Number);
    const [toHours, toMinutes] = toTime24.split(':').map(Number);

    const slots = [];
    let currentStart = new Date(selectedDate);
    currentStart.setHours(fromHours, fromMinutes, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(toHours, toMinutes, 0, 0);

    while (currentStart < end) {
      let currentEnd = new Date(currentStart);
      currentEnd.setMinutes(currentEnd.getMinutes() + slotDuration);

      // Check if slot is booked (assuming bookedSlots have appointmentDate and appointmentTime as ISO strings)
      const isBooked = bookedSlots.some((b) => {
        const bookedDate = b.appointmentDate.split('T')[0];
        const bookedDateTime = new Date(`${bookedDate}T${b.appointmentTime}`);
        // Check if bookedDateTime equals currentStart (exact start match)
        return bookedDateTime.getTime() === currentStart.getTime();
      });

      if (!isBooked && currentEnd <= end) {
        slots.push({
          timeSlotID,
          fromTime: currentStart.toTimeString().slice(0, 8),
          toTime: currentEnd.toTimeString().slice(0, 8),
        });
      }

      currentStart = currentEnd;
    }

    return slots;
  };

  const formatLocalDate = (dateInput: Date | string): string => {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      // Handle invalid date input gracefully
      console.error('Invalid date passed to formatLocalDate:', dateInput);
      return ''; // or throw error if you prefer
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!formData.date || !selectedStartTime) {
      setAvailableTimeOptions([]);
      return;
    }

    const appointmentDay = new Date(formData.date).toLocaleDateString('en-US', {
      weekday: 'long',
    });

    const selectedSlot = doctorAvailability.find((slot) => {
      const slotDay = slot.dayofWeek?.toLowerCase();
      const matchDay = appointmentDay.toLowerCase();

      const slotStart = slot.fromTime?.slice(0, 5);
      const slotEnd = slot.toTime?.slice(0, 5);

      if (!slotStart || !slotEnd) return false;

      const startMins = timeToMinutes(slotStart);
      const endMins = timeToMinutes(slotEnd);
      const selectedStartMins = timeToMinutes(selectedStartTime);
      const selectedEndMins = selectedEndTime
        ? timeToMinutes(selectedEndTime)
        : selectedStartMins;

      return (
        slotDay === matchDay &&
        selectedStartMins >= startMins &&
        selectedEndMins <= endMins
      );
    });

    console.log('Day Match:', appointmentDay);
    console.log('Selected Time:', selectedStartTime, '-', selectedEndTime);
    console.log('Matched Slot:', selectedSlot);

    if (!selectedSlot) {
      setAvailableTimeOptions([]);
      return;
    }

    // Convert total minutes back to "HH:MM"
    const minutesToTime = (minutes: number) => {
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMinutes = timeToMinutes(selectedSlot.fromTime.slice(0, 5));
    const endMinutes = timeToMinutes(selectedSlot.toTime.slice(0, 5));
    const slotDuration = selectedSlot.slotDuration;

    const generatedSlots = [];
    for (
      let time = startMinutes;
      time + slotDuration <= endMinutes;
      time += slotDuration
    ) {
      generatedSlots.push({
        startTime: minutesToTime(time),
        endTime: minutesToTime(time + slotDuration),
      });
    }

    setAvailableTimeOptions(generatedSlots);
  }, [
    formData.date,
    selectedStartTime,
    selectedEndTime,
    doctorAvailability,
    bookedSlots,
  ]);

  // Find matching slot where selected time fits within fromTime-toTime range
  //   const selectedSlot = doctorAvailability.find((slot) => {
  //     const slotDay = slot.dayofWeek?.toLowerCase();
  //     const matchDay = appointmentDay.toLowerCase();

  //     const slotStart = slot.fromTime?.slice(0, 5);
  //     const slotEnd = slot.toTime?.slice(0, 5);

  //     if (!slotStart || !slotEnd) return false;

  //     const startMins = timeToMinutes(slotStart);
  //     const endMins = timeToMinutes(slotEnd);
  //     const selectedStartMins = timeToMinutes(selectedStartTime);
  //     const selectedEndMins = selectedEndTime ? timeToMinutes(selectedEndTime) : selectedStartMins;

  //     return (
  //       slotDay === matchDay &&
  //       selectedStartMins >= startMins &&
  //       selectedEndMins <= endMins
  //     );
  //   });

  //   console.log('Day Match:', appointmentDay);
  //   console.log('Selected Time:', selectedStartTime, '-', selectedEndTime);
  //   console.log('Matched Slot:', selectedSlot);

  //   if (!selectedSlot) {
  //     setAvailableTimeOptions([]);
  //     return;
  //   }

  //   // Helper: convert total minutes back to "HH:MM"
  //   const minutesToTime = (minutes: number) => {
  //     const h = Math.floor(minutes / 60)
  //       .toString()
  //       .padStart(2, '0');
  //     const m = (minutes % 60).toString().padStart(2, '0');
  //     return `${h}:${m}`;
  //   };

  //   const startMinutes = timeToMinutes(selectedSlot.fromTime.slice(0, 5));
  //   const endMinutes = timeToMinutes(selectedSlot.toTime.slice(0, 5));
  //   const slotDuration = selectedSlot.slotDuration;

  //   const generatedSlots = [];
  //   for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
  //     generatedSlots.push({
  //       startTime: minutesToTime(time),
  //       endTime: minutesToTime(time + slotDuration),
  //     });
  //   }

  const handleSubmit = async () => {
    const appointmentDate =
      formData.date || selectedEvent?.start?.toISOString().split('T')[0];

    const appointmentDay = new Date(appointmentDate).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      },
    );

    // Selected appointment time in "HH:mm" format
    const appointmentTime =
      formData.time ||
      (selectedEvent?.start
        ? selectedEvent.start.toTimeString().slice(0, 5)
        : '');

    if (!appointmentTime) {
      alert('Please select a valid appointment time.');
      return;
    }

    // Find slot that matches day and includes the appointment time within its fromTime-toTime range
    const selectedSlot = doctorAvailability.find((slot) => {
      if (!slot.dayofWeek || !slot.fromTime || !slot.toTime) return false;

      const slotDay = slot.dayofWeek.toLowerCase();
      const matchDay = appointmentDay.toLowerCase();

      if (slotDay !== matchDay) return false;

      // Helper to convert "HH:mm" to minutes
      const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const appointmentMinutes = timeToMinutes(appointmentTime);
      const slotStartMinutes = timeToMinutes(slot.fromTime.slice(0, 5));
      const slotEndMinutes = timeToMinutes(slot.toTime.slice(0, 5));

      // Check if appointmentTime falls within slot range
      return (
        appointmentMinutes >= slotStartMinutes &&
        appointmentMinutes < slotEndMinutes
      );
    });

    if (!selectedSlot) {
      alert('No available timeslot found for the selected date and time.');
      return;
    }

    const payload = {
      createdBy: userID,
      isActive: true,
      doctorID: formData.doctor || selectedDoctor,
      patientID: '1e3b8a00-d9c7-453d-aa97-005281e76f80',
      timeSlotID: selectedSlot.timeSlotID,
      appointmentDate,
      appointmentTime,
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
    } catch (error) {
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
            <label className="text-black text-xl font-bold">Doctor:</label>
            <select
              name="outsideDoctor"
              value={selectedOutsideDoctor} // ✅ Bind the value
              onChange={handleDoctorChange} // ✅ Your existing handler
              className="w-50 rounded-lg border border-black bg-transparent py-2 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
            <label className="mr-2 text-black font-bold text-xl">
              {' '}
              Interval:
            </label>
            <select
              value={timeInterval}
              onChange={(e) => setTimeInterval(Number(e.target.value))}
              className="w-35 rounded-lg border border-black bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
  //   const handleDateChange = (date: Date | null) => {
  //     if (!date) return;

  //     console.log('Selected Date:', date);
  //     const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  //     const formattedTime = date.toTimeString().split(' ')[0]; // HH:MM:SS
  //     const selectedDay = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

  //     console.log('Formatted Date:', formattedDate);
  //     console.log('Formatted Time:', formattedTime);
  //     console.log('Day of Week:', selectedDay);

  //     // Match against availableTimeSlots
  //     const matchedSlot = availableTimeSlots.find(
  //       (slot) => slot.day.toLowerCase() === selectedDay.toLowerCase(),
  //     );

  //     if (matchedSlot) {
  //       console.log('Matched Slot Info:');
  //       console.log('Day:', matchedSlot.day);
  //       console.log('From Time:', matchedSlot.fromTime);
  //       console.log('To Time:', matchedSlot.toTime);
  //       console.log('Slot Duration:', matchedSlot.slotDuration);
  //       console.log('TimeSlot ID:', matchedSlot.timeSlotID);
  //     } else {
  //       console.warn('No slot found for this day');
  //     }

  //     setSelectedDate(date);

  //     setFormData((prev) => ({
  //       ...prev,
  //       date: formattedDate,
  //       time: formattedTime,
  //     }));
  //   };

  const CustomWeekHeader = ({ label, date }) => {
    const isToday = new Date().toDateString() === new Date(date).toDateString();

    return (
      <div className="flex flex-col items-center justify-center h-16 w-full">
        <div className="text-sm text-gray-600 font-medium">
          {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </div>
        <div className="mt-1 flex items-center justify-center w-full">
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full 
              ${isToday ? 'bg-blue-600 text-white' : 'text-black'}`}
          >
            <span className="text-sm font-medium">{date.getDate()}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleTimeSelect = (
    fromTime: string,
    toTime: string,
    slotId: string,
  ) => {
    setSelectedTime(fromTime); // or `${fromTime}-${toTime}` if that's what you use
    setSelectedSlotId(slotId); // optional, if you use it later for booking
  };

  // Add this state somewhere in your component:

  const handleDateChange = async (
    date: Date | null,
    slots?: TimeSlotType[],
  ) => {
    if (!date) return;

    const localDate = formatLocalDate(date); // "YYYY-MM-DD"
    console.log('📅 Selected Date (Full):', date);
    console.log('📅 Selected Date (Local):', localDate);

    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));

    setSelectedAppointment((prev) => ({
      ...prev,
      appointmentDate: localDate,
    }));

    // Sync selected time with date
    setSelectedTime((prevSelectedTime) => {
      if (prevSelectedTime) {
        const newDateTime = new Date(date);
        newDateTime.setHours(prevSelectedTime.getHours());
        newDateTime.setMinutes(prevSelectedTime.getMinutes());
        newDateTime.setSeconds(0);
        newDateTime.setMilliseconds(0);
        return newDateTime;
      } else {
        const newDateTime = new Date(date);
        newDateTime.setHours(0, 0, 0, 0);
        return newDateTime;
      }
    });

    const timeSlots = Array.isArray(slots) ? slots : availableTimeSlots;
    if (!Array.isArray(timeSlots)) {
      console.error('❌ Invalid timeSlots:', timeSlots);
      return;
    }

    const dayOfWeek = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
      .trim();

    console.log('Selected Day of Week:', dayOfWeek);

    // Get all matched day slots
    const matchedSlots = timeSlots.filter(
      (slot) => slot.day?.toLowerCase().trim() === dayOfWeek,
    );

    // SET matched slots in state to use separately if needed
    setMatchedDaySlots(matchedSlots);

    const doctorDays = [
      ...new Set(timeSlots.map((slot) => slot.day?.toLowerCase().trim())),
    ];
    console.log('✅ Doctor Available Days:', doctorDays);

    //   timeSlots.forEach((slot) => {
    //     console.log(`Checking slot day "${slot.day}" against "${dayOfWeek}"`);
    //   });

    console.log('🕒 Matched Slots for Day:', matchedSlots);

    if (matchedSlots.length === 0) {
      console.warn(`⚠️ Doctor NOT available on ${dayOfWeek}. No slots.`);
      setGeneratedTimeSlots([]);
      return;
    }

    try {
      // Fetch existing booked appointments for this doctor & date
      const appointmentResponse = await api.get(
        `/Appointment/GetAppointment?DoctorID=${selectedDoctorID}&StartDate=${localDate}&EndDate=${localDate}`,
      );

      const appointmentData = appointmentResponse.data;
      const appointmentList = Array.isArray(appointmentData)
        ? appointmentData
        : [];

      const bookedSlots = appointmentList.map((appointment: any) => ({
        appointmentDate: appointment?.appointmentDate,
        appointmentTime: appointment?.appointmentTime,
      }));

      console.log('📋 Booked Slots:', bookedSlots);

      // Generate individual available time chunks
      let generated: { time: Date; timeSlotID: string }[] = [];

      matchedSlots.forEach(({ fromTime, toTime, slotDuration, timeSlotID }) => {
        const slots = generateTimeSlots(
          fromTime,
          toTime,
          slotDuration,
          timeSlotID,
          bookedSlots,
          date,
        );
        generated = [...generated, ...slots];
      });

      console.log('⏰ Generated Available Time Slots:', generated);

      setBookedSlots(bookedSlots);
      setGeneratedTimeSlots(generated);

      // Preselect first available slot ID in formData (optional)
      if (generated.length > 0) {
        setFormData((prev) => ({
          ...prev,
          timeSlotID: generated[0].timeSlotID,
        }));
      }
    } catch (error) {
      console.error('🚨 Error fetching appointments:', error);
      setGeneratedTimeSlots([]);
    }
  };

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const roleName = sessionStorage.getItem('roleName');
        const tenantID = sessionStorage.getItem('tenantID');

        // Build URL conditionally
        let url = '/Patient';
        if (roleName !== 'SuperAdmin' && tenantID) {
          url += `?tenantID=${tenantID}`;
        }

        const response = await api.get(url);
        setPatients(response.data.data);
      } catch (error) {
        console.error('Failed to fetch patients', error);
        setPatients([]);
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
            week: {
              header: CustomWeekHeader,
            },
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

      {/* Add Style */}
      <style>{`
// /* --------- 1. REMOVE ALLDAY CELL (HIDES TOP LINE) --------- */
// .rbc-allday-cell,
// .rbc-allday-events {
//   display: none !important;
// }

// /* --------- 2. REMOVE DEFAULT TODAY STYLES, ADD CUSTOM BG --------- */
// .rbc-header.rbc-today {
//   background-color: #dbeafe !important; /* Blue-100 */
// }

// /* DATE circle styling for today */
// .rbc-header.rbc-today .rbc-date {
//   background-color: #bfdbfe !important; /* Lighter Blue-200 */
//   color: #1e3a8a !important;
//   font-weight: 600 !important;
//   border-radius: 9999px;
//   padding: 10px 14px; /* Increased for bigger circle */
//   font-size: 28px !important; /* Larger date */
//   display: inline-block;
//   min-width: 48px;
//   text-align: center;
//   margin-top: 4px;
// }

// /* Remove button look */
// .rbc-header.rbc-today .rbc-button-link {
//   background: none !important;
//   border-radius: 0 !important;
//   padding: 0 !important;
//   box-shadow: none !important;
// }

// /* --------- 3. HEADER HEIGHT AND ALIGNMENT --------- */
// .rbc-time-header-content .rbc-header {
//   height: 110px !important;
//   text-align: center;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   gap: 24px; /* Increased vertical spacing between day and date */
//   padding-top: 10px;
// }
// .rbc-header {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 120px !important; /* enough height to avoid cropping */
// }

// /* DAY NAME (e.g. MON) Styling */
// .rbc-header span:first-child {
//   font-size: 24px !important;
//   font-weight: 600 !important;
//   color: #0f172a;
//   margin: 0 !important; /* Clear any extra spacing */
// }

// .rbc-date {
//   font-size: 22px !important;
//   font-weight: 600 !important;
//   background: #bfdbfe !important;
//   color: #1e3a8a !important;
//   width: 100px !important;
//   height: 100px !important;
//   line-height: 100px !important;      /* match height for perfect vertical center */
//   border-radius: 50% !important;
//   display: flex !important;
//   align-items: center !important;
//   justify-content: center !important;
//   margin: 0 auto !important;
// }


// .rbc-date {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

// /* --------- 4. TODAY'S COLUMN BG --------- */
// .rbc-day-slot.rbc-today .rbc-time-slot {
//   background-color: #dbeafe !important;
// }

// /* --------- 5. GRID LINES --------- */
// .rbc-day-slot:not(:last-child),
// .rbc-time-header-content .rbc-header {
//   border-right: 1px solid #e0e0e0 !important;
// }

/* --------- 1. REMOVE ALLDAY CELL --------- */
.rbc-allday-cell,
.rbc-allday-events {
  display: none !important;
}

/* --------- 2. HEADER STYLING (Compact) --------- */
.rbc-time-header-content .rbc-header,
.rbc-header {
  height: 100px !important; /* Reduced from 140px */
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 2px !important; /* Reduced from 10px */
  gap: 4px !important; /* Reduced from 20px */
  background-color: transparent !important;
}


/* --------- 3. TODAY COLUMN BG COLOR --------- */
.rbc-header.rbc-today {
  background-color: #e0f2fe !important; /* Blue-100 */
}

/* --------- 4. DAY TEXT (e.g. MON) --------- */
.rbc-header span:first-child {
  font-size: 16px !important;  /* Reduced from 22px */
  font-weight: 600 !important;
  color: #0f172a !important;
  margin-bottom: 2px !important;
}

/* --------- 5. TODAY'S DATE CIRCLE --------- */
.rbc-time-header-content .rbc-header.rbc-today span:last-child {
  background-color: rgb(82, 153, 241) !important;
  color: #1e3a8a !important;
  font-size: 16px !important;  /* Reduced from 24px */
  font-weight: 700 !important;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: normal !important;
  margin: 0 auto !important;
}

/* --------- 6. NORMAL DATE STYLING (non-today) --------- */
.rbc-time-header-content .rbc-header span:last-child {
  background-color: transparent !important;
  color: #1e293b !important;
  font-size: 16px !important;  /* Reduced from 22px */
  font-weight: 600 !important;
  width: auto !important;
  height: auto !important;
  line-height: normal !important;
  border-radius: 0 !important;
  display: inline-block !important;
  margin: 0 auto;
}

/* --------- 7. REMOVE BUTTON STYLE IF INSIDE HEADER --------- */
.rbc-header.rbc-today .rbc-button-link {
  background: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}

/* --------- 8. TODAY'S TIME SLOT BG --------- */
.rbc-day-slot.rbc-today .rbc-time-slot {
  background-color: #e0f2fe !important;
}

/* --------- 9. GRID LINES --------- */
.rbc-day-slot:not(:last-child),
.rbc-time-header-content .rbc-header {
  border-right: 1px solid #e0e0e0 !important;
}

/* -------- Y-AXIS SPACING (Visible gap between time slots) -------- */
.rbc-time-content .rbc-time-slot {
  min-height: 50px !important;       /* Taller rows */
  // border-bottom: 6px solid #f9fafb;  /* Adds visible space between rows */
}

/* -------- X-AXIS SPACING (Visible gap between day columns) -------- */
.rbc-day-slot {
  border-right: 6px solid #f9fafb !important;  /* Space between columns */
}

/* Optional: Remove last right border to avoid extra edge */
.rbc-time-content > *:last-child .rbc-day-slot {
  border-right: none !important;
}


.rbc-time-header.rbc-overflowing {
  background-color: #e0f2fe !important; /* Light Blue (Tailwind's blue-100) */
}

/* Align time gutter and header row */
.rbc-time-gutter,
.rbc-header {
  box-sizing: border-box;
  border-bottom: 1px solid #cbd5e1; /* matching blue border */
}

/* Optional - remove unwanted margin/padding */
.rbc-time-gutter.rbc-time-column {
  padding: 6px 10px;
  background-color: #e0f2fe;
  border-right: 1px solid #cbd5e1;
}

/* Make sure time slots and header are same height */
.rbc-time-slot,
.rbc-header {
  height: 40px; /* adjust if needed */
  line-height: 40px;
  display: flex;
  align-items: center;
}

.rbc-toolbar span.cursor-pointer {
  background: radial-gradient(circle at top left, #8ECBF5, #3366AA); /* lighter blue */
  color: white;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(255, 255, 255, 0.6), 0 3px 8px rgba(0, 0, 0, 0.4);
  border: 3px solid #ccc;
  background-clip: padding-box;
  cursor: pointer;
}

.rbc-toolbar span.cursor-pointer:hover {
  background: radial-gradient(circle at bottom right, #66B2F4, #2C5E9E); /* slightly darker but still soft */
  transform: scale(1.08);
  box-shadow: inset 0 1px 4px rgba(255, 255, 255, 0.8), 0 6px 10px rgba(0, 0, 0, 0.5);
  border-color: #aaa;
}

.rbc-day-slot.rbc-time-column {
  background-color: white;
}

.rbc-toolbar {
  // background-color: #DFF0AD; /* Light blue (Tailwind blue-100) */
    background-color: #9CDBF5; /* Light blue (Tailwind blue-100) */
  padding: 12px 16px; /* Optional padding for spacing */
  border-radius: 8px; /* Optional for rounded edges */
}




`}</style>
    </div>
  );
};

export default Calendar;
