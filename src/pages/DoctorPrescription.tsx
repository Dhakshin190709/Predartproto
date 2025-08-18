import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import api from '../api/request';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CustomButton from '../components/CustomButton';
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
  const [showLabForm, setShowLabForm] = useState(false);
  const [selectedLab, setSelectedLab] = useState('');
  const [labStatus, setLabStatus] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [labs, setLabs] = useState([]);
  const [toastInProgress, setToastInProgress] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState<any>(null);
  const appointment = location.state?.appointment; // Extract from state
  const [errors, setErrors] = useState({});

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
    const fetchLabs = async () => {
      try {
        const res = await api.get('/Laboratory');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setLabs(res.data.data);
        } else {
          toast.error('Failed to load labs');
        }
      } catch (error) {
        console.error('Error fetching labs:', error);
        toast.error('Error loading labs');
      }
    };

    fetchLabs();
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

  const validateDiagnosis = (value) => {
    if (!value.trim()) return 'Diagnosis is required';
    const regex = /^[\w\s.,;:!?'-]+$/; // Only letters, numbers, basic punctuation
    if (!regex.test(value)) return 'Invalid characters used';
    if (/(.)\1{2,}/.test(value)) return 'No repeating letters/numbers allowed';
    return '';
  };

  const validateFollowUpDate = (date) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const selected = new Date(date).setHours(0, 0, 0, 0);
  if (!date) return 'Follow-up date is required';
  if (selected < today) return 'Cannot select past date';
  return '';
};


  const validateRow = (row) => {
    const rowErrors = {};

    // ✅ Medicine name required
    if (!row.name) rowErrors.name = 'Medicine name is required';

    // ✅ Timings: at least one must be checked
    const hasTiming = Object.values(row.timings || {}).some(
      (t) => t.BF || t.AF,
    );
    if (!hasTiming) rowErrors.timings = 'At least one timing must be checked';

    // ✅ Days: required, only digits, no 00, must be > 0, max 2 digits
    const days = String(row.days || '').trim();
    if (!days) {
      rowErrors.days = 'Days is required';
    } else if (!/^\d{1,2}$/.test(days)) {
      rowErrors.days = 'Days must be 1 or 2 digits';
    } else if (Number(days) <= 0) {
      rowErrors.days = 'Days must be greater than 0';
    } else if (days === '00') {
      rowErrors.days = 'Days cannot be 00';
    }

    // ✅ Instructions: required, valid characters, no repeating letters/numbers
    if (!row.instructions?.trim()) {
      rowErrors.instructions = 'Instructions required';
    } else {
      const regex = /^[\w\s.,;:!?'-]+$/;
      if (!regex.test(row.instructions)) {
        rowErrors.instructions = 'Instructions contain invalid characters';
      } else if (/(.)\1{2,}/.test(row.instructions)) {
        rowErrors.instructions = 'No repeating letters/numbers allowed';
      }
    }

    return rowErrors;
  };

  const handleSubmit = async () => {
    const userId = sessionStorage.getItem('userID');
    const now = new Date().toISOString();
    const newErrors = {};
    newErrors.diagnosis = validateDiagnosis(diagnosis);
    newErrors.followUpDate = validateFollowUpDate(followUpDate);

    const rowErrors = {};
    rows.forEach((row) => {
      const err = validateRow(row);
      if (Object.keys(err).length) rowErrors[row.id] = err;
    });

    newErrors.rows = rowErrors;

    setErrors(newErrors);

    const hasErrors =
      newErrors.diagnosis ||
      newErrors.followUpDate ||
      Object.keys(rowErrors).length;

    if (hasErrors) return;
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
        afternoon:
          row.timings?.Afternoon?.BF || row.timings?.Afternoon?.AF || false,
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
      const response = await api.post(
        '/DoctorPrescription/SaveDoctorPrescription',
        payload,
      );
      console.log('✅ Response Data:', response.data);

      if (response.status === 200 && typeof response.data === 'string') {
        if (!toastInProgress) {
          setToastInProgress(true);
          toast.success('Prescription saved successfully.', {
            onClose: () => setToastInProgress(false),
          });
        }
        //navigate('/prescription', { state: { entries: rows } });
      } else {
        if (!toastInProgress) {
          setToastInProgress(true);
          toast.error(
            'Failed to save: ' + (response.data?.message || 'Unknown error'),
            {
              onClose: () => setToastInProgress(false),
            },
          );
        }
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('Something went wrong.', {
          onClose: () => setToastInProgress(false),
        });
      }
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

  const handleLabTestSubmit = async () => {
    const userId = sessionStorage.getItem('userID');
    const now = new Date().toISOString();

    if (!selectedLab || !labStatus) {
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.warn('Please select both Lab and Status.', {
          onClose: () => setToastInProgress(false),
        });
      }
      return;
    }

    const payload = {
      createdBy: userId,
      updatedBy: userId,
      createdOn: now,
      updatedOn: now,
      isActive: true,

      appointmentID: appointment?.appointmentID,
      tenantID: appointment?.tenantID,
      patientID: appointment?.patientID,
      laboratoryID: selectedLab,
      status: labStatus,
    };

    try {
      const res = await api.post('/PatientLabOrder', payload);

      if (res.status === 200 || res.status === 201) {
        if (!toastInProgress) {
          setToastInProgress(true);
          toast.success('Lab Test submitted successfully.', {
            onClose: () => setToastInProgress(false),
          });
        }
        setShowLabForm(false);
        setSelectedLab('');
        setLabStatus('');
        // Wait 1 second before navigating
        setTimeout(() => {
          navigate('/PatientLabTest');
        }, 1000);
      } else {
        if (!toastInProgress) {
          setToastInProgress(true);
          toast.error('Failed to submit Lab Test.', {
            onClose: () => setToastInProgress(false),
          });
        }
      }
    } catch (error) {
      console.error('Lab Test error:', error);
      if (!toastInProgress) {
        setToastInProgress(true);
        toast.error('Lab Test submission failed.', {
          onClose: () => setToastInProgress(false),
        });
      }
    }
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
            <div className="flex flex-wrap justify-start sm:justify-center items-center gap-2">
              <span className="text-blue-700 w-[85px] text-right">Doctor:</span>
              <span className="ml-2">{appointment?.doctorName || 'N/A'}</span>
            </div>
            <div className="flex flex-wrap justify-start sm:justify-center items-center gap-2">
              <span className="text-blue-700 w-[85px] text-right">
                Hospital:
              </span>
              <span className="ml-2">
                {hospitalInfo?.hospitalName || 'N/A'}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-2 text-center">
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
          <div className="flex flex-wrap justify-between items-center text-sm md:text-base font-medium text-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-blue-600">Patient Name:</span>
              <span>{appointment?.patientName || 'N/A'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-blue-600">Appointment No:</span>
              <span>{appointment?.appointmentNumber || 'N/A'}</span>
              <span className="text-blue-600 ml-2">Date:</span>
              <span>
                {appointment?.appointmentDate?.split('T')[0] || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <br />
      <div className="flex flex-col gap-4">
        {/* Row 1: Problem + Diagnosis */}
        <div className="flex flex-col md:flex-row mb-2 gap-4">
          {/* Problem Input */}
          <div className="w-full md:w-2/5 md:mr-4">
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

  {/* ✅ Show error below */}
  {errors?.followUpDate && (
    <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>
  )}
</div>

            </div>
          </div>

          {/* Diagnosis Input */}
          <div className="w-full md:w-3/5">
            <textarea
              id="description"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black leading-[1.1rem] outline-none focus:border-primary resize-y placeholder:text-base dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter Diagnosis here"
            />
            {errors.diagnosis && (
              <p className="text-red-500 text-xs mt-1">{errors.diagnosis}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="border border-stroke rounded-lg p-4 shadow-md space-y-4 bg-gray-50"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-wrap">
              
              {/* Name Dropdown */}
              <div className="flex-shrink-0 w-full md:w-[25%]">
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
                {errors?.rows?.[row.id]?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.rows[row.id].name}
                  </p>
                )}
              </div>

              {/* ✅ Timings Block (Place this inside the map loop!) */}
              <div className="flex flex-wrap flex-1 gap-4 w-full md:max-w-[40%]">
                {[
                  { label: 'Morning', order: 1 },
                  { label: 'Evening', order: 2 },
                  { label: 'Afternoon', order: 3 },
                  { label: 'Night', order: 4 },
                ]
                  .sort((a, b) => a.order - b.order)
                  .map(({ label }) => (
                    <div key={label} className="flex flex-col items-center">
                      <label className="flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={
                            row.timings?.[label]?.BF ||
                            row.timings?.[label]?.AF ||
                            false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            handleCheckboxChange(row.id, label, 'BF', checked);
                            handleCheckboxChange(row.id, label, 'AF', checked);
                          }}
                        />
                        {label}
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
                              checked={row.timings?.[label]?.[key] || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  row.id,
                                  label,
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

                  {errors?.rows?.[row.id]?.timings && (
  <p className="w-full text-red-500 text-xs mt-2">
    {errors.rows[row.id].timings}
  </p>
)}

              </div>

              {/* Days Input */}
              <div className="flex-shrink-0 w-full md:w-[20%]">
                <input
                  type="number"
                  placeholder="Days"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black outline-none focus:border-primary"
                  value={row.days || ''}
                  onInput={(e) => {
                    if (e.target.value.length > 2) {
                      e.target.value = e.target.value.slice(0, 2);
                    }
                  }}
                  onChange={(e) =>
                    handleInputChange(row.id, 'days', e.target.value)
                  }
                  min="1"
                  max="99"
                />
                {errors?.rows?.[row.id]?.days && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.rows[row.id].days}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="flex-shrink-0 w-full md:w-[15%]">
                <textarea
                  rows={1}
                  placeholder="Instructions"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-6 text-black outline-none focus:border-primary resize-y"
                  value={row.instructions || ''}
                  onChange={(e) =>
                    handleInputChange(row.id, 'instructions', e.target.value)
                  }
                />
                {errors?.rows?.[row.id]?.instructions && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.rows[row.id].instructions}
                  </p>
                )}
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

      <div className="flex flex-wrap gap-4 mt-6">
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit
        </button>

        {/* Lab Test Button */}
        <button
          onClick={() => setShowLabForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-lg"
        >
          Lab Test
        </button>
      </div>

      {/* Show form only when button is clicked */}
      {showLabForm && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 space-y-4">
          {/* Dropdowns */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Lab Dropdown */}
            <div className="w-full md:w-1/2">
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full rounded-lg border border-stroke py-3 px-4 text-black outline-none focus:border-primary"
              >
                <option value="">-- Select Lab --</option>
                {labs.map((lab) => (
                  <option key={lab.laboratoryID} value={lab.laboratoryID}>
                    {lab.labName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-1/2">
              <select
                value={labStatus}
                onChange={(e) => setLabStatus(e.target.value)}
                className="w-full rounded-lg border border-stroke py-3 px-4 text-black outline-none focus:border-primary"
              >
                <option value="">-- Select Status --</option>
                <option value="New">New</option>
                <option value="BloodSampleCollected">
                  BloodSampleCollected
                </option>
                <option value="UndergoingTest">UndergoingTest</option>
                <option value="ReportGenerated">ReportGenerated</option>
              </select>
            </div>
          </div>

          {/* Save & Cancel Buttons */}
          <div className="flex gap-4 justify-end">
            <CustomButton onClick={handleLabTestSubmit}> Save</CustomButton>
            <CustomButton
              onClick={() => {
                setShowLabForm(false);
                setSelectedLab('');
                setLabStatus('');
              }}
              className="opacity-60 hover:opacity-100 transition duration-200"
            >
              Cancel
            </CustomButton>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};
export default MedicalPrescription;
