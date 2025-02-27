import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaClock, FaPhoneAlt } from "react-icons/fa";

interface Appointment {
  patientID: string;
  patientName?: string;
  appointmentDate: string;
  appointmentTime: string;
  statusID: string;
  phoneNumber: string | null;
}

interface Status {
  appLOVID: string;
  name: string;
}

interface Patient {
  patientID: string;
  patientName: string;
  patientPhoneNumber: string;
}

const AppointmentCards: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/Appointment");
        let appointmentsData: Appointment[] = Array.isArray(response.data) ? response.data : [];

        const missingPhonePatients = appointmentsData
          .filter((appt) => !appt.phoneNumber)
          .map((appt) => appt.patientID);

        let patientsData: Patient[] = [];
        if (missingPhonePatients.length > 0) {
          try {
            const patientResponse = await axios.get("https://predart003-001-site1.anytempurl.com/api/Patient");
            patientsData = Array.isArray(patientResponse.data?.data) ? patientResponse.data.data : [];
          } catch {
            console.error("Failed to fetch patient data.");
          }
        }

        appointmentsData = appointmentsData.map((appt) => {
          const patient = patientsData.find((p) => p.patientID === appt.patientID);
          return {
            ...appt,
            phoneNumber: appt.phoneNumber || patient?.patientPhoneNumber || "N/A",
            patientName: patient?.patientName || "Unknown",
          };
        });

        setAppointments(appointmentsData);
        setFilteredAppointments(appointmentsData);
      } catch {
        console.error("Failed to fetch appointments.");
      }
    };

    const fetchStatusList = async () => {
      try {
        const response = await axios.get("https://predart003-001-site1.anytempurl.com/api/AppLOV?type=appointmentstauts");
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredAppointments(
      appointments.filter((appointment) =>
        appointment.patientName?.toLowerCase().includes(term)
      )
    );
  };

  const toggleDropdown = (index: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusInfo = (statusID: string) => {
    const status = statusList.find((s) => s.appLOVID === statusID);
    return status ? status.name : "Unknown";
  };

  const getStatusColor = (statusID: string) => {
    switch (statusID) {
      case "1":
        return "text-green-600 font-bold"; // Confirmed
      case "2":
        return "text-yellow-600 font-bold"; // Pending
      case "3":
        return "text-red-600 font-bold"; // Canceled
      default:
        return "text-gray-600 font-bold"; // Default
    }
  };

  const formatDate = (dateString: string) => dateString.split("T")[0];

  return (
    <div className="p-4">
      {/* Search & Book Appointment Row */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Patient Name..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border rounded-md flex-grow"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Book Appointment</button>
      </div>

      {/* Card Grid: 3 Cards Per Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white border border-blue-300"
          >
            <div className="flex flex-col gap-2">
              {/* Patient Name */}
              <div className="flex items-center gap-2">
                <FaUser color="#007bff" />
                <span className="text-black font-semibold">{appointment.patientName}</span>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-2">
                <FaPhoneAlt color="#dc3545" />
                <span className="text-black">{appointment.phoneNumber}</span>
              </div>

              {/* Date & Time */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt color="#28a745" />
                  <span className="text-black">{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock color="#ff851b" />
                  <span className="text-black">{appointment.appointmentTime}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center mt-2">
                <span className={getStatusColor(appointment.statusID)}>
                  {getStatusInfo(appointment.statusID)}
                </span>
                <div className="relative">
                  <button
                    className="px-2 py-1 bg-violet-600 text-white rounded"
                    onClick={() => toggleDropdown(index)}
                  >
                    Change Status
                  </button>
                  {dropdownVisible[index] && (
                    <div className="absolute mt-1 border border-gray-300 rounded bg-white shadow-lg z-10">
                      <select
                        className="block w-full px-2 py-1 bg-white border-none"
                        onChange={(e) => console.log("Status changed to", e.target.value)}
                      >
                        {statusList.map((status) => (
                          <option key={status.appLOVID} value={status.appLOVID}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCards;
