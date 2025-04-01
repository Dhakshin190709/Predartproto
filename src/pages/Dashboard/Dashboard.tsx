import React, { useEffect, useState } from 'react';
import {
  FaMale,
  FaFemale,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaPhoneAlt,
  FaUserMd,
  FaEdit,
} from 'react-icons/fa'; // Gender icons
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import { CalendarCheck } from 'lucide-react';
interface Appointment {
  doctorName: string;
  patientName: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientEmail: string;
  patientPhoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
}

const AppointmentCard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");
    const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [statusList, setStatusList] = useState<Status[]>([]);
  
  
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDoctorID, setSelectedDoctorID] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [doctors, setDoctors] = useState<any[]>([]); // Sample doctors array
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  useEffect(() => {
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment',
    )
      .then((response) => response.json())
      .then((data) => setAppointments(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
      case 'Waiting':
        return '#FFC107'; // Yellow
      case 'Waiting for Schedule':
        return '#FF9800'; // Orange
      case 'Waiting for Doctor Schedule':
        return '#FB8C00'; // Dark Orange
      case 'Confirmed':
        return '#4CAF50'; // Green
      case 'Assign to Billing':
        return '#2196F3'; // Blue
      case 'Assign to Medical':
        return '#03A9F4'; // Light Blue
      case 'Assign to Lab':
        return '#9C27B0'; // Purple
      case 'Closed':
        return '#616161'; // Dark Gray
      case 'Rescheduled':
        return '#795548'; // Brown
      case 'Cancel':
        return '#F44336'; // Red
      case 'Rejected':
        return '#D32F2F'; // Dark Red
      case 'Consult Another Doctor':
        return '#009688'; // Teal
      case 'Recommend to Admit':
        return '#E64A19'; // Deep Orange
      case 'Doctor Review':
        return '#673AB7'; // Indigo
      default:
        return '#9E9E9E'; // Default (Gray)
    }
  };

  useEffect(() => {
    const fetchStatusList = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=appointmentstauts',
        );
        //  console.log("Fetched Status List:", response.data?.data);
        if (Array.isArray(response.data?.data)) {
          setStatusList(response.data.data);
        }
      } catch {
        console.error('Failed to fetch status list.');
      }
    };

    fetchStatusList();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/Doctor',
        );
        setDoctors(
          Array.isArray(response.data?.data) ? response.data.data : [],
        );
      } catch {
        console.error('Failed to fetch doctors.');
      }
    };
    fetchDoctors();
  }, []);

  const toggleDropdown = (index: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusInfo = (statusID: string) => {
    // console.log("StatusID:", statusID, "Status List:", statusList);
    const status = statusList.find((s) => s.appLOVID === statusID);
    return status ? status.name : 'Unknown';
  };

  // Function to calculate age based on Date of Birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Return age in years
  };

  // Function to format the date to "yyyy-mm-dd"
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Extracts "yyyy-mm-dd" from the date string
  };

  // Function to format the time to "hh:mm"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleEditClick = (appointment: Appointment) => {
    console.log('Editing Appointment:', appointment);
    setSelectedAppointment(appointment); // Store the full appointment object
    setIsEditModalOpen(true); // Open the modal when the appointment is selected
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorID = e.target.value;

    setSelectedDoctorID(doctorID); // Update the selected doctor ID
    setSelectedDoctor(doctorID); // Ensure this is used in `handleSaveChanges`

    fetchTimeSlots(doctorID); // Fetch available slots when doctor changes

    setSelectedAppointment((prev) => ({
      ...prev,
      doctorID,
      appointmentTime: '',
    }));
  };

  const openEditModal = (appointment) => {
    setSelectedDoctor(appointment.doctorID); // Set default doctor ID
    setAppointmentDate(appointment.date); // Set default date
    setSelectedTimeSlot(appointment.timeSlot); // Set default time slot
    setCurrentAppointment(appointment); // Store the current appointment
    setIsEditModalOpen(true); // Open modal
  };

  const generateTimeSlots = (
    fromTime: string,
    toTime: string,
    slotDuration: number,
  ): string[] => {
    const slots: string[] = [];
    const startTime = new Date();
    const endTime = new Date();

    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);

    startTime.setHours(fromHour, fromMinute, 0, 0);
    endTime.setHours(toHour, toMinute, 0, 0);

    while (startTime < endTime) {
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 24-hour format to 12-hour
      const formattedMinutes = minutes.toString().padStart(2, '0');

      slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);

      // Increment by slotDuration
      startTime.setMinutes(startTime.getMinutes() + slotDuration);
    }

    return slots;
  };

  const fetchTimeSlots = async (doctorID: string) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`,
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        const currentDay = new Date().toLocaleString('en-US', {
          weekday: 'long',
        });

        // Find slot details for the current day
        const slotData = response.data.data.find(
          (slot) => slot.dayofWeek === currentDay,
        );

        if (slotData?.fromTime && slotData?.toTime && slotData?.slotDuration) {
          const generatedSlots = generateTimeSlots(
            slotData.fromTime,
            slotData.toTime,
            slotData.slotDuration,
          );
          setAvailableTimeSlots(generatedSlots);
        } else {
          console.error('No time slots available for today:', currentDay);
          setAvailableTimeSlots([]);
        }
      } else {
        console.error('Invalid time slots format:', response.data);
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableTimeSlots([]);
    }
  };
  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeSlot(e.target.value);
  };

  const handleSaveChanges = () => {
    console.log('Saving changes for appointment:', selectedAppointment);
    // Perform the save logic here
    setIsEditModalOpen(false);
  };

  const handleStatusChange = async (
    appointmentID: string,
    newStatusID: string,
  ) => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const url = `https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentStatus?appointmentId=${appointmentID}&statusid=${newStatusID}&UpdatedBy=${userID}`;

    try {
      const response = await axios.post(url, null, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) =>
            appt.appointmentID === appointmentID
              ? { ...appt, statusID: newStatusID }
              : appt,
          ),
        );
        setDropdownVisible({});
        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status');
    }
  };


  const handleSearch = async () => {
    setLoading(true);
  
    try {
      const response = await axios.get('https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment', {
        params: {
          DoctorID: searchTerm,  // doctor name or ID based on the API requirement
          StartDate: fromTime,
          EndDate: toTime,
        }
      });
  
      setAppointments(response.data);  // assuming the response contains an array of appointments
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search Doctor Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow rounded-md border border-stroke bg-transparent p-2 text-black outline-none focus:border-primary"
        />

        {/* Date Pickers */}
        <input
          type="text"
          placeholder="From Date"
          value={fromTime ? fromTime.split('T')[0] : ''}
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => { if (!fromTime) e.target.type = 'text'; }}
          onChange={(e) => setFromTime(e.target.value)}
          className="flex-grow border border-stroke bg-transparent ml-2 p-2 text-black outline-none focus:border-primary rounded-md"
        />

        <input
          type="text"
          placeholder="To Date"
          value={toTime ? toTime.split('T')[0] : ''}
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => { if (!toTime) e.target.type = 'text'; }}
          onChange={(e) => setToTime(e.target.value)}
          className="flex-grow border border-stroke bg-transparent ml-2 p-2 text-black outline-none focus:border-primary rounded-md"
        />

        <div className="flex gap-4">
          <CustomButton onClick={handleSearch}>Search</CustomButton>
          <button className="px-4 py-2 border border-gray-300 rounded flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Book Now
          </button>
        </div>
      </div>

 {/* Render Appointment Cards */}
 {loading ? (
        <p>Loading appointments...</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 p-4">
        {appointments.map((appointment, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-100 
        transition-transform transform hover:scale-105 hover:shadow-lg w-[100%]"
          >
            {/* First row - Patient Name (Age), Gender Icon, Edit Icon */}
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors">
              <div className="flex items-center">
                {/* Patient Icon */}
                <FaUser className="mr-2 text-green-700" />
                <div className="text-md font-bold text-red-600">
                  {appointment.patientName}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  ({calculateAge(appointment.patientDateOfBirth)} years)
                </span>
              </div>
              <div className="flex items-center">
                {/* Gender Icon */}
                {appointment.patientGender === 'Male' ? (
                  <FaMale className="text-blue-500 mr-2" />
                ) : (
                  <FaFemale className="text-pink-500 mr-2" />
                )}
                {/* Edit Icon */}
                <FaEdit
                  className="cursor-pointer text-gray-500 hover:text-blue-500"
                  onClick={() => handleEditClick(appointment)}
                />
              </div>
            </div>

            {/* Second row - Phone, Appointment Date, and Time with Icons */}
            <div className="mt-2 flex items-center justify-between">
              {/* Phone Icon */}
              <div className="flex items-center mr-4">
                <FaPhoneAlt className="mr-2 text-red-500" />
                <div>{appointment.patientPhoneNumber}</div>
              </div>

              {/* Appointment Date with Icon */}
              <div className="flex items-center mr-4">
                <FaCalendarAlt className="mr-2 text-yellow-500" />
                <div>{formatDate(appointment.appointmentDate)}</div>
              </div>

              {/* Appointment Time with Icon */}
              <div className="flex items-center">
                <FaClock className="mr-2 text-green-500" />
                <div>{formatTime(appointment.appointmentTime)}</div>
              </div>
            </div>

            {/* Third row - Doctor Name with Icon */}
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                <FaUserMd className="mr-2 text-purple-500" />
                <div>{appointment.doctorName}</div>
              </div>
            </div>

            {/* Appointment Status */}
            <div className="mt-2 flex justify-between items-center">
              <span
                className="px-2 py-1 rounded font-bold text-sm"
                style={{
                  color: getStatusColor(getStatusInfo(appointment.statusID)),
                }}
                title={getStatusInfo(appointment.statusID)}
              >
                {getStatusInfo(appointment.statusID)}
              </span>

              <button
                onClick={() => toggleDropdown(index)}
                className="px-3 py-1 bg-blue-400 text-white rounded-md hover:bg-blue-500 whitespace-nowrap"
              >
                Change Status
              </button>
            </div>

            {/* Status Dropdown */}
            {dropdownVisible[index] && (
              <select
                className="w-full rounded-lg mt-1 border border-stroke bg-transparent p-2
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) => {
                  const selectedStatus = e.target.value;
                  if (selectedStatus) {
                    handleStatusChange(
                      appointment.appointmentID,
                      selectedStatus,
                    );
                  }
                }}
              >
                <option value="">Select Status</option>
                {statusList.map((status) => (
                  <option key={status.appLOVID} value={status.appLOVID}>
                    {status.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Modal Popup */}
        {isEditModalOpen && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Edit Appointment</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body mt-4">
                {/* Doctor Selection */}
                <select
                  onChange={handleDoctorChange}
                  value={selectedDoctorID}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary mb-4"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctorID} value={doctor.doctorID}>
                      {doctor.doctorName}
                    </option>
                  ))}
                </select>

                {/* Appointment Date */}
                <input
                  type="date"
                  value={
                    selectedAppointment.appointmentDate
                      ? selectedAppointment.appointmentDate.split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setSelectedAppointment((prev) =>
                      prev
                        ? { ...prev, appointmentDate: e.target.value }
                        : null,
                    )
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary mb-4"
                />

                {/* Time Slot */}
                <select
                  value={selectedTimeSlot}
                  onChange={handleTimeSlotChange}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary mb-4"
                >
                  <option value="">Select a Time Slot</option>
                  {availableTimeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
      
      /* Overlay to make background darker when modal opens */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal container */
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Header with title and close button */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Close button */
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Form labels */
.modal-body label {
  display: block;
  margin: 10px 0 5px;
}

/* Form inputs */
.modal-body input,
.modal-body select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Footer buttons */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Save button */
.save-btn {
  background: #28a745;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Cancel button */
.cancel-btn {
  background: #dc3545;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Card Styling */
.card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

      
      
      
      `}
        </style>
      </div>
       )}
    </div>
  );
};

export default AppointmentCard;
