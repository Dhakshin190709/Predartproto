import React, { useEffect, useState } from "react";
import PhoneIcon from '../../images/icon/Phone volume solid (3).svg';
import CalendarIcon from '../../images/icon/Blossom calendar festival (1).svg';
import ClockIcon from '../../images/icon/Clock (1).svg';
import DoctorIcon from '../../images/icon/Surgeon medicine doctor physician.svg';
import HospitalIcon from '../../images/icon/Hospital solid (1).svg';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

interface Appointment {
  doctorID: string;
  patientID: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  hospitalName: string;
  patientName: string;
  patientPhoneNumber: string;
}

const UpcomingAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const unitID = sessionStorage.getItem("unitID");
        const today = new Date().toISOString().split("T")[0];
  
        const response = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Appointment/GetAppointment?HospitalID=${unitID}&StartDate=${today}&EndDate=${today}`
        );
  
        const result = await response.json();
        console.log("Fetched appointments:", result);
  
        const fetchedAppointments = result || [];
  
        const currentDateTime = new Date();
  
        const upcomingAppointments = fetchedAppointments
          .filter((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate);
            const [hours, minutes] = appointment.appointmentTime.split(":");
            appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return appointmentDate >= currentDateTime;
          })
          .sort((a, b) => {
            const dateA = new Date(a.appointmentDate);
            const [hoursA, minutesA] = a.appointmentTime.split(":");
            dateA.setHours(parseInt(hoursA), parseInt(minutesA), 0, 0);
  
            const dateB = new Date(b.appointmentDate);
            const [hoursB, minutesB] = b.appointmentTime.split(":");
            dateB.setHours(parseInt(hoursB), parseInt(minutesB), 0, 0);
  
            return dateA - dateB;
          });
  
        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch appointments.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAppointments();
  }, []);
  
  

  // Pagination Logic: Show 2 cards at a time
  const visibleAppointments = appointments.slice(currentIndex, currentIndex + 2);
  const showNext = currentIndex + 2 < appointments.length;
  const showBack = currentIndex > 0;

  const formatDate = (dateString: string): string => dateString.split("T")[0];
  const formatTime = (timeString: string): string => timeString.substring(0, 5);

  if (loading) return <p>Loading upcoming appointments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4">
    <div className="overflow-hidden whitespace-nowrap bg-red-100 py-1">
      <p className="text-red-600 font-bold text-lg animate-marquee">
        🔔 Stay updated! Check your upcoming appointments regularly. 🔔
      </p>
    </div>
  
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
      {visibleAppointments.length > 0 ? (
        visibleAppointments.map((appointment, index) => (
          <div key={index} className="bg-white shadow-md p-2 rounded-md">
            <div className="grid grid-cols-3 gap-2 text-sm mb-1">
              <div className="flex items-center">
              <img
                      src={DoctorIcon}
                      alt="doctor"
                      className="w-4 h-5 mr-1"
                    />
                <span className="truncate">{appointment.doctorName || "Unknown Doctor"}</span>
              </div>
              <div className="flex items-center">
              <img src={PhoneIcon} alt="phone" className="w-5 h-5 mr-1" />
                <span className="truncate">{appointment.patientName || "Unknown Patient"}</span>
              </div>
              <div className="flex items-center">
              <img
                      src={HospitalIcon}
                      alt="hospital"
                      className="w-5 h-5 mr-1"
                    />
                <span className="truncate">{appointment.hospitalName || "Unknown Hospital"}</span>
              </div>
            </div>
  
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center">
              <img
                  src={CalendarIcon}
                      alt="calendar"
                      className="w-5 h-6 mr-1"
                    />
                <span>{formatDate(appointment.appointmentDate)}</span>
              </div>
              <div className="flex items-center">
              <img src={ClockIcon} alt="clock" className="w-4 h-5 mr-1" />
                <span>{formatTime(appointment.appointmentTime)}</span>
              </div>
              <div className="flex items-center">
              <img src={PhoneIcon} alt="phone" className="w-5 h-5 mr-1" />
                <span>{appointment.patientPhoneNumber || "No Phone"}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No appointments found for today.</p>
      )}
    </div>
  
    <div className="flex justify-between mt-3">
      {showBack && (
        <button onClick={() => setCurrentIndex((prev) => prev - 2)} className="text-blue-600 font-semibold flex items-center">
         <FaArrowLeft className="mr-2" /> Back
        </button>
      )}
      {showNext && (
        <button onClick={() => setCurrentIndex((prev) => prev + 2)} className="text-blue-600 font-semibold flex items-center ml-auto">
        Next <FaArrowRight className="ml-2" />
        </button>
      )}
    </div>
  
    <style>{`
      @keyframes marquee {
        from { transform: translateX(100%); }
        to { transform: translateX(-100%); }
      }
      .animate-marquee {
        display: inline-block;
        white-space: nowrap;
        animation: marquee 10s linear infinite;
      }
    `}</style>
  </div>
  
  );
};

export default UpcomingAppointments;
