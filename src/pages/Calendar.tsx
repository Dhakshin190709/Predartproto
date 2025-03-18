import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const initialEvents: Event[] = [
    {
      title: 'Appointment with Dr. Smith',
    start: new Date('2024-11-24T05:00:00'), // Use ISO 8601 format
    end: new Date('2024-11-24T05:15:00'),
    status: 'Booked',
      doctor: 'Dr. Smith',
      patient: 'John Doe',
      patientId: 'P001',
    },
    {
      title: 'Appointment with Dr. Smith',
      start: new Date(2024, 10, 24, 9, 0),
      end: new Date(2024, 10, 24, 9, 15),
      status: 'Booked',
      doctor: 'Dr. Smith',
      patient: 'John Doe',
      patientId: 'P002',
    },
  ];
 
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(moment()); // Manage the current date for custom toolbar
 
  const [patientName, setPatientName] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showMessage, setShowMessage] = useState<string | null>(null); // State for custom alert message
 // Default to 15 minutes interval
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);

  const [timeInterval, setTimeInterval] = useState(30); // Default to 30 minutes
const [doctorAvailability, setDoctorAvailability] = useState([]);
const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // Handle change of time interval from dropdown
  const handleTimeIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const interval = parseInt(e.target.value, 10);
    setTimeInterval(interval);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(moment());  // Update current time every minute
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Function to handle the selection of an empty slot
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setSelectedEvent({ title: '', start, end, status: 'Pending', doctor: '', patient: '', patientId:'' }); // Clear existing selections
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
    setSelectedDoctor(doctorID);
    
    console.log("Selected Doctor ID:", doctorID); // Debug log for selected ID
  
    fetchDoctorTimeSlots(doctorID); // Fetch time slots
  };

  

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Doctor");
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDoctors(result.data);
        } else {
          console.error("Invalid doctor data format:", result.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };



  
    fetchDoctors();
  }, []);

  

  const fetchDoctorAvailability = async (doctorID: string) => {
    if (!doctorID) return;
  
    try {
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`
      );
      const result = await response.json();
  
      if (result.success && Array.isArray(result.data)) {
        setDoctorAvailability(result.data);
  
        // Find the slot duration for the selected day
        const selectedDayOfWeek = selectedDate?.getDay();
        const availability = result.data.find(
          (slot) => slot.dayofWeek === selectedDayOfWeek
        );
  
        if (availability && availability.slotDuration) {
          setTimeInterval(availability.slotDuration);
        }
      } else {
        console.error("Invalid doctor availability format:", result.data);
        setDoctorAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      setDoctorAvailability([]);
    }
  };
  // Get available time range for the selected doctor on the selected day
  const getAvailableTimeRange = () => {
    if (!selectedDoctor || !selectedDate) return { fromTime: null, toTime: null };
  
    const selectedDayOfWeek = selectedDate.getDay(); // Get selected day's index (0 = Sunday, 1 = Monday, etc.)
  
    const availability = doctorAvailability.find((slot) => slot.dayofWeek === selectedDayOfWeek);
  
    if (availability) {
      return {
        fromTime: new Date(`1970-01-01T${availability.fromTime}:00`),
        toTime: new Date(`1970-01-01T${availability.toTime}:00`),
      };
    }
    return { fromTime: null, toTime: null };
  };
  
  // Fetch doctor availability when doctor selection changes
useEffect(() => {
  if (selectedDoctor) {
    fetchDoctorAvailability(selectedDoctor);
  }
}, [selectedDoctor, selectedDate]);


  
  
  const generateTimeSlots = (fromTime: string, toTime: string, slotDuration: number) => {
    const slots = [];
  
    // Convert fromTime and toTime strings to Date objects
    let start = new Date(`2000-01-01T${fromTime}`);
    const end = new Date(`2000-01-01T${toTime}`);
  
    while (start < end) {
      // Format the time as HH:mm
      const hours = String(start.getHours()).padStart(2, "0");
      const minutes = String(start.getMinutes()).padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
  
      // Add slotDuration minutes
      start.setMinutes(start.getMinutes() + slotDuration);
    }
  
    return slots;
  };
  
  const fetchDoctorTimeSlots = async (doctorID: string) => {
    if (!doctorID) return;
  
    try {
      const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`);
      const result = await response.json();
  
      if (result.success && Array.isArray(result.data)) {
        result.data.forEach((slot, index) => {
          console.log(`Slot ${index + 1}:`, slot);
          console.log("Day of Week:", slot.dayofWeek);
          console.log("From Time:", slot.fromTime);
          console.log("To Time:", slot.toTime);
          console.log("Slot Duration:", slot.slotDuration);
  
          // Generate and log the time slots
          const timeSlots = generateTimeSlots(slot.fromTime, slot.toTime, slot.slotDuration);
          console.log("Generated Time Slots:", timeSlots);
        });
      } else {
        console.error("Invalid time slot data format:", result.data);
      }
    } catch (error) {
      console.error("Error fetching doctor time slots:", error);
    }
  };
  

  // Function to handle start time changes
  const handleStartTimeChange = (date: Date | null) => {
    if (date && selectedEvent) {
      const now = new Date();
  
      // Prevent selecting past dates/times
      if (date < now) {
        setShowMessage('You cannot select a past time. Please select a future time.');
        return;
      }
      setShowMessage(null);
  
      // Preserve original date but update time
      const updatedStartTime = new Date(selectedEvent.start);
      updatedStartTime.setFullYear(date.getFullYear());
      updatedStartTime.setMonth(date.getMonth());
      updatedStartTime.setDate(date.getDate());
      updatedStartTime.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), 0);
  
      // Adjust end time based on the new start time
      const updatedEndTime = new Date(updatedStartTime.getTime() + (selectedEvent.end.getTime() - selectedEvent.start.getTime()));
  
      // Update the event object
      const updatedEvent = {
        ...selectedEvent,
        start: updatedStartTime,
        end: updatedEndTime,
      };
  
      // Update the events array
      const updatedEvents = events.map((event) =>
        event.start === selectedEvent.start && event.doctor === selectedEvent.doctor ? updatedEvent : event
      );
  
      setEvents(updatedEvents);
      setSelectedEvent(updatedEvent);
    }
  };
    // Save updated appointment
    const handleSaveAppointment = () => {
      if (!selectedDoctor || !patientName || !selectedPatientId) {
        setShowMessage('Please provide doctor, patient name, and patient ID');
        return;
      }
  
      const updatedEvent: Event = {
        ...selectedEvent!,
        doctor: selectedDoctor,
        patient: patientName,
        patientId: selectedPatientId,
        title: `${patientName} (${selectedPatientId})`,
      };
  
      const updatedEvents = events.map((event) =>
        event.start === selectedEvent?.start ? updatedEvent : event
      );
  
      setEvents(updatedEvents);
      setShowEditModal(false); // Close the modal after saving
    };
  

  

  // Function to handle the cancellation of an appointment
  const handleCancelAppointment = () => {
    setShowCancelConfirmation(true); // Show the cancel confirmation modal
  };

  // Function to confirm cancellation and delete the event
  const confirmCancel = () => {
    if (selectedEvent) {
      const updatedEvents = events.filter((event) =>
        event.start !== selectedEvent.start || event.doctor !== selectedEvent.doctor
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
  <div className="flex items-center">
          <label className="mr-2 text-black">Select Doctor:</label>
          <select
      value={selectedDoctor}
      onChange={handleDoctorChange}
      className="w-fit rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
    <label className="mr-2 text-black">Time Interval:</label>
    <select
      value={timeInterval}
      onChange={handleTimeIntervalChange}
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
    <span className="text-xl font-bold text-black dark:text-white">{dateRange}</span>

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
    console.log("Selected Date:", date);
    console.log("Selected Day:", date ? date.toDateString() : "No date selected");
    setSelectedDate(date);
    handleStartTimeChange(date);
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
  step={timeInterval} // Set the time step from API
  timeslots={1}
  eventPropGetter={eventStyleGetter}
  onSelectSlot={handleSelectSlot}
  onSelectEvent={handleEventClick}
  formats={{
    eventTimeRangeFormat: () => '', // Hide time range in event
  }}
  components={{
    event: ({ event }) => (
      <span>{event.patient} ({event.patientId})</span>
    ),
    toolbar: CustomToolbar,
  }}
  selectable={true}
  scrollToTime={currentDate.toDate()}
/>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[300px]">
            <h2 className="mb-2.5 text-2xl font-bold text-black dark:text-white">
              Add New Appointment
            </h2>

            {/* Patient Name */}
      <div className="mb-2.5 block font-medium text-black dark:text-white">
        <label>Patient Name</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter patient name"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-stroke-dark dark:bg-transparent dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
        />
      </div>
      

            {/* Start Time (date and time picker) */}
            <div className="mb-2.5 block font-medium text-black dark:text-white">
              <label>Start Time</label>
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

            {/* Doctor selection */}
            <div className="mb-2.5 block font-medium text-black dark:text-white">
              <label>Doctor</label>
                   <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="w-full rounded-lg border border-stroke 
                bg-transparent py-4 pl-6 pr-10 text-black outline-none
                 focus:border-primary focus-visible:shadow-none
                  dark:border-stroke-dark dark:bg-transparent
                   dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
      >
        <option value="">Select a Doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.doctorName}
          </option>
        ))}
      </select>
            </div>
            {/* Display Custom Alert Message */}
            {showMessage && (
              <div className="text-red-500 text-sm mt-2">
                {showMessage}
              </div>
            )}

            {/* Save and Cancel Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                className="bg-gray-500 text-black py-1 px-3 rounded-md"
                onClick={() => setShowAddModal(false)}
              >
                Close
              </button>
              <button
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                 hover:from-[#007BFF] hover:to-[#004A99] text-white
                  transition duration-150 ease-out hover:ease-in rounded-lg px-5 py-2 mt-2 w-fit text-center"
                onClick={handleSaveAppointment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing event */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[300px]">
            <h2 className="mb-2.5 text-2xl font-bold text-black dark:text-white">Edit Appointment</h2>

            {/* Display Custom Alert Message */}
            {showMessage && (
              <div className="text-red-500 text-sm mt-2">
                {showMessage}
              </div>
            )}

            <div className="mb-2.5 block font-medium text-black dark:text-white">
              <label>Start Time</label>
              <DatePicker
                selected={selectedEvent.start}
                onChange={(date) => handleStartTimeChange(date!)}
                showTimeSelect
                dateFormat="Pp"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-stroke-dark dark:bg-transparent dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
              />
            </div>

            <div className="mb-2.5 block font-medium text-black dark:text-white">
            <label>Doctor</label>
              <select
                value={selectedDoctor}
                onChange={handleDoctorChange} // Handle doctor change
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-stroke-dark dark:bg-transparent dark:text-white dark:focus:border-accent dark:focus-visible:shadow-none"
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-gray-500 text-black py-1 px-3 rounded-md"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
              <button
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
                onClick={() => setShowEditModal(false)} // Save logic can be added here
              >
                Save
              </button>
            </div>


            
            {/* Cancel Appointment Button */}
            <div className="mt-4 flex justify-center">
              <button
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
                onClick={handleCancelAppointment}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Custom Confirmation Modal */}
       {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-xl font-semibold">Confirm Cancellation</h2>
            <p className="mt-4 text-center">
              Are you sure you want to cancel the appointment with {selectedEvent?.doctor}?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-gray-500 text-black py-1 px-3 rounded-md"
                onClick={cancelCancel}
              >
                No
              </button>
              <button
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in rounded px-5 py-2 mt-2 w-fit text-center"
                onClick={confirmCancel} 
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
