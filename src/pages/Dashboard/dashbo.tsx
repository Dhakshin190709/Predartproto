import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaUserMd ,FaEdit,FaClock, FaPhoneAlt, FaMapMarkerAlt,FaMars, FaVenus, FaChevronDown } from "react-icons/fa";
import CustomButton from "../../components/CustomButton";



interface Appointment {
  patientID: string;
  patientName?: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorID: string;
  statusID: string;
  phoneNumber: string | null;
  patientGender?: string;
  patientDateOfBirth?: string;
}

interface Status {
  appLOVID: string;
  name: string;
}

interface Patient {
  patientID: string;
  patientName: string;
  patientPhoneNumber: string;
  patientGender: string;
  patientDateOfBirth: string;
}
interface Doctor {
  doctorID: string;
  doctorName: string;
}
const AppointmentCards: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState({
    doctorID: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [doctorID, setDoctorID] = useState<string | null>(null);
  const [selectedDoctorID, setSelectedDoctorID] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  
  
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedDoctorName, setSelectedDoctorName] = useState<string>("");
 
  
  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/Doctor");
        setDoctors(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch {
        console.error("Failed to fetch doctors.");
      }
    };
    fetchDoctors();
  }, []);
  

  useEffect(() => {
    if (doctorID) {
      fetchTimeSlots(doctorID);
    }
  }, [doctorID]);
  
  // Function to fetch doctor time slots based on doctor name
  const fetchTimeSlots = async (doctorID: string) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorTimeSlot?doctorId=${doctorID}`
      );
  
      if (response.data?.success && Array.isArray(response.data.data)) {
        const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
  
        // Find slot details for the current day
        const slotData = response.data.data.find(slot => slot.dayofWeek === currentDay);
  
        if (slotData?.fromTime && slotData?.toTime && slotData?.slotDuration) {
          const generatedSlots = generateTimeSlots(slotData.fromTime, slotData.toTime, slotData.slotDuration);
          setAvailableTimeSlots(generatedSlots);
        } else {
          console.error("No time slots available for today:", currentDay);
          setAvailableTimeSlots([]);
        }
      } else {
        console.error("Invalid time slots format:", response.data);
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setAvailableTimeSlots([]);
    }
  };
  
  
  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeSlotID = e.target.value;
    setSelectedTimeSlot(timeSlotID); // Ensure the state updates properly
    console.log("Selected Time Slot:", timeSlotID);
  };
  

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorID = e.target.value;
    
    setSelectedDoctorID(doctorID);  // Update the selected doctor ID
    setSelectedDoctor(doctorID);    // Ensure this is used in `handleSaveChanges`
    
    fetchTimeSlots(doctorID); // Fetch available slots when doctor changes
  
    setSelectedAppointment((prev) => ({ ...prev, doctorID, appointmentTime: "" }));
  };
  
  
  const generateTimeSlots = (fromTime: string, toTime: string, slotDuration: number): string[] => {
    const slots: string[] = [];
    const startTime = new Date();
    const endTime = new Date();
  
    const [fromHour, fromMinute] = fromTime.split(":").map(Number);
    const [toHour, toMinute] = toTime.split(":").map(Number);
  
    startTime.setHours(fromHour, fromMinute, 0, 0);
    endTime.setHours(toHour, toMinute, 0, 0);
  
    while (startTime < endTime) {
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 24-hour format to 12-hour
      const formattedMinutes = minutes.toString().padStart(2, "0");
  
      slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
  
      // Increment by slotDuration
      startTime.setMinutes(startTime.getMinutes() + slotDuration);
    }
  
    return slots;
  };
  
useEffect(() => {
  console.log("Available Time Slots:", availableTimeSlots);
}, [availableTimeSlots]);

  
  // Fetch time slots when selectedDoctorName changes
  useEffect(() => {
    if (selectedDoctorName) fetchDoctorTimeSlots(selectedDoctorName);
  }, [selectedDoctorName]);
    
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/Appointment");
        let appointmentsData: Appointment[] = Array.isArray(response.data) ? response.data : [];
    
        console.log("Fetched Appointments:", appointmentsData);
    
        const doctorIDs = [...new Set(appointmentsData.map((appt) => appt.doctorID))];
    
        let doctorsData: Doctor[] = [];
        if (doctorIDs.length > 0) {
          try {
            const doctorResponse = await axios.get("https://predart003-001-site1.anytempurl.com/api/Doctor");
            doctorsData = Array.isArray(doctorResponse.data?.data) ? doctorResponse.data.data : [];
          } catch (error) {
            console.error("Failed to fetch doctor data:", error);
          }
        }
    
        let patientsData: Patient[] = [];
        if (appointmentsData.length > 0) {
          try {
            const patientResponse = await axios.get("https://predart003-001-site1.anytempurl.com/api/Patient");
            patientsData = Array.isArray(patientResponse.data?.data) ? patientResponse.data.data : [];
          } catch (error) {
            console.error("Failed to fetch patient data:", error);
          }
        }
    
        // Map doctor names and patient details
        appointmentsData = appointmentsData.map((appt) => {
          const patient = patientsData.find((p) => p.patientID === appt.patientID);
          const doctor = doctorsData.find((d) => d.doctorID === appt.doctorID);
        
          return {
            ...appt,
            phoneNumber: appt.phoneNumber || patient?.patientPhoneNumber || "N/A",
            patientName: patient?.patientName || "Unknown",
            patientGender: patient?.patientGender || "Unknown",
            patientDateOfBirth: patient?.patientDateOfBirth || "Unknown",
            doctorID: appt.doctorID, // Keep original doctorID
            doctorName: doctor?.doctorName || "Unknown Doctor", // Add doctorName separately
          };
        });
        
    
        setAppointments(appointmentsData);
        // setIsModalOpen(true);
        setFilteredAppointments(appointmentsData);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    
    

    const fetchStatusList = async () => {
      try {
        const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/AppLOV?type=appointmentstauts");
      //  console.log("Fetched Status List:", response.data?.data); 
        if (Array.isArray(response.data?.data)) {
          setStatusList(response.data.data);
        }
      } catch {
        console.error("Failed to fetch status list.");
      }
    };
    

    fetchAppointments();
    fetchStatusList();
  }, []);
  
  const handleSaveChanges = async () => {
    const userID = sessionStorage.getItem("userID");
  
    if (!userID) {
      alert("User not logged in. Please log in again.");
      return;
    }
  
    if (!selectedDoctor) {
      alert("Doctor ID is missing! Please select a doctor.");
      return;
    }
  
    if (!selectedTimeSlot) {
      alert("Please select an available time slot.");
      return;
    }
  
    if (!selectedAppointment?.appointmentDate) {
      alert("Please select an appointment date.");
      return;
    }
  
    // Ensure all fields are included and prevent 'undefined' values
    const updatedAppointment = {
      createdBy: userID,
      appointmentID: selectedAppointment?.appointmentID || "", 
      doctorID: selectedDoctor || selectedAppointment?.doctorID || "", 
      patientID: selectedAppointment?.patientID || "", 
      timeSlotID: selectedTimeSlot || selectedAppointment?.timeSlotID || "",
      appointmentDate: selectedAppointment?.appointmentDate || "", 
      appointmentTime: selectedTimeSlot || selectedAppointment?.appointmentTime || "",
      statusID: selectedAppointment?.statusID || "", 
      notes: selectedAppointment?.notes || "", 
      toWhom: selectedAppointment?.toWhom || "", 
      relationShip:  selectedAppointment?.toWhom || "", 
      phoneNumber: selectedAppointment?.phoneNumber || "", 
    };
    
  
    console.log("🚀 Final Payload Sent:", updatedAppointment); // Debugging log
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Appointment",
        updatedAppointment,
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 || response.status === 201) {
        alert("✅ Appointment saved successfully!");
      } else {
        alert("❌ Failed to save appointment.");
      }
    } catch (error) {
      console.error("🔥 Error saving appointment:", error);
      alert(`An error occurred while saving the appointment: ${error.message || error}`);
    }
  };
  
  
  
  
  
  
  
  
  
  
  
  const handleSearch = () => {
    console.log("Search Term:", searchTerm);
    console.log("From Date:", fromTime);
    console.log("To Date:", toTime || "Not Selected");
  
    const filtered = appointments.filter((appointment) => {
      console.log("Checking appointment:", appointment);
  
      if (!appointment.appointmentDate) {
        console.warn("Skipping appointment due to missing appointmentDate:", appointment);
        return false;
      }
  
      // Extract YYYY-MM-DD from appointmentDate
      const formattedDate = appointment.appointmentDate.includes("T")
        ? appointment.appointmentDate.split("T")[0]
        : appointment.appointmentDate;
  
      const appointmentDate = new Date(formattedDate).getTime();
      const fromDate = fromTime ? new Date(fromTime).getTime() : null;
      const toDate = toTime ? new Date(toTime).getTime() : null;
  
      console.log("Appointment Date:", formattedDate, "Parsed:", appointmentDate);
  
      // Ensure appointment falls between From and To date
      const isWithinDateRange =
        (!fromDate || appointmentDate >= fromDate) && // If no fromDate, don't filter
        (!toDate || appointmentDate <= toDate); // If no toDate, don't filter
  
      // Ensure search term filtering
      const matchesDoctorName = searchTerm
        ? appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
  
      return matchesDoctorName && isWithinDateRange;
    });
  
    console.log("Filtered Appointments:", filtered);
    setFilteredAppointments(filtered);
  };
  
  

  const toggleDropdown = (index: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusInfo = (statusID: string) => {
    // console.log("StatusID:", statusID, "Status List:", statusList);
    const status = statusList.find((s) => s.appLOVID === statusID);
    return status ? status.name : "Unknown";
  };
  

  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
        case "Waiting":
            return "#FFC107"; // Yellow
        case "Waiting for Schedule":
            return "#FF9800"; // Orange
        case "Waiting for Doctor Schedule":
            return "#FB8C00"; // Dark Orange
        case "Confirmed":
            return "#4CAF50"; // Green
        case "Assign to Billing":
            return "#2196F3"; // Blue
        case "Assign to Medical":
            return "#03A9F4"; // Light Blue
        case "Assign to Lab":
            return "#9C27B0"; // Purple
        case "Closed":
            return "#616161"; // Dark Gray
        case "Rescheduled":
            return "#795548"; // Brown
        case "Cancel":
            return "#F44336"; // Red
        case "Rejected":
            return "#D32F2F"; // Dark Red
        case "Consult Another Doctor":
            return "#009688"; // Teal
        case "Recommend to Admit":
            return "#E64A19"; // Deep Orange
        case "Doctor Review":
            return "#673AB7"; // Indigo
        default:
            return "#9E9E9E"; // Default (Gray)
    }
};
  
  
 const handleStatusChange = async (appointmentID: string, newStatusID: string) => {
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    alert("User not logged in. Please log in again.");
    return;
  }

  const url = `https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentStatus?appointmentId=${appointmentID}&statusid=${newStatusID}&UpdatedBy=${userID}`;

  try {
    const response = await axios.post(url, null, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.appointmentID === appointmentID ? { ...appt, statusID: newStatusID } : appt
        )
      );
      setDropdownVisible({});
      alert("Status updated successfully");
    } else {
      alert("Failed to update status");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("An error occurred while updating the status");
  }
};


const handleEditClick = (appointment: Appointment) => {
  console.log("Editing Appointment:", appointment);
  setSelectedAppointment(appointment); // Store the full appointment object
  setIsEditModalOpen(true);
};


useEffect(() => {
  console.log("Updated selectedAppointment:", selectedAppointment);
}, [selectedAppointment]);


const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedDate = e.target.value;
  setAppointmentDate(selectedDate); // Ensures the date is in YYYY-MM-DD format
  console.log("Selected Date:", selectedDate);
};

const openEditModal = (appointment) => {
  setSelectedDoctor(appointment.doctorID); // Set default doctor ID
  setAppointmentDate(appointment.date); // Set default date
  setSelectedTimeSlot(appointment.timeSlot); // Set default time slot
  setCurrentAppointment(appointment); // Store the current appointment
  setIsEditModalOpen(true); // Open modal
};
  
  const formatDate = (dateString: string) => dateString.split("T")[0];

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
         {/* Search Input */}
      <input
        type="text"
        placeholder="Search Doctor Name..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch();
        }}
        className="flex-grow rounded-md border border-stroke bg-transparent p-2
         text-black outline-none focus:border-primary"
      />

      {/* Date Pickers */}
      <input
  type="text"
  placeholder="From Date"
  value={fromTime ? fromTime.split("T")[0] : ""}
  onFocus={(e) => (e.target.type = "date")}
  onBlur={(e) => {
    if (!fromTime) e.target.type = "text";
  }}
  onChange={(e) => {
    setFromTime(e.target.value);
    handleSearch();
  }}
  className="flex-grow border border-stroke bg-transparent ml-2 p-2 text-black outline-none focus:border-primary rounded-md"
/>

<input
  type="text"
  placeholder="To Date"
  value={toTime ? toTime.split("T")[0] : ""}
  onFocus={(e) => (e.target.type = "date")}
  onBlur={(e) => {
    if (!toTime) e.target.type = "text";
  }}
  onChange={(e) => {
    setToTime(e.target.value);
    handleSearch();
  }}
  className="flex-grow border border-stroke bg-transparent ml-2 p-2 text-black outline-none focus:border-primary rounded-md"
/>



         <CustomButton >
         Book Appointment
    </CustomButton>
      </div>
     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      
  {filteredAppointments.map((appointment, index) => (
    <div key={index} className="p-4 rounded-lg shadow-md bg-white border border-blue-300">
      
      {/* Patient Details */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaUser color="#007bff" />
          <span className="text-black font-semibold">{appointment.patientName}</span>

          {appointment.patientGender?.toLowerCase() === "male" || appointment.patientGender?.toLowerCase() === "m" ? (
            <FaMars color="blue" />
          ) : appointment.patientGender?.toLowerCase() === "female" || appointment.patientGender?.toLowerCase() === "f" ? (
            <FaVenus color="#C71585" />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-black font-semibold">Age: {calculateAge(appointment.patientDateOfBirth || "")}</span>
          <FaEdit color="gray" className="cursor-pointer" onClick={() => handleEditClick(appointment)} />
        </div>
      </div>

      {/* Modal Popup */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>Doctor:</label>
              <select onChange={handleDoctorChange} value={selectedDoctorID}>
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorID} value={doctor.doctorID}>
                    {doctor.doctorName}
                  </option>
                ))}
              </select>

              <label>Date:</label>
              <input
                type="date"
                value={
                  selectedAppointment?.appointmentDate
                    ? selectedAppointment.appointmentDate.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedAppointment((prev) =>
                    prev ? { ...prev, appointmentDate: e.target.value } : null
                  )
                }
              />

              <label>Time Slot:</label>
              <select value={selectedTimeSlot} onChange={handleTimeSlotChange}>
                <option value="">Select a Time Slot</option>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))
                ) : (
                  <option disabled>No slots available</option>
                )}
              </select>
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Date and Time */}
      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaCalendarAlt color="#dc3545" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock color="#ffc107" />
          <span className="text-right">{appointment.appointmentTime}</span>
        </div>
      </div>

      {/* Contact and Doctor Details */}
      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaPhoneAlt color="#28a745" />
          <span>{appointment.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FaUserMd color="#17a2b8" />
          <span className="text-black font-semibold">{appointment.doctorName}</span>
        </div>
      </div>

      {/* Appointment Status */}
      <div className="mt-2 flex justify-between items-center">
        <span
          className="px-2 py-1 rounded font-bold text-sm truncate max-w-[150px] overflow-hidden"
          style={{ color: getStatusColor(getStatusInfo(appointment.statusID)) }}
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
          className="block mt-1 border rounded p-1 w-full"
          onChange={(e) => {
            const selectedStatus = e.target.value;
            if (selectedStatus) {
              handleStatusChange(appointment.appointmentID, selectedStatus);
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
   
    </div>
    
  );
};

export default AppointmentCards;
