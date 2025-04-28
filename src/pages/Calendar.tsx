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
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [selectedHospitalID, setSelectedHospitalID] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState('');

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
    if (selectedDoctorID) {
      // Instead of simulating an event, you could call the fetch logic directly:
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch(
            'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot',
          );
          const responseData = await response.json();
          const data = Array.isArray(responseData.data)
            ? responseData.data
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

  const fetchAppointments = async (doctorID) => {
    try {
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?DoctorID=${doctorID}`);
      const data = await response.json();
  
      if (Array.isArray(data)) {
        const parsedAppointments = data.map((appt) => {
          const date = new Date(appt.appointmentDate);
          const [hours, minutes] = appt.appointmentTime.split(':');
          date.setHours(parseInt(hours));
          date.setMinutes(parseInt(minutes));
          date.setSeconds(0);
  
          return {
            start: new Date(date),
            end: new Date(date.getTime() + timeInterval * 60000), // add slot duration
            title: appt.patientName, // Optional: show patient name
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

  // Function to handle the selection of an empty slot
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({
      title: '',
      start,
      end,
      status: 'Pending',
      doctor: '',
      patient: '',
      patientId: '',
    }); // Clear existing selections
    setSelectedDoctor(''); // Reset doctor dropdown
    setPatientName(''); // Reset patient name input
    setShowAddModal(true); // Open modal to add new appointment
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
    setSelectedDoctor(doctorID); // ✅ Update selectedDoctor state
    setFormData((prev) => ({ ...prev, doctor: doctorID })); // ✅ Ensure doctorID is updated in formData

    // Find the associated hospital for the selected doctor
    const selectedDoctorDetails = doctors.find(
      (doctor) => doctor.doctorID === doctorID,
    );
    if (selectedDoctorDetails) {
      setSelectedHospitalID(selectedDoctorDetails.hospitalID || ''); // ✅ Auto-set hospital
    }

    console.log('Selected Doctor ID:', doctorID);
    fetchDoctorTimeSlots(doctorID);
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Hospital',
        );
        const result = await response.json();
        if (Array.isArray(result)) {
          setHospitals(result);
        } else if (Array.isArray(result?.data)) {
          setHospitals(result.data);
        } else {
          console.error('Invalid hospital data format:', result);
          setHospitals([]);
        }
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
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Doctor',
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setDoctors(result.data);

        // Retrieve logged-in doctorID from sessionStorage
        const loggedInDoctorID = sessionStorage.getItem('doctorID');

        // Find the doctor details based on doctorID
        const loggedInDoctor = result.data.find(
          (doc) => doc.doctorID === loggedInDoctorID,
        );
        if (loggedInDoctor) {
          setSelectedDoctor(loggedInDoctor.doctorID);
          setDoctorName(loggedInDoctor.doctorName);
          fetchDoctorTimeSlots(loggedInDoctor.doctorID); // Fetch time slots for this doctor
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
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
      );
      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        let fromTime = null;
        let toTime = null;
        let slotDuration = result.data[0]?.slotDuration || 10; // Default 10 min

        result.data.forEach((slot) => {
          const slotFromTime = new Date(`1970-01-01T${slot.fromTime}`);
          const slotToTime = new Date(`1970-01-01T${slot.toTime}`);

          if (!fromTime || slotFromTime < fromTime) fromTime = slotFromTime;
          if (!toTime || slotToTime > toTime) toTime = slotToTime;
        });

        setTimeInterval(slotDuration);
        setAvailableTimeRange({ fromTime, toTime });
      } else {
        console.error('No valid slots found for this doctor.');
        setTimeInterval(10); // Default slot duration
        setAvailableTimeRange({
          fromTime: new Date('1970-01-01T00:00:00'), // Default 12 AM
          toTime: new Date('1970-01-01T23:50:00'), // Default 11:50 PM
        });
      }
    } catch (error) {
      console.error('Error fetching doctor time slots:', error);
      setTimeInterval(10); // Default slot duration
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

    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    const appointmentDate =
      formData.date || selectedEvent.start.toISOString().split('T')[0];
    const appointmentDay = new Date(appointmentDate).toLocaleDateString(
      'en-US',
      { weekday: 'long' },
    );
    const selectedSlot = doctorAvailability.find(
      (slot) => slot.dayofWeek === appointmentDay,
    );

    if (!selectedSlot) {
      toast.error('No available timeslot found for the selected date.');
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
        toast.success('Appointment booked successfully!');

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
        const errorData = await response.json();
        console.error('Submission failed:', errorData);
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during submission:', error);
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


  const generateTimeSlots = (fromTime, toTime, interval) => {
    const slots = [];
    let current = new Date(fromTime);
  
    while (current <= toTime) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + interval);
    }
  
    return slots;
  };


 const eventStyleGetter = (event) => {
  let backgroundColor = '#4CAF50';
  if (event.status === 'booked') {
    backgroundColor = '#f44336';
  }

  return {
    style: {
      backgroundColor,
      color: 'white',
      borderRadius: '5px',
      border: 'none',
      width: '100%',         // fill full width
      height: '100%',        // fill full height
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      padding: '0px 2px',    // reduce vertical padding to zero
      overflow: 'hidden',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      textAlign: 'center',
      margin: '0',           // ensure no spacing
    },
  };
};

  
  
  
  useEffect(() => {
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
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="mb-2.5 text-2xl font-bold text-black dark:text-white">
              Add New Appointment
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
                    <span>{option.name}</span>{' '}
                    {/* Display name, but store ID */}
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
                </div>

                {/* Doctor Dropdown in Modal */}
                <div className="relative w-1/2">
                  <select
                    name="doctor"
                    value={selectedDoctor || ''}
                    onChange={handleDoctorChange}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="" disabled selected={!selectedDoctor}>
                      Select a Doctor
                    </option>
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

                <CustomButton type="submit">save</CustomButton>
              </div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                style={{ zIndex: 9999 }}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
