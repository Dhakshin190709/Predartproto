import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaMobileAlt,FaClock, FaUserInjured, FaUserMd, FaHospital, FaPhone, FaArrowRight, FaArrowLeft } from "react-icons/fa";

interface Appointment {
  doctorID: string;
  patientID: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface Doctor {
  doctorID: string;
  doctorName: string;
  hospitalID: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
}

interface Patient {
  patientID: string;
  patientName: string;
  patientPhoneNumber: string;
}

const UpcomingAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentRes, doctorRes, hospitalRes, patientRes] = await Promise.all([
          fetch("https://predart003-001-site1.anytempurl.com/api/Appointment"),
          fetch("https://predart003-001-site1.anytempurl.com/api/Doctor"),
          fetch("https://predart003-001-site1.anytempurl.com/api/Hospital"),
          fetch("https://predart003-001-site1.anytempurl.com/api/Patient"),
        ]);

        if (!appointmentRes.ok || !doctorRes.ok || !hospitalRes.ok || !patientRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const appointmentsData: Appointment[] = await appointmentRes.json();
        const doctorsData = await doctorRes.json();
        const hospitalsData = await hospitalRes.json();
        const patientsData = await patientRes.json();

        // Sort upcoming appointments by date
        const upcomingAppointments = appointmentsData
          .filter((appointment) => new Date(appointment.appointmentDate) >= new Date())
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

        setAppointments(upcomingAppointments);
        setDoctors(doctorsData.data);
        setHospitals(hospitalsData);
        setPatients(patientsData.data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination Logic: Show only 3 cards at a time
  const visibleAppointments = appointments.slice(currentIndex, currentIndex + 3);
  const showNext = currentIndex + 3 < appointments.length;
  const showBack = currentIndex > 0;

  // Format Date & Time
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


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {visibleAppointments.length > 0 ? (
          visibleAppointments.map((appointment, index) => {
            const doctor = doctors.find((doc) => doc.doctorID === appointment.doctorID);
            const hospital = hospitals.find((hosp) => hosp.hospitalID === doctor?.hospitalID);
            const patient = patients.find((pat) => pat.patientID === appointment.patientID);

            return (
              <div key={index} className="bg-white shadow-md p-2 rounded-md">
                {/* First Row: Doctor, Patient, Hospital - Aligned Names */}
                <div className="grid grid-cols-3 gap-2 text-sm mb-1">
                  <div className="flex items-center">
                    <FaUserMd className="text-blue-500 mr-1" />
                    <span className="truncate">{doctor?.doctorName || "Unknown Doctor"}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUserInjured className="text-green-500 mr-1" />
                    <span className="truncate">{patient?.patientName || "Unknown Patient"}</span>
                  </div>
                  <div className="flex items-center">
                    <FaHospital className="text-red-500 mr-1" />
                    <span className="truncate">{hospital?.hospitalName || "Unknown Hospital"}</span>
                  </div>
                </div>

                {/* Second Row: Date, Time, Patient Phone */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-500 mr-1" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-green-500 mr-1" />
                    <span>{formatTime(appointment.appointmentTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMobileAlt className="text-purple-500 mr-1" /> {/* Updated icon color */}
                    <span>{patient?.patientPhoneNumber || "No Phone"}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No upcoming appointments found.</p>
        )}
      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-between mt-3">
        {showBack && (
          <button
            onClick={() => setCurrentIndex((prev) => prev - 3)}
            className="text-blue-600 font-semibold flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        )}

        {showNext && (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 3)}
            className="text-blue-600 font-semibold flex items-center ml-auto"
          >
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
    `}
</style>

    </div>
  );
};

export default UpcomingAppointments;
