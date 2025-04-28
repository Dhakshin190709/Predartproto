import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaClipboardList  } from 'react-icons/fa';
import CustomButton from '../../components/CustomButton';
import patientIcon from '../../images/icon/Patient profile people (3).svg';
import DoctorIcon from '../../images/icon/Surgeon medicine doctor physician.svg';
import ClockIcon from '../../images/icon/Clock (1).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (3).svg';
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
interface Appointment {
  appointmentID: string;
  patientID: string;
  patientName?: string;
  doctorID: string;
  doctorName?: string;
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

interface Doctor {
  doctorID: string;
  doctorName: string;
}

interface AppointmentHistory {
  appointmentHistoryID: string;
  createdOn: string;
  username: string;
  name: string;
}

const AppointmentHistoryPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [trackingData, setTrackingData] = useState<AppointmentHistory[]>([]);
  const [trackingAppointment, setTrackingAppointment] =
    useState<Appointment | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const roleNameRaw = sessionStorage.getItem('roleName');
    const roleName = roleNameRaw?.toLowerCase();
    const patientID = sessionStorage.getItem('patientID');
    const doctorID = sessionStorage.getItem('doctorID');
    const unitID = sessionStorage.getItem('unitID');

    console.log('Role Name:', roleNameRaw);

    if (roleName === 'patient') {
      console.log('Patient ID:', patientID);
    } else if (roleName === 'doctor') {
      console.log('Doctor ID:', doctorID);
    } else if (roleName === 'reception') {
      console.log('Unit ID:', unitID);
    }

    let appointmentURL =
      'https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment';

    if (roleName === 'patient' && patientID) {
      appointmentURL += `?PatientID=${patientID}`;
    } else if (roleName === 'doctor' && doctorID) {
      appointmentURL += `?DoctorID=${doctorID}`;
    } else if (roleName === 'reception' && unitID) {
      appointmentURL += `?UnitID=${unitID}`;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(appointmentURL);
        let appointmentsData: Appointment[] = Array.isArray(response.data)
          ? response.data
          : [];

        // Redundant but safe fallback
        if (roleName === 'patient' && patientID) {
          appointmentsData = appointmentsData.filter(
            (appointment) => appointment.patientID === patientID,
          );
        } else if (roleName === 'doctor' && doctorID) {
          appointmentsData = appointmentsData.filter(
            (appointment) => appointment.doctorID === doctorID,
          );
        } else if (roleName === 'reception' && unitID) {
          appointmentsData = appointmentsData.filter(
            (appointment) => appointment.hospitalID === unitID,
          );
        }

        // Directly set the appointments (without additional patient/doctor mapping)
        setAppointments(appointmentsData);
        setFilteredAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    const fetchStatusList = async () => {
      try {
        const response = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=AppointmentStauts',
        );
        if (Array.isArray(response.data?.data)) {
          setStatusList(response.data.data);
        }
      } catch {
        console.error('Failed to fetch status list.');
      }
    };

    fetchData();
    fetchStatusList();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredAppointments(
      appointments.filter(
        (appointment) =>
          appointment.patientName?.toLowerCase().includes(term) ||
          appointment.doctorName?.toLowerCase().includes(term),
      ),
    );
  };

  const handleTracking = async (appointment: Appointment) => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Appointment/AppointmentHistory/${appointment.appointmentID}`,
      );
      let historyData: AppointmentHistory[] = Array.isArray(response.data)
        ? response.data
        : [];

      // Sort history data by createdOn (latest first)
      historyData.sort(
        (a, b) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime(),
      );

      // Remove duplicate statuses (keep only latest entry for each unique status name)
      const uniqueStatusMap = new Map();
      historyData.forEach((history) => {
        const matchedStatus = statusList.find(
          (status) => status.appLOVID === history.appointmentHistoryID,
        );
        const statusName = matchedStatus ? matchedStatus.name : history.name;

        if (!uniqueStatusMap.has(statusName)) {
          uniqueStatusMap.set(statusName, { ...history, name: statusName });
        }
      });

      setTrackingAppointment(appointment);
      setTrackingData(Array.from(uniqueStatusMap.values())); // Convert Map to array
      setIsTrackingModalOpen(true);
    } catch {
      console.error('Failed to fetch appointment history.');
    }
  };

  {
    /* Function to get color based on date */
  }
  const getDateColor = (date) => {
    const day = new Date(date).getDate(); // Extract day from the date
    const colors = [
      'bg-red-400',
      'bg-blue-400',
      'bg-green-400',
      'bg-yellow-400',
      'bg-purple-400',
    ]; // Add more colors if needed
    return colors[day % colors.length]; // Assign color based on day
  };

  const formatDate = (dateString: string) => dateString.split('T')[0];

  const getStatusName = (statusID: string) => {
    const status = statusList.find((s) => s.appLOVID === statusID);
    return status ? status.name : 'Unknown Status';
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search by Patient or Doctor Name"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 rounded-md mb-4 border border-stroke bg-transparent 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-md bg-white border border-blue-300"
          >
            <div className="flex items-center gap-2">
              <img
                src={patientIcon} // <-- Replace with actual image path or dynamic URL
                alt="Patient"
                className="w-6 h-6 rounded-full ml-3"
              />
              <span className="text-black font-semibold">
                {appointment.patientName}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <img src={DoctorIcon} alt="doctor" className="w-5 h-5 ml-3" />
              <span className="text-black font-semibold">
                {appointment.doctorName}
              </span>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={CalendarIcon}
                  alt="calendar"
                  className="w-8 h-7 ml-0 mt-1"
                />
                <span className="text-black font-semibold">
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img src={ClockIcon} alt="clock" className="w-5 h-5 mr-1" />
                <span className="text-black font-semibold">
                  {appointment.appointmentTime}
                </span>
              </div>
            </div>

            <div className="mt-2 mb-4 flex items-center gap-2">
              <img src={PhoneIcon} alt="phone" className="w-5 h-5 ml-2" />
              <span className="text-black font-semibold">
                {appointment.phoneNumber}
              </span>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <button
                onClick={() => handleTracking(appointment)}
                className="px-3 py-1 ml-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 flex items-center gap-2"
              >
                <FaClipboardList  />
                Tracking
              </button>
            </div>
          </div>
        ))}
      </div>

      {isTrackingModalOpen && trackingAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Tracking for {trackingAppointment.patientName}
            </h2>

            {/* Timeline Container */}
            <div className="relative">
              {trackingData.map((item, index) => (
                <div key={index} className="flex items-start relative mb-6">
                  <div
                    className={`w-5 h-5 ${getDateColor(item.createdOn)} rounded-full border-2 border-white z-10 absolute left-0`}
                  ></div>

                  {/* Vertical Line Connecting Dots */}
                  {index !== trackingData.length - 1 && (
                    <div className="absolute left-2 top-5 h-full border-l-2 border-dashed border-green-300"></div>
                  )}

                  {/* Timeline Content (Shifted Right for Left Alignment) */}
                  <div className="bg-gray-100 p-3 rounded-lg shadow-md w-3/4 ml-8">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.createdOn).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      -
                      {new Date(item.createdOn)
                        .toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                        .replace(':', '.')}
                    </p>

                    {/* User Name Label */}
                    <p className="text-sm text-gray-200">
                      <span className="text-sm">Updated by:</span>{' '}
                      {item.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <CustomButton
                onClick={() => setIsTrackingModalOpen(false)}
                className="mt-4"
              >
                Close
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryPage;
