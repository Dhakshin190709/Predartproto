import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaClock, FaHospital, FaPhoneAlt, FaMars, FaVenus } from "react-icons/fa";

interface Appointment {
  patientID: string;
  doctorID: string;
  appointmentDate: string;
  appointmentTime: string;
  hospitalID: string;
  patientPhoneNumber: string;
}

interface Patient {
  patientID: string;
  patientName: string;
  patientPhoneNumber: string;
  patientDateOfBirth: string;
  patientGender: string;
}

interface Doctor {
  doctorID: string;
  doctorName: string;
  hospitalID: string;
}

interface Hospital {
  hospitalID: string;
  hospitalName: string;
  hospitalPhoneNumber?: string;
}

const SearchAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    axios.get("https://predart003-001-site1.anytempurl.com/api/Appointment")
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error("Error fetching appointments:", error));

    axios.get("https://predart003-001-site1.anytempurl.com/api/Patient")
      .then((response) => setPatients(response.data?.data || []))
      .catch((error) => console.error("Error fetching patients:", error));

    axios.get("https://predart003-001-site1.anytempurl.com/api/Doctor")
      .then((response) => setDoctors(response.data?.data || []))
      .catch((error) => console.error("Error fetching doctors:", error));

    axios.get("https://predart003-001-site1.anytempurl.com/api/Hospital")
      .then((response) => setHospitals(response.data || []))
      .catch((error) => console.error("Error fetching hospitals:", error));
  }, []);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getPatientDetails = (patientID: string) => {
    const patient = patients.find((p) => p.patientID === patientID);
    return patient ? { 
      name: patient.patientName, 
      age: calculateAge(patient.patientDateOfBirth), 
      phone: patient.patientPhoneNumber, 
      gender: patient.patientGender
    } : { name: "Unknown", age: "N/A", phone: "N/A", gender: "" };
  };

  const getDoctorHospitalDetails = (doctorID: string) => {
    const doctor = doctors.find((d) => d.doctorID === doctorID);
    if (doctor) {
      const hospital = hospitals.find((h) => h.hospitalID === doctor.hospitalID);
      return hospital ? { name: hospital.hospitalName, phone: hospital.hospitalPhoneNumber || "N/A" } : { name: "Unknown Hospital", phone: "N/A" };
    }
    return { name: "Unknown Hospital", phone: "N/A" };
  };

  const toggleExpand = (appointmentID: string) => {
    setExpandedCard(expandedCard === appointmentID ? null : appointmentID);
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-semibold text-black mb-6">Search Appointment</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input type="text" placeholder="Enter Appointment Number" 
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" placeholder="Enter Patient Name"  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" placeholder="Enter Mobile Number"  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" placeholder="Enter Doctor Name"  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} placeholder="From Date" 
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary" />
        <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} 
        placeholder="To Date"  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary" />
      </form>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button type="button" className="bg-gradient-to-b from-[#004A99] to-[#007BFF] 
          hover:from-[#007BFF] hover:to-[#004A99] text-white py-2 px-5 rounded-lg">Search</button>
        <button type="button" className="bg-gradient-to-b from-[#008000] to-[#00CC00] 
          hover:from-[#00CC00] hover:to-[#008000] text-white py-2 px-5 rounded-lg"
onClick={() => window.location.href = "/appointment/booking"}>Book Now</button>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment) => {
          const { name: patientName, age, phone: patientPhone, gender } = getPatientDetails(appointment.patientID);
          const { name: doctorHospital } = getDoctorHospitalDetails(appointment.doctorID);
          const appointmentID = `${appointment.patientID}-${appointment.appointmentDate}`;
          const genderIcon = gender.toLowerCase() === "female" || gender.toLowerCase() === "f" ? <FaVenus className="text-pink-500" /> : <FaMars className="text-blue-500" />;

          return (
            <div key={appointmentID} className="p-4 border border-blue-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toggleExpand(appointmentID)}>
              <div className="flex justify-between items-center text-xl font-medium text-black">
                <div className="flex items-center gap-2"> <FaUser className="text-blue-500" /> {patientName} {genderIcon} </div>
                <div>{age} yrs</div>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm font-medium text-black">
                <div className="flex items-center gap-2"> <FaCalendarAlt className="text-green-500" /> {appointment.appointmentDate.slice(0, 10)} </div>
                <div className="flex items-center gap-2"> <FaClock className="text-red-500" /> {appointment.appointmentTime.slice(0, 5).replace(":", ".")} </div>
              </div>
              {expandedCard === appointmentID && (
                <div className="mt-2 p-2 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-md font-medium text-black"> <FaHospital className="text-purple-500" /> {doctorHospital} </div>
                  <div className="flex items-center gap-2 text-md font-medium text-black"> <FaPhoneAlt className="text-orange-500" /><a href={`tel:${patientPhone}`} className="text-black">{patientPhone}</a> </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchAppointment;
