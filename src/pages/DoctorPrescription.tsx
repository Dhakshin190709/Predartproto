import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
interface Timing {
  Morning: { BF: boolean; AF: boolean };
  Afternoon: { BF: boolean; AF: boolean };
  Night: { BF: boolean; AF: boolean };
}



const MedicalPrescription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [problem, setProblem] = useState('');
  const [dateIssued] = useState(() => new Date().toISOString().split('T')[0]);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const [hospitalInfo, setHospitalInfo] = useState<any>(null);
  const appointment = location.state?.appointment; // Extract from state

  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/MedicineMaster');
        if (Array.isArray(response.data)) {
          setMedicines(response.data);
        }
      } catch (error) {
        console.error('Failed to load medicines:', error);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    const unitID = sessionStorage.getItem('unitID');
    if (!unitID) return;

    const fetchHospitalDetails = async () => {
      try {
        const response = await api.get(`/Hospital/${unitID}`);
        if (response.data?.success) {
          setHospitalInfo(response.data.data);
        } else {
          console.error('Hospital fetch failed:', response.data?.message);
        }
      } catch (error) {
        console.error('Failed to fetch hospital details:', error);
      }
    };

    fetchHospitalDetails();
  }, []);
 

 const handleSubmit = async () => {
  const userId = sessionStorage.getItem('userID');
  const now = new Date().toISOString();

  const payload = {
    doctorPrescription: {
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
      doctorID: appointment?.doctorID,
      patientID: appointment?.patientID,
      appointmentID: appointment?.appointmentID,
      dateIssued: now,
      diagnosis: problem,
      notes: appointment?.notes || '',
      followUpDate: followUpDate || null,
    },
    doctorPrescriptionLineItem: rows.map((row) => ({
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
      medicineMasterID: row.name,
      morning: row.timings?.Morning?.BF || row.timings?.Morning?.AF || false,
      afternoon: row.timings?.Afternoon?.BF || row.timings?.Afternoon?.AF || false,
      evening: row.timings?.Evening?.BF || row.timings?.Evening?.AF || false,
      night: row.timings?.Night?.BF || row.timings?.Night?.AF || false,
      noOfDays: parseInt(row.days) || 0,
      beforefood:
        row.timings?.Morning?.BF ||
        row.timings?.Afternoon?.BF ||
        row.timings?.Evening?.BF ||
        row.timings?.Night?.BF ||
        false,
      afterfood:
        row.timings?.Morning?.AF ||
        row.timings?.Afternoon?.AF ||
        row.timings?.Evening?.AF ||
        row.timings?.Night?.AF ||
        false,
      instructions: row.instructions || '',
    })),
  };
try {
  const response = await api.post('/DoctorPrescription/SaveDoctorPrescription', payload);
  console.log("✅ Response Data:", response.data);

  if (response.status === 200 && typeof response.data === 'string') {
    toast.success('Prescription saved successfully.');
    //navigate('/prescription', { state: { entries: rows } });
  } else {
    toast.error('Failed to save: ' + (response.data?.message || 'Unknown error'));
  }
} catch (error) {
  console.error('Error saving prescription:', error);
  toast.error('Something went wrong.');
}


};


  

  const [rows, setRows] = useState([
    {
      id: 1,
      type: '',
      name: '',
      timings: {
        Morning: { BF: false, AF: false },
        Afternoon: { BF: false, AF: false },
        Night: { BF: false, AF: false },
      },
      days: '',
      count: 0,
    },
  ]);

  
  const handleInputChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        let updates = { [field]: value };

        if (field === 'name') {
          const med = medicines.find((m) => m.medicineID === value);
          if (med) {
            updates = {
              ...updates,
              medicationType: med.medicineType,
              dosage: med.dosage,
            };
          }
        }

        return { ...row, ...updates };
      }),
    );
  };

  const handleCheckboxChange = (id, time, key, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              timings: {
                ...row.timings,
                [time]: { ...row.timings[time], [key]: value },
              },
            }
          : row,
      ),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: '',
        timings: {
          Morning: { BF: false, AF: false },
          Afternoon: { BF: false, AF: false },
          Evening: { BF: false, AF: false },
          Night: { BF: false, AF: false },
        },
        days: '',
        instructions: '',
      },
    ]);
  };

  useEffect(() => {
    if (appointment?.notes) {
      setProblem(appointment.notes);
    }
  }, [appointment]);

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());
    if (!hasHadBirthday) age--;
    return age;
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-black mt-4 mb-8">
        Doctor Prescription
      </h1>
      <div className="w-full bg-transparent py-4 px-6 text-gray-700 shadow-md">
        <div>
          {/* Doctor & Hospital Rows */}
          <div className="flex flex-col items-center gap-1 text-sm md:text-base font-semibold">
            <div className="flex justify-center">
              <span className="text-blue-700 w-[85px] text-right">Doctor:</span>
              <span className="ml-2">{appointment?.doctorName || 'N/A'}</span>
            </div>
            <div className="flex justify-center">
              <span className="text-blue-700 w-[85px] text-right">
                Hospital:
              </span>
              <span className="ml-2">
                {hospitalInfo?.hospitalName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-center">
              <span className="text-blue-700 w-[85px] text-right">
                Landline:
              </span>
              <span className="ml-2">{hospitalInfo?.landline || 'N/A'}</span>
              <span className="mx-2">|</span>
              <span className="text-blue-700">Email:</span>
              <span className="ml-1">{hospitalInfo?.email || 'N/A'}</span>
            </div>
          </div>

          {/* Patient & Appointment Details */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm md:text-base font-medium text-gray-700 px-4 mt-4">
            <div className="w-full md:w-1/2 text-left mb-2 md:mb-0">
              <span className="text-blue-600">Patient Name:</span>{' '}
              {appointment?.patientName || 'N/A'}
            </div>
            <div className="w-full md:w-1/2 text-right">
              <span className="text-blue-600">Appointment No:</span>{' '}
              {appointment?.appointmentNumber || 'N/A'} &nbsp;|&nbsp;
              <span className="text-blue-600">Date:</span>{' '}
              {appointment?.appointmentDate?.split('T')[0] || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <br />
      <div className="flex flex-col gap-4">
        {/* Row 1: Problem + Diagnosis */}
        <div className="flex mb-2">
          {/* Problem Input */}
          <div className="w-2/5 mr-4">
            <textarea
              id="problem"
              disabled
              value={problem}
              rows={1}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary resize-y placeholder:text-base dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter problem"
            />
            {/* Date Fields under Problem */}
            <div className="flex gap-4 mt-2">
              {/* Date Issued */}
              <div className="w-1/2">
                <input
                  type="date"
                  value={dateIssued}
                  disabled
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full rounded-lg border border-stroke bg-white py-3 pl-4 pr-6 text-black outline-none focus:border-primary cursor-pointer"
                />
              </div>

              {/* Follow-Up Date */}
              <div className="w-1/2">
                {!showFollowUpPicker ? (
                  <input
                    type="text"
                    readOnly
                    value={followUpDate ? followUpDate : ''}
                    onClick={() => setShowFollowUpPicker(true)}
                    placeholder="Follow-Up Date"
                    className="w-full rounded-lg border border-stroke bg-white py-3 pl-4 pr-6 text-black outline-none focus:border-primary placeholder:text-gray-500 cursor-pointer"
                  />
                ) : (
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    onBlur={() => !followUpDate && setShowFollowUpPicker(false)}
                    className="w-full rounded-lg border border-stroke bg-white py-3 pl-4 pr-6 text-black outline-none focus:border-primary"
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis Input */}
          <div className="w-3/5">
            <textarea
              id="description"
              rows={5}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black leading-[1.1rem] outline-none focus:border-primary resize-y placeholder:text-base dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Diagnosis here"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="border border-stroke rounded-lg p-4 shadow-md space-y-4 bg-gray-50"
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Name Dropdown */}
              <div className="flex-shrink-0 w-[25%]">
                <select
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black outline-none focus:border-primary"
                  value={row.name || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'name', e.target.value)
                  }
                >
                  <option value="">Select Medicine Name</option>
                  {medicines.map((med) => (
                    <option key={med.medicineID} value={med.medicineID}>
                      {med.medicineName}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Timings Block (Place this inside the map loop!) */}
              <div className="flex flex-1 gap-4 w-[45%]">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                  <div key={time} className="flex flex-col items-center w-1/4">
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={
                          row.timings?.[time]?.BF ||
                          row.timings?.[time]?.AF ||
                          false
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleCheckboxChange(row.id, time, 'BF', checked);
                          handleCheckboxChange(row.id, time, 'AF', checked);
                        }}
                      />
                      {time}
                    </label>

                    <div className="flex gap-6 mt-2">
                      {['BF', 'AF'].map((key) => (
                        <label
                          key={key}
                          className="flex flex-col items-center text-sm"
                        >
                          {key}
                          <input
                            type="checkbox"
                            className="w-4 h-4 mt-1"
                            checked={row.timings?.[time]?.[key] || false}
                            onChange={(e) =>
                              handleCheckboxChange(
                                row.id,
                                time,
                                key,
                                e.target.checked,
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Days Input */}
              <div className="flex-shrink-0 w-[10%]">
                <input
                  type="number"
                  placeholder="Days"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black outline-none focus:border-primary"
                  value={row.days || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'days', e.target.value)
                  }
                />
              </div>

              {/* Instructions */}
              <div className="flex-shrink-0 w-[15%]">
                <textarea
                  rows={1}
                  placeholder="Instructions"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black outline-none focus:border-primary resize-y"
                  value={row.instructions || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'instructions', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Button */}
        <div className="flex items-center justify-end gap-1">
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={addRow}
          >
            +
          </div>
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
  hover:from-[#007BFF] hover:to-[#004A99]
  text-white transition duration-150 
  ease-out hover:ease-in py-2 px-5 rounded-lg"
      >
        Submit
      </button>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};
export default MedicalPrescription;
