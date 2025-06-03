import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/request';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidAadhaar,
  isValidPAN,
  isNotEmpty,
  isValidDob,
} from '../pages/Utils/validators';
import { inputFieldClass } from '../components/FormStyles';

interface SkillEntry {
  skill: string;
  years: string;
  months: string;
  description: string;
}

interface SkillError {
  skill?: string;
  years?: string;
  months?: string;
  description?: string;
}

interface Experience {
  type: string;
  specialization: string;
  hospitalName: string;
  joinDate: string;
  leaveDate: string;
  experience: string;
}

const initialState = {
  tenant: '',
  hospital: '',
  doctorName: '',
  doctorEmail: '',
  doctorPhoneNumber: '',
  aadhaarNumber: '',
  panNumber: '',
  qualification: '',
  specialization: '',
  doctorDateOfBirth: '',
  gender: '',
};

const initialEducationEntry = {
  degree: '',
  UG: '',
  specialization: '',
  location: '',
  university: '',
  startDate: '',
  endDate: '',
  highestEducation: false,
};

interface State {
  id: number;
  stateName: string;
  stateCode: string;
}

interface District {
  id: number;
  pinCode: string;
  districtName: string;
  stateCode: string;
}

interface City {
  id: number;
  cityName: string;
}

interface Address {
  addressID?: string | null;
  id?: string | null;
  addressType?: string;
  address1?: string;
  address2?: string;
  city?: string;
  district?: string;
  state?: string;
  zipCode?: string;
  type?: string; // Optional or required, based on your use case
}

const DoctorForm: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<any>({});
  const [tenants, setTenants] = useState<string[]>([]);

  const [qualificationsList, setQualificationsList] = useState<
    { id: number; name: string }[]
  >([]);

  const [dateFieldFocus, setDateFieldFocus] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentURL, setDocumentURL] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [doctorID, setDoctorID] = useState([]);
  const [documentTypes, setDocumentTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadBoxes, setUploadBoxes] = useState([{ id: Date.now() }]);
  const [addressTypes, setAddressTypes] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [degreeNames, setDegreeNames] = useState([]); // const [specializations, setSpecializations] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [specializationsList, setSpecializationsList] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<WorkType[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const userID = localStorage.getItem('userID'); // or sessionStorage or from context
  const newId = uuidv4();
  const [startDate, setStartDate] = useState([]);
  const [endDate, setEndDate] = useState([]);
  const [employmentType, setEmploymentType] = useState([]);
  const [hospital, setHospital] = useState([]);
  const [selectedPartTime, setSelectedPartTime] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [showCityInput, setShowCityInput] = useState(false);
  const [steps, setSteps] = useState<{ label: string }[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [skill, setSkill] = useState([]); // This is your skills data
  const [existingTimeSlots, setExistingTimeSlots] = useState([]); // Existing slots (editable, not submitted)
  const [newTimeSlots, setNewTimeSlots] = useState([
    { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
  ]); // New slots (only these are submitted)
  const [existingEducation, setExistingEducation] = useState([]);

  // this persists between renders

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [manualCity, setManualCity] = useState('');
  const [awards, setAwards] = useState([
    { name: '', year: '', description: '', errors: {} },
  ]);
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  //  const [isAddDisabled, setIsAddDisabled] = useState(false);
  // const [skillErrors, setSkillErrors] = useState([]);

  // const [errors, setErrors] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0]; // today's date in yyyy-mm-dd
  const [educationErrors, setEducationErrors] = useState([{}]);
  const [educationList, setEducationList] = useState([initialEducationEntry]);
  const [experienceList, setExperienceList] = useState<
    { id: number; name: string }[]
  >([]);
  const [qualifications, setQualifications] = useState<
    { id: number; name: string }[]
  >([]);
  const [specializations, setSpecializations] = useState<
    { id: number; name: string }[]
  >([]);
  const [genders, setGenders] = useState<{ id: number; name: string }[]>([]);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressType: '',
      address1: '',
      address2: '',
      state: '',
      district: '',
      zipCode: '',
      city: '',
      type: 'patient',
    },
  ]);

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        addressType: '',
        address1: '',
        address2: '',
        state: '',
        district: '',
        zipCode: '',
        city: '',
        isPrimary: prev.length === 0, // first one as primary
      },
    ]);
  };

  // Remove an address row
  const removeAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  const [formErrors, setFormErrors] = useState<{
    district: any;
    pincode: any;
    city: any;
    state: any;
    patientName: string;
    patientEmail: string;
    patientPhoneNumber: string;
    patientDateOfBirth: string;
    patientGender: string;
  }>({
    patientName: '',
    patientEmail: '',
    patientPhoneNumber: '',
    patientDateOfBirth: '',
    patientGender: '',
    state: '',
    district: '',
    pincode: '',
    city: '',
  });

  const currentYear = new Date().getFullYear();
  const [weekdays, setWeekdays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
  ]);

  useEffect(() => {
    fetchHospitals();
    fetchWeekdays();
    fetchDoctorTimeSlots();
  }, []);

  const fetchHospitals = async () => {
    try {
      const unitID = sessionStorage.getItem('unitID');
      const response = await api.get('/Hospital/List'); // ✅ Axios handles base URL and response parsing

      const result = response.data;

      if (result && Array.isArray(result)) {
        const filteredHospitals = result
          .filter((hospital: any) => hospital.isActive)
          .map((hospital: any) => ({
            id: hospital.hospitalID,
            name: hospital.hospitalName,
          }));

        setHospitals(filteredHospitals);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchWeekdays = async () => {
    try {
      const response = await api.get('/AppLOV?type=Weekday'); // ✅ Only relative path
      const result = response.data;

      if (result.success && Array.isArray(result.data)) {
        setWeekdays(result.data);
      }
    } catch (error) {
      console.error('Error fetching weekdays:', error);
    }
  };

  const handleTimeChange = (slots, setSlots, index, field, value) => {
    const updatedSlots = [...slots];
    updatedSlots[index][field] = value;
    setSlots(updatedSlots);
  };

  const addNewRow = () => {
    setNewTimeSlots([
      ...newTimeSlots,
      { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
    ]);
  };

  useEffect(() => {
    fetchDoctorTimeSlots();
  }, []);

  const fetchDoctorTimeSlots = async () => {
    try {
      const doctorID = sessionStorage.getItem('doctorID');
      if (!doctorID) return;

      const response = await api.get(
        `/Doctor/GetDoctorTimeSlot?doctorID=${doctorID}`,
      );
      console.log('🔍 Fetching slots for doctorID:', doctorID);
      if (response.data?.success) {
        const formattedSlots = response.data.data.map((slot) => ({
          ...slot,
          fromTime: new Date(`1970-01-01T${slot.fromTime}`),
          toTime: new Date(`1970-01-01T${slot.toTime}`),
          hospital: slot.hospitalID, // align with your `newTimeSlots` format
          day: slot.dayofWeek,
        }));
        setExistingTimeSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching doctor time slots', error);
    }
  };

  const validateTimeSlots = (slots) => {
    let hasError = false;

    const errors = slots.map((slot) => {
      const slotErrors = {};

      if (!slot.day) {
        slotErrors.day = 'Day is required';
        hasError = true;
      }

      if (!slot.hospital) {
        slotErrors.hospital = 'Hospital is required';
        hasError = true;
      }

      // Validate duration
      if (!slot.duration) {
        slotErrors.duration = 'Duration is required';
        hasError = true;
      } else if (!/^\d{1,2}$/.test(slot.duration)) {
        slotErrors.duration = 'Duration must be a number (1-2 digits only)';
        hasError = true;
      } else if (!['1', '15', '30', '45'].includes(slot.duration)) {
        slotErrors.duration = 'Duration must be 1, 15, 30, or 45';
        hasError = true;
      }

      if (!slot.fromTime) {
        slotErrors.fromTime = 'From Time is required';
        hasError = true;
      }

      if (!slot.toTime) {
        slotErrors.toTime = 'To Time is required';
        hasError = true;
      }

      return slotErrors;
    });

    return { isValid: !hasError, errors };
  };

  const handleTimeSubmit = async (e) => {
    e.preventDefault();

    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');

    if (!userID || !doctorID) {
      alert('🚨 User or Doctor not logged in. Please log in again.');
      return;
    }

    const { isValid, errors: validationErrors } =
      validateTimeSlots(newTimeSlots);
    if (!isValid) {
      setErrors(validationErrors);
      alert('⚠️ Please fill all the required data before saving.');
      return;
    }

    // Filter out duplicate time slots
    const isDuplicate = (slot) => {
      const fromTimeStr =
        slot.fromTime?.toLocaleTimeString('en-US', { hour12: false }) ?? '';
      const toTimeStr =
        slot.toTime?.toLocaleTimeString('en-US', { hour12: false }) ?? '';

      return existingTimeSlots.some((existingSlot) => {
        const existingFrom =
          existingSlot.fromTime?.toLocaleTimeString('en-US', {
            hour12: false,
          }) ?? '';
        const existingTo =
          existingSlot.toTime?.toLocaleTimeString('en-US', { hour12: false }) ??
          '';

        return (
          existingSlot.day === slot.day &&
          existingSlot.hospital === slot.hospital &&
          existingFrom === fromTimeStr &&
          existingTo === toTimeStr
        );
      });
    };

    const uniqueNewSlots = newTimeSlots.filter((slot) => !isDuplicate(slot));

    if (uniqueNewSlots.length !== newTimeSlots.length) {
      alert(
        '🚫 Duplicate time slot(s) detected. Please avoid adding the same day, time, and hospital twice.',
      );
      return;
    }

    const timestamp = new Date().toISOString();

    const payload = uniqueNewSlots.map((slot) => ({
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID,
      updatedOn: timestamp,
      doctorID: doctorID,
      hospitalID: slot.hospital,
      dayofWeek: slot.day,
      fromTime:
        slot.fromTime?.toLocaleTimeString('en-US', { hour12: false }) ??
        '00:00:00',
      toTime:
        slot.toTime?.toLocaleTimeString('en-US', { hour12: false }) ??
        '00:00:00',
      slotDuration: slot.duration?.toString() ?? '0',
      isActive: true,
    }));

    try {
      const response = await api.post('/Doctor/SaveDoctorTimeSlot', payload); // ✅ uses full URL from request.js

      if (response.status === 200) {
        toast.success('Unique new time slots saved successfully!');
        setNewTimeSlots([
          { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
        ]);
        fetchDoctorTimeSlots(); // Refresh the list
      } else {
        toast.error('❌ Failed to save time slots.');
        console.error('❌ Server responded with error:', response.data);
      }
    } catch (error) {
      toast.error('🚨 Network error while submitting time slots.');
      console.error('🚨 Error submitting time slots:', error);
    }
  };

  const renderTimeSlotRow = (slot, index, slots, setSlots, editable = true) => (
    <div
      key={index}
      className="flex gap-4 items-center mt-2 rounded-lg border border-stroke bg-transparent 
        p-4 text-black outline-none focus:border-primary
               dark:border-form-strokedark dark:bg-form-input
                dark:text-white dark:focus:border-primary"
    >
      {/* Day */}
      <div className="flex flex-col w-[160px]">
        <select
          value={slot.day}
          disabled={!editable}
          onChange={(e) =>
            handleTimeChange(slots, setSlots, index, 'day', e.target.value)
          }
          className="w-full rounded-lg border border-stroke bg-transparent 
               py-3 px-4 text-black outline-none focus:border-primary
               dark:border-form-strokedark dark:bg-form-input
               dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Day</option>
          {weekdays.map((day) => (
            <option key={day.id} value={day.name}>
              {day.name}
            </option>
          ))}
        </select>

        {errors[index]?.day && (
          <div className="text-red-500 text-sm mt-1">{errors[index].day}</div>
        )}
      </div>

      {/* Hospital */}

      <div className="flex flex-col w-[160px]">
        <select
          value={slot.hospital}
          disabled={!editable}
          onChange={(e) =>
            handleTimeChange(slots, setSlots, index, 'hospital', e.target.value)
          }
          className="w-full rounded-lg border border-stroke bg-transparent 
               py-3 px-4 text-black outline-none focus:border-primary
               dark:border-form-strokedark dark:bg-form-input
               dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Hospital</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>

        {errors[index]?.hospital && (
          <div className="text-red-500 text-sm mt-1">
            {errors[index].hospital}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="w-[20%] flex flex-col">
        <input
          type="text"
          placeholder="Duration (mins)"
          value={slot.duration}
          disabled={!editable}
          onChange={(e) =>
            handleTimeChange(slots, setSlots, index, 'duration', e.target.value)
          }
          onKeyDown={(e) => {
            const allowed = [
              '1',
              '5',
              '3',
              '4',
              '0',
              'Backspace',
              'Delete',
              'ArrowLeft',
              'ArrowRight',
            ];
            if (!allowed.includes(e.key)) e.preventDefault();
          }}
          onPaste={(e) => e.preventDefault()}
          className="rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary
                      dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        {errors[index]?.duration && (
          <div className="text-red-500 text-sm mt-1">
            {errors[index].duration}
          </div>
        )}
      </div>

      {/* From Time */}
      <div className="w-[20%] flex flex-col">
        <DatePicker
          selected={slot.fromTime}
          onChange={(time) =>
            handleTimeChange(slots, setSlots, index, 'fromTime', time)
          }
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          dateFormat="h:mm aa"
          placeholderText="From Time"
          className={inputFieldClass}
          disabled={!editable}
        />
        {errors[index]?.fromTime && (
          <div className="text-red-500 text-sm mt-1">
            {errors[index].fromTime}
          </div>
        )}
      </div>

      {/* To Time */}
      <div className="w-[20%] flex flex-col">
        <DatePicker
          selected={slot.toTime}
          onChange={(time) =>
            handleTimeChange(slots, setSlots, index, 'toTime', time)
          }
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          dateFormat="h:mm aa"
          placeholderText="To Time"
          className={inputFieldClass}
          disabled={!editable}
        />
        {errors[index]?.toTime && (
          <div className="text-red-500 text-sm mt-1">
            {errors[index].toTime}
          </div>
        )}
      </div>
    </div>
  );

  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const fetchDocumentTypes = async () => {
    try {
      const response = await api.get('AppLOV?type=documentType'); // ✅ correct
      if (response.data && Array.isArray(response.data.data)) {
        const active = response.data.data.filter((item) => item.isActive);
        setDocumentTypes(active);
        console.log('Fetched Document Types:', active);
      } else {
        console.error('Invalid data format:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);
  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  // Fetch Uploaded Documents
  const fetchUploadedDocuments = async () => {
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');

    if (!userID || !doctorID) {
      console.warn('User ID or Doctor ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await api.get(
        `/Doctor/GetDocuments?doctorID=${doctorID}&userID=${userID}`,
      );

      setUploadedDocuments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch uploaded documents:', error);
    }
  };

  // const handleFileChange = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
    }
  };
  const handleDocumentTypeChange = (event) => {
    setSelectedDocumentType(event.target.value);
  };

  const normalizeFileName = (name) => {
    const parts = name.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : name;
  };

  const normalizeDocumentType = (type) => {
    return type.toLowerCase().replace(/[^a-z]/gi, ''); // removes spaces, dots etc.
  };

  // Upload Document (POST API)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !selectedType) {
      alert('Please select a file and document type.');
      return;
    }

    const isDuplicate = uploadedDocuments.some(
      (doc) =>
        normalizeDocumentType(doc.documentType) ===
        normalizeDocumentType(selectedType),
    );

    if (isDuplicate) {
      alert('🚫 This document has already been uploaded.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');

    if (!userID || !doctorID) {
      alert('User or Doctor ID missing. Please log in again.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (!base64String) {
        console.error('Failed to convert file to Base64');
        alert('Failed to read file. Please try again.');
        return;
      }

      const fileExtension = selectedFile.name.split('.').pop() || '';
      const filePath = `uploads/${selectedFile.name}`;

      const payload = {
        id: doctorID,
        createdBy: userID,
        isActive: true,
        type: 'doctor',
        documentType: selectedType,
        fileName: selectedFile.name,
        fileLocation: filePath,
        fileBase64: base64String,
        fileExtension: fileExtension,
      };

      try {
        const response = await api.post(`/Doctor/SaveDocuments`, payload);

        console.log('Upload successful:', response.data);

        setSelectedFile(null);
        setPreviewSrc(null);
        setSelectedType('');

        await fetchUploadedDocuments();

        toast.success('Document uploaded successfully!');
      } catch (error: any) {
        console.error('Upload failed:', error);
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    };
  };

  // View Document in Modal
  const handleViewDocument = async (documentID: string, fileName: string) => {
    try {
      const response = await axios.get(`/Doctor/Documents/${documentID}`);

      if (!response.data?.data?.fileBase64) {
        alert('Invalid file data received.');
        return;
      }

      const fileBase64 = response.data.data.fileBase64;
      const isImageFile = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
      setIsImage(isImageFile);

      const byteCharacters = atob(fileBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
      const fileType = isImageFile ? `image/${extension}` : 'application/pdf';

      const blob = new Blob([byteArray], { type: fileType });
      const url = URL.createObjectURL(blob);

      setDocumentURL(url);
      setModalOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error loading document.');
    }
  };
  // Extract Only Filename (Ignore ID)
  const getFormattedFileName = (fileName) => {
    return fileName.split('_').pop();
  };

  // const [awards, setAwards] = useState([
  //   { name: '', year: '', description: '', errors: {} },
  // ]);

  const handleAwardChange = (index, field, value) => {
    const updatedAwards = [...awards];

    if (field === 'year') {
      const numericYear = value.replace(/\D/g, '').slice(0, 4);
      const currentYear = new Date().getFullYear();

      if (numericYear.length === 4 && parseInt(numericYear) > currentYear) {
        return;
      }

      updatedAwards[index][field] = numericYear;
    } else if (field === 'description') {
      // Regex to allow only letters, numbers, spaces, comma, period, apostrophe, quotes, hyphen
      const validDescriptionPattern = /^[a-zA-Z0-9\s,.'"-]*$/;

      if (!validDescriptionPattern.test(value)) {
        // Show error or ignore input
        // alert('Description cannot contain emojis or special characters except , . \' " -');
        return;
      }
      updatedAwards[index][field] = value;
    } else {
      updatedAwards[index][field] = value;
    }

    setAwards(updatedAwards);
  };

  const handleAddAward = () => {
    setAwards([...awards, { name: '', year: '', description: '', errors: {} }]);
  };

  const validateAwards = () => {
    let valid = true;
    const updatedAwards = [...awards];
    const descriptionPattern = /^[a-zA-Z0-9\s,.'"-]*$/;

    updatedAwards.forEach((award, index) => {
      const errors = {};

      // Award name validation
      if (!award.name) {
        errors.name = 'Award name is required.';
        valid = false;
      } else if (award.name.trim().length < 3) {
        errors.name = 'Award name must be at least 3 characters.';
        valid = false;
      }

      // Award year validation
      if (!award.year || isNaN(Number(award.year))) {
        errors.year = 'Valid award year is required.';
        valid = false;
      }

      // Description validation
      if (!award.description) {
        errors.description = 'Description is required.';
        valid = false;
      } else if (award.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters.';
        valid = false;
      } else if (!descriptionPattern.test(award.description)) {
        errors.description = 'Description contains invalid characters.';
        valid = false;
      }

      updatedAwards[index].errors = errors;
    });

    setAwards(updatedAwards);
    return valid;
  };

  const removeEmojis = (str) => {
    return str.replace(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
      '',
    );
  };

  const handleInput = (e) => {
    const cleaned = removeEmojis(e.target.value);
    if (e.target.value !== cleaned) {
      e.target.value = cleaned;
    }
  };

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      alert('Missing doctorID or userID in session.');
      return;
    }

    if (!validateAwards()) {
      return;
    }

    const payload = awards.map((award) => ({
      awardID: uuidv4(),
      doctorID,
      awardName: award.name,
      awardYear: Number(award.year),
      description: award.description,
      createdBy: userID,
      createdOn: new Date().toISOString(),
      updatedBy: userID,
      updatedOn: new Date().toISOString(),
      isActive: true,
    }));

    try {
      const response = await api.post('/Doctor/SaveDoctorAward', payload, {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log('Success:', response.data);
        toast.success('Award successfully submitted!');
      } else {
        console.error('Server error:', response.status, response.data);
        toast.error('Failed to submit award.');
      }
    } catch (error) {
      console.error('Request failed:', error);
      toast.error('Request failed. Please try again.');
    }
  };

  const [skills, setSkills] = useState([
    { skill: '', years: '', months: '', description: '', errors: {} },
  ]);

  const handleSkill = (
    index: number,
    field: 'skill' | 'years' | 'months' | 'description',
    value: string,
  ) => {
    const updatedSkills = [...skills];

    // For 'years' or 'months', restrict to 2 digits only
    if ((field === 'years' || field === 'months') && !/^\d{0,2}$/.test(value)) {
      return;
    }

    // For 'months', only allow values from 1 to 11
    if (field === 'months') {
      if (value === '' || (Number(value) >= 1 && Number(value) <= 11)) {
        updatedSkills[index][field] = value;
      } else {
        return; // Don't update for invalid values like 0 or 12+
      }
    } else {
      updatedSkills[index][field] = value;
    }

    setSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    if (skills.length >= 5) {
      alert('You can only add up to 5 skills');
      return;
    }
    setSkills([
      ...skills,
      { skill: '', years: '', months: '', description: '', errors: {} },
    ]);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    const isDigit = /^[0-9]$/.test(e.key);
    if (!isDigit && !allowedKeys.includes(e.key)) {
      e.preventDefault(); // Block letters, symbols, emoji, space
    }
  };

  const validateSkills = () => {
    let valid = true;
    const updatedSkills = [...skills];
    const specialCharRegex = /^[a-zA-Z0-9\s.,'-]*$/;
    updatedSkills.forEach((skill, index) => {
      const errors = {};

      if (!skill.skill) {
        errors.skill = 'Skill is required.';
        valid = false;
      }

      if (!skill.years || isNaN(Number(skill.years))) {
        errors.years = 'years of experience are required.';
        valid = false;
      }

      if (
        !skill.months ||
        isNaN(Number(skill.months)) ||
        Number(skill.months) < 1 ||
        Number(skill.months) > 12
      ) {
        errors.months = 'months of experience are required.';
        valid = false;
      }

      // Description validation: no emojis or special characters allowed
      if (!skill.description || !specialCharRegex.test(skill.description)) {
        errors.description = 'Description is required';
        valid = false;
      }

      updatedSkills[index].errors = errors;
    });

    setSkills(updatedSkills);
    return valid;
  };

  function validateGUID(guid) {
    const regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
  }

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      alert('Missing doctorID or userID in session.');
      return;
    }

    if (validateSkills()) {
      const payload = skills.map((entry) => ({
        doctorID,
        createdBy: userID,
        createdOn: new Date().toISOString(),
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: true,
        skillMasterID: entry.skill, // skill ID
        skillID: entry.skill, // (If this should be skill name, update accordingly)
        yearOfExperience: Number(entry.years),
        monthOfExperience: Number(entry.months),
        description: entry.description || '',
      }));

      console.log('Payload:', JSON.stringify(payload, null, 2));

      try {
        const response = await api.post('/Doctor/SaveDoctorSkill', payload, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200 || response.status === 201) {
          console.log('Success:', response.data);
          toast.success('Successfully submitted Doctor Skills!');
        } else {
          console.error('Server responded with status:', response.status);
          toast.error('Failed to submit Doctor Skills.');
        }
      } catch (error) {
        console.error('Request failed:', error);
        toast.error('An error occurred during submission.');
      }
    } else {
      toast.info('Please correct the validation errors before submitting.');
    }
  };

  // const [experiences, setExperiences] = useState([
  //   {
  //     type: '',
  //     specialization: '',
  //     hospitalName: '',
  //     joinDate: '',
  //     leaveDate: '',
  //     errors: {},
  //   },
  // ]);

  const handleExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  // const handleAddExperiences = () => {
  //   setExperiences([
  //     ...experiences,
  //     {
  //       type: '',
  //       specialization: '',
  //       hospitalName: '',
  //       joinDate: '',
  //       leaveDate: '',
  //       errors: {},
  //     },
  //   ]);
  // };

  const validateExperience = (): boolean => {
    const today = new Date();
    const newErrors = experiences.map((exp) => {
      const error: any = {};

      // Type check
      if (!exp.type.trim()) {
        error.type = 'Type is required';
      }

      // Specialization check
      if (!exp.specialization.trim()) {
        error.specialization = 'Specialization is required';
      }

      // Hospital name check
      if (!exp.hospitalName.trim()) {
        error.hospitalName = 'Hospital name is required';
      }

      // Join date check
      if (!exp.joinDate) {
        error.joinDate = 'Join date is required';
      } else {
        const join = new Date(exp.joinDate);
        if (join > today) {
          error.joinDate = 'Join date cannot be in the future';
        }
      }

      // Leave date check
      if (!exp.leaveDate) {
        error.leaveDate = 'Leave date is required';
      } else {
        const join = new Date(exp.joinDate);
        const leave = new Date(exp.leaveDate);
        if (leave < join) {
          error.leaveDate = 'Leave date must be after join date';
        } else if (leave > today) {
          error.leaveDate = 'Leave date cannot be in the future';
        }
      }

      return error;
    });

    if (experiences.length === 0) {
      alert('Please add at least one experience.');
      return false;
    }

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/AppLOV', {
          params: { type: 'Specializations' },
        });
        const activeSkills = res.data.data.filter((item: any) => item.isActive);

        const formattedSkills = activeSkills.map((item: any) => ({
          id: item.appLOVID, // MUST be GUID
          name: item.name,
        }));

        console.log(formattedSkills); // Log the skills list here to check
        setSkillsList(formattedSkills);
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchEmploymentTypes = async () => {
      try {
        const response = await api.get('/AppLOV', {
          params: { type: 'Worktype' },
        });
        console.log('📌 Employment Type API Response:', response.data);

        if (response.data?.data) {
          setEmploymentTypes(response.data.data);
        } else {
          console.warn('⚠️ Employment Types response missing data key');
        }
      } catch (err) {
        console.error('❌ Error fetching Employment Types:', err);
      }
    };

    fetchEmploymentTypes();
  }, []);

  const isDuplicateExperience = (exp: any, list: any[]) => {
    return list.some(
      (existing) =>
        existing.type === exp.type &&
        existing.specialization === exp.specialization &&
        existing.hospitalName.trim().toLowerCase() ===
          exp.hospitalName.trim().toLowerCase() &&
        existing.joinDate === exp.joinDate &&
        existing.leaveDate === exp.leaveDate,
    );
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      if (toastShown !== 'error') {
        toast.dismiss();
        toast.error('Missing doctorID or userID in session.');
        setToastShown('error');
      }
      return;
    }

    // Prevent re-submit if already submitted and no new changes (+Add resets these states)
    if (submittedOnce && toastShown === 'success') return;

    if (!validateExperience()) {
      if (toastShown !== 'error') {
        toast.dismiss();
        toast.error('❌ Please fill all fields correctly.');
        setToastShown('error');
      }
      return;
    }

    const seen: Experience[] = [];
    const hasDuplicate = experiences.some((exp) => {
      if (isDuplicateExperience(exp, seen)) {
        return true;
      }
      seen.push(exp);
      return false;
    });

    if (hasDuplicate) {
      if (toastShown !== 'duplicate') {
        toast.dismiss();
        toast.error('❌ Duplicate experience entries found.');
        setToastShown('duplicate');
      }
      return;
    }

    const payload = experiences.map((exp) => ({
      doctorID,
      employmentType: exp.type,
      specializationID: exp.specialization,
      hospitalName: exp.hospitalName,
      joinDate: exp.joinDate,
      leaveDate: exp.leaveDate,
      exprienceID: exp.experience,
      createdBy: userID,
      createdOn: new Date().toISOString(),
      updatedBy: userID,
      updatedOn: new Date().toISOString(),
      isActive: true,
    }));

    try {
      const response = await api.post('/Doctor/SaveDoctorExprience', payload);

      if (response.status === 200 || response.status === 201) {
        if (toastShown !== 'success') {
          toast.success('Experience details submitted successfully!');
          setToastShown('success');
        }
        setSubmittedOnce(true);
      } else {
        if (toastShown !== 'error') {
          toast.error('Unexpected server response.');
          setToastShown('error');
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      if (toastShown !== 'error') {
        toast.error('An error occurred during experience submission.');
        setToastShown('error');
      }
    }
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);

    const updatedErrors = [...errors];
    if (updatedErrors[index]) {
      updatedErrors[index][field] = undefined;
    }
    setErrors(updatedErrors);

    setToastShown(null);
    setSubmittedOnce(false);
  };

  const emptyExperience: Experience = {
    type: '',
    specialization: '',
    hospitalName: '',
    joinDate: '',
    leaveDate: '',
    experience: '',
  };

  const [experiences, setExperiences] = React.useState<Experience[]>([]);

  const handleAddExperience = () => {
    setExperiences([...experiences, emptyExperience]);
    setErrors([...errors, {}]);
    setToastShown(null);
    setSubmittedOnce(false);
  };

  const [languages, setLanguages] = useState([
    { language: '', read: false, write: false, speak: false, errors: {} },
  ]);

  const handle = (index: number, field: string, value: any) => {
    setLanguages((prevLanguages) => {
      const updatedLanguages = [...prevLanguages];

      if (!updatedLanguages[index]) return prevLanguages;

      // Ensure language is always a string
      if (field === 'language' && typeof value === 'object') {
        value = value.name || '';
      }

      updatedLanguages[index] = {
        ...updatedLanguages[index],
        [field]: value,
      };

      return updatedLanguages;
    });
  };

  const mapFetchedLanguages = (data) => {
    return data.map((item) => {
      console.log('Language item:', item);

      return {
        language:
          typeof item.name === 'string' ? item.name : item.name?.name || '', // FIX
        read: item.read,
        write: item.write,
        speak: item.speak,
        errors: {},
      };
    });
  };

  // const handleAddLanguage = () => {
  //   setLanguages([
  //     ...languages,
  //     { language: '', read: false, write: false, speak: false, errors: {} },
  //   ]);
  // };

  const validateLanguages = () => {
    let isValid = true;
    const updatedLanguages = languages.map((entry) => {
      const errors = {};

      if (!entry.language) {
        errors.language = 'Language is required';
        isValid = false;
      }

      if (!entry.read && !entry.write && !entry.speak) {
        errors.skill = 'Select at least one (Read, Write or Speak)';
        isValid = false;
      }

      return { ...entry, errors };
    });

    setLanguages(updatedLanguages);
    return isValid;
  };

  useEffect(() => {
    api
      .get('/AppLOV?Type=LanguageMaster')
      .then((res) => {
        console.log('Language options:', res.data);

        if (res.data && res.data.data) {
          setLanguageOptions(res.data.data);
        } else {
          console.error('Unexpected response structure:', res.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching language options:', error);
        alert('Error fetching language options');
      });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      toast.dismiss();
      toast.error('Missing doctorID or userID in session.');
      setToastShown('error');
      return;
    }

    if (!validateLanguages()) {
      if (toastShown !== 'error') {
        toast.dismiss();
        toast.error('Please fix language validation errors.');
        setToastShown('error');
      }
      return;
    }

    const validLanguages = languages.filter(
      (entry) => entry.language.trim() !== '',
    );

    if (validLanguages.length === 0) {
      if (toastShown !== 'empty') {
        toast.dismiss();
        toast.warning('Please enter at least one language before submitting.');
        setToastShown('empty');
      }
      return;
    }

    const seen = new Set();
    const hasDuplicates = validLanguages.some((entry) => {
      const key = entry.language.trim().toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });

    if (hasDuplicates) {
      if (toastShown !== 'duplicate') {
        toast.dismiss();
        toast.error('Duplicate languages found. Please remove duplicates.');
        setToastShown('duplicate');
      }
      return;
    }

    try {
      const payload = validLanguages.map((entry) => {
        const langID =
          languageOptions.find((lang) => lang.name === entry.language)
            ?.appLOVID || '';

        if (!langID) {
          throw new Error(`Invalid language selected: ${entry.language}`);
        }

        return {
          id: doctorID,
          createdBy: userID,
          createdOn: new Date().toISOString(),
          updatedBy: userID,
          updatedOn: new Date().toISOString(),
          isActive: true,
          languageMasterID: langID,
          read: entry.read,
          write: entry.write,
          speak: entry.speak,
          type: 'Doctor',
        };
      });

      // Optional: Check if payload is same as lastSavedLanguages
      // if (JSON.stringify(payload) === JSON.stringify(lastSavedLanguages)) {
      //   toast.info('No changes to save.');
      //   return;
      // }

      const response = await api.post('/Doctor/SaveLanguage', payload);

      if (response.status >= 200 && response.status < 300) {
        if (toastShown !== 'success') {
          toast.dismiss();
          toast.success('Language details saved successfully!');
          setToastShown('success');
        }
        // Optionally set last saved payload here
        // setLastSavedLanguages(payload);
      } else {
        if (toastShown !== 'error') {
          toast.dismiss();
          toast.error(`${response.data?.message || 'Something went wrong'}`);
          setToastShown('error');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (toastShown !== 'error') {
        toast.dismiss();
        toast.error('An error occurred during submission.');
        setToastShown('error');
      }
    }
  };

  const emptyLanguageTemplate = {
    language: '',
    read: false,
    write: false,
    speak: false,
  };

  const handleAddLanguage = () => {
    setLanguages([...languages, emptyLanguageTemplate]);
    setToastShown(''); // reset toast so new messages can be shown
  };

  const handleLanguageChange = (index: number, key: string, value: any) => {
    const updated = [...languages];
    updated[index][key] = value;
    setLanguages(updated);
    setToastShown(null); // Reset toast state to allow showing again
  };

  const isAddDisabled =
    educationList.filter((e) => e.highestEducation).length >= 1;

  // const isValidText = (text) => /^[A-Za-z\s]+$/.test(text);
  const isValidText = (value) => {
    return (
      typeof value === 'string' && /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value.trim())
    );
  };

  const handleKeyDown = (e) => {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
      ' ',
      '.',
    ];

    // Allow only English letters, space, and dot
    if (!allowedKeys.includes(e.key) && !/^[a-zA-Z.\s]$/.test(e.key)) {
      e.preventDefault();
    }

    // Additionally block emoji characters (multi-byte)
    if (e.key.length > 1 && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(pastedText)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    console.log('Education list:', educationList);
  }, [educationList]);

  const degreeRegex =
    /^(Bachelor of (Science|Engineering|Commerce|Medicine|Dental Surgery)|Master of (Science|Technology|Commerce|Computer Applications|Philosophy|Surgery)|MBBS|MDS|BDS|BAMS|BHMS|BUMS|BNYS|PhD|B\.?(Sc|E|Com)|M\.?(Sc|Tech|Com|CA|Phil))$/i;

  const validateEntry = (entry) => {
    const errors = {};

    if (!entry.degree || !entry.degree.trim()) {
      errors.degree = 'Degree is required';
    } else if (!degreeRegex.test(entry.degree.trim())) {
      errors.degree = 'Enter a valid degree name';
    }

    if (!entry.location || !isValidText(entry.location)) {
      errors.location = 'Location is required';
    }

    if (!entry.specialization) {
      errors.specialization = 'Specialization is required';
    }

    if (!entry.UG) {
      errors.qualification = 'Qualification is required';
    }

    if (!entry.university || !entry.university.trim()) {
      errors.university = 'University is required';
    } else if (!/^[a-zA-Z .,&'-]{3,100}$/.test(entry.university.trim())) {
      errors.university = 'Enter a valid university name';
    }

    const startDate = entry.startDate ? new Date(entry.startDate) : null;
    const endDate = entry.endDate ? new Date(entry.endDate) : null;
    const today = new Date();

    if (!startDate) {
      errors.startDate = 'Start date is required';
    } else if (startDate > today) {
      errors.startDate = 'Start date cannot be in the future';
    }

    if (!endDate) {
      errors.endDate = 'End date is required';
    } else if (!startDate) {
      errors.endDate = 'Please enter start date first';
    } else if (endDate.getFullYear() - startDate.getFullYear() < 4) {
      errors.endDate = 'End date must be at least 4 years after the start date';
    } else {
      // ✅ Clear the error when the date is valid
      errors.endDate = '';
    }

    return errors;
  };

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedList = [...educationList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    setEducationList(updatedList); // Assuming you use this to update the state
  };

  const handleAddEntry = () => {
    setEducationList([...educationList, { ...initialEducationEntry }]);
    setEducationErrors([...educationErrors, {}]);
  };

  const getEmptyEducationBlock = () => ({
    degree: '',
    qualification: '',
    specialization: '',
    location: '',
    university: '',
    startDate: '',
    endDate: '',
    isHighest: false,
  });

  useEffect(() => {
    api
      .get('/Doctor/GetDoctorEducation')
      .then((res) => {
        const data = res.data.data;
        if (Array.isArray(data) && data.length > 0) {
          setDegreeNames(data);
        } else {
          setDegreeNames([getEmptyEducationBlock()]);
        }
      })
      .catch((error) => {
        console.error('Error fetching doctor education data:', error);
        setDegreeNames([getEmptyEducationBlock()]);
      });
  }, []);

  useEffect(() => {
    if (educationList.length === 0) {
      setEducationList([
        {
          degree: '',
          UG: '',
          specialization: '',
          location: '',
          university: '',
          startDate: '',
          endDate: '',
          highestEducation: false,
        },
      ]);
      setEducationErrors([{}]); // empty error for that row
    }
  }, []);

  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [toastShown, setToastShown] = useState<
    'error' | 'duplicate' | 'success' | null
  >(null);

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      toast.error('Missing doctorID or userID in session.');
      return;
    }

    // Prevent re-submit if already submitted and no changes
    if (submittedOnce && toastShown === 'success') return;

    const allErrors = educationList.map((entry) => validateEntry(entry));
    const hasErrors = allErrors.some((err) =>
      Object.values(err).some((msg) => msg),
    );

    if (hasErrors) {
      setEducationErrors(allErrors);
      if (toastShown !== 'error') {
        toast.dismiss();
        toast.error('❌ Please fix validation errors.');
        setToastShown('error');
      }
      return;
    }

    // Duplicate check
    const seen = new Set();
    const hasDuplicates = educationList.some((entry) => {
      const key = `${entry.UG}-${entry.degree}-${entry.specialization}-${entry.university}-${entry.location}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });

    if (hasDuplicates) {
      if (toastShown !== 'duplicate') {
        toast.dismiss();
        toast.error('❌ Duplicate education entries found.');
        setToastShown('duplicate');
      }
      return;
    }

    const payload = educationList.map((entry) => ({
      doctorID,
      graduateID: entry.UG,
      degreeName: entry.degree,
      specializationID: entry.specialization,
      location: entry.location,
      universityName: entry.university,
      startDate: new Date(entry.startDate).toISOString(),
      endDate: new Date(entry.endDate).toISOString(),
      isHighestEducation: entry.highestEducation,
      createdBy: userID,
      isActive: true,
    }));

    try {
      const res = await api.post('/Doctor/SaveDoctorEducation', payload);
      if (res.status === 200 || res.status === 201) {
        if (toastShown !== 'success') {
          toast.success('Education details submitted successfully!');
          setToastShown('success');
        }
        setEducationErrors([]);
        setSubmittedOnce(true);
        setUnsavedChanges(false);
      } else {
        if (toastShown !== 'error') {
          toast.error(`Error: ${res.data?.message || 'Unknown error'}`);
          setToastShown('error');
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      if (toastShown !== 'error') {
        // toast.error('Something went wrong while submitting.');
        setToastShown('error');
      }
    }
  };

  const emptyEducationTemplate = {
    UG: '',
    degree: '',
    specialization: '',
    university: '',
    location: '',
    startDate: '',
    endDate: '',
    highestEducation: false,
  };

  const handleAddEducation = () => {
    setEducationList([...educationList, emptyEducationTemplate]);
    setToastShown(''); // reset toast so that new toasts can be shown
  };

  const handleEducationChange = (index: number, key: string, value: string) => {
    const updated = [...educationList];
    updated[index][key] = value;
    setEducationList(updated);
    setToastShown(null); // Reset so new toasts can be shown on submit
  };

  const updateAddress = (
    index: number,
    field: keyof Address,
    value: string,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);

    if (touchedFields[`${index}-${field}`]) {
      validateAddress(updatedAddresses[index], index);
    }
  };

  useEffect(() => {
    api
      .get('/Address/states')
      .then((res) => {
        setStates(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to fetch states:', err);
      });
  }, []);

  // On state change
  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCities([]);
    setShowCityInput(false);

    updateAddress(index, 'state', stateCode);
    updateAddress(index, 'district', '');
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    api
      .get(`/Address/districts?StateCode=${stateCode}`)
      .then((res) => {
        console.log('Districts:', res.data.data);
        setDistricts(res.data.data);
        const uniquePincodes = Array.from(
          new Set(res.data.data.map((d) => d.pinCode)),
        );
        setPincodes(uniquePincodes);
      })
      .catch((err) => {
        console.error('Failed to fetch districts:', err);
      });
  };

  // On district change
  const handleDistrictChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setShowCityInput(false);

    updateAddress(index, 'district', districtName);
    updateAddress(index, 'zipCode', '');
    updateAddress(index, 'city', '');

    const filteredPins = districts
      .filter((d) => d.districtName === districtName)
      .map((d) => d.pinCode);
    setPincodes(filteredPins);

    api
      .get(`/Address/cities?districtName=${encodeURIComponent(districtName)}`)
      .then((res) => {
        const cityData = res.data.data;
        if (cityData.length === 0) {
          setShowCityInput(true);
          setCities([]);
        } else {
          setCities(cityData);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const fetchAddressTypes = async () => {
      try {
        const response = await api.get('/AppLOV'); // ✅ Relative path
        const data = response.data;

        const filteredAddressTypes = data.data.filter(
          (item: any) => item.type === 'Address',
        );
        setAddressTypes(filteredAddressTypes);
      } catch (error) {
        console.error('Error fetching address types:', error);
      }
    };

    fetchAddressTypes();
  }, []);

  const validateAddress = (address: Address, index: number) => {
    const errors: { [key: string]: string } = {};
    const addressRegex = /^(?!\d+$).{3,}$/;

    // Validation checks
    if (!address.addressType) errors.addressType = 'Address type is required';
    if (!address.address1) {
      errors.address1 = 'Address line 1 is required';
    } else if (!addressRegex.test(address.address1)) {
      errors.address1 = 'Please enter a valid address with area or street name';
    }
    if (!address.address2) {
      errors.address2 = 'Address line 2 is required';
    } else if (!addressRegex.test(address.address2)) {
      errors.address2 = 'Please enter a valid address with area or street name';
    }
    const cityRegex = /^[A-Za-z\s]+$/;
    if (!address.city) {
      errors.city = 'City is required';
    } else if (!cityRegex.test(address.city)) {
      errors.city = 'Only letters and spaces allowed in City';
    }
    // else if (address.city.length < 5) {
    //   errors.city = 'City must be at least 5 characters';
    // }
    if (!address.district) errors.district = 'District is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'Zip code is required';

    // Show error messages below fields
    setFormErrors((prev) => ({ ...prev, [index]: errors }));

    // If any errors exist, show toast once
    // if (Object.keys(errors).length > 0) {
    //   toast.error('Please fill all the Address fields');
    //   return false;
    // }

    return true;
  };
  const handleSelectAddress = (index: number) => {
    const newTouched = { ...touchedFields };
    Object.keys(addresses[index]).forEach((field) => {
      newTouched[`${index}-${field}`] = true;
    });
    setTouchedFields(newTouched);
    validateAddress(addresses[index], index);
  };

  const isAddressFetched = useRef(false);

  useEffect(() => {
    fetchPatientAddress();
  }, []); // run only once on component mount

  const handlePrimaryChange = (selectedIndex: number) => {
    const updatedAddresses = addresses.map((addr, idx) => ({
      ...addr,
      isPrimary: idx === selectedIndex, // only selected one gets true
    }));
    setAddresses(updatedAddresses);
  };

  // const [toastShown, setToastShown] = useState(false); // ← Add this at component level

  const [lastSavedAddresses, setLastSavedAddresses] = useState<any[]>([]);

  const handleAddressSubmit = async () => {
    const allErrors: { [idx: number]: { [field: string]: string } } = {};
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');

    let hasError = false;
    let hasDuplicate = false;
    const validAddresses: any[] = [];

    const noEmojis = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    const noOnlySpaces = /\S/;
    const notRepeated = /^(?!([a-zA-Z0-9])\1{5,})/;
    const onlyAlphaNumSlash = /^[a-zA-Z0-9,\s/]+$/;

    const validateField = (
      value: string,
      key: string,
      pattern: RegExp,
      min = 1,
      msg = 'Invalid format.',
      errors: Record<string, string>,
    ) => {
      if (!value || !noOnlySpaces.test(value))
        errors[key] = 'Address Type is required.';
      else if (!noEmojis.test(value)) errors[key] = 'No emojis allowed.';
      else if (!notRepeated.test(value))
        errors[key] = 'No repetitive characters.';
      else if (value.length < min || !pattern.test(value)) errors[key] = msg;
    };

    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    const validateAddressLine = (
      value: string,
      key: string,
      errors: Record<string, string>,
    ) => {
      if (!value || !noOnlySpaces.test(value)) {
        errors[key] = `${capitalize(key)} is required.`;
      } else if (!noEmojis.test(value)) {
        errors[key] = 'No emojis allowed.';
      } else if (!notRepeated.test(value)) {
        errors[key] = 'No repetitive characters.';
      } else if (!onlyAlphaNumSlash.test(value)) {
        errors[key] =
          'Only letters, numbers, spaces, and / allowed. No special characters.';
      } else if (value.length < 3) {
        errors[key] = 'Minimum 3 characters required.';
      } else if (!/[A-Za-z]/.test(value)) {
        errors[key] = 'Must contain at least one letter.';
      } else if (!/\d/.test(value)) {
        errors[key] = 'Must contain at least one number.';
      }

      if (/^\d+$/.test(value)) {
        errors[key] =
          `${capitalize(key)} cannot be numbers only. Include area or street name.`;
      }
    };

    const validateCity = (value: string, errors: Record<string, string>) => {
      const onlyLettersAndSpace = /^[A-Za-z\s]+$/;
      if (!value || !/\S/.test(value)) {
        errors.city = 'City is required.';
      } else if (!onlyLettersAndSpace.test(value)) {
        errors.city =
          'Only letters and spaces are allowed. No numbers or special characters.';
      } else if (value.length < 5) {
        errors.city = 'City must be at least 5 characters long.';
      }
    };

    const isDuplicateAddress = (addr: any, list: any[]) => {
      return list.some(
        (existing) =>
          existing.address1.trim().toLowerCase() ===
            addr.address1.trim().toLowerCase() &&
          existing.address2.trim().toLowerCase() ===
            addr.address2.trim().toLowerCase() &&
          existing.city.trim().toLowerCase() ===
            addr.city.trim().toLowerCase() &&
          existing.state.trim().toLowerCase() ===
            addr.state.trim().toLowerCase() &&
          existing.zipCode.trim() === addr.zipCode.trim(),
      );
    };

    let isAnyFieldFilled = false;

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const errors: Record<string, string> = {};

      if (
        addr.addressType ||
        addr.address1 ||
        addr.address2 ||
        addr.city ||
        addr.district ||
        addr.state ||
        addr.zipCode
      ) {
        isAnyFieldFilled = true;
      }

      validateField(
        addr.addressType,
        'addressType',
        /^[a-zA-Z0-9\s]+$/u,
        1,
        'Only letters, numbers, and spaces are allowed.',
        errors,
      );
      validateAddressLine(addr.address1, 'address1', errors);
      validateAddressLine(addr.address2, 'address2', errors);
      validateCity(addr.city, errors);

      if (!addr.city) errors.city = 'City is required.';
      if (!addr.district) errors.district = 'District is required.';
      if (!addr.state) errors.state = 'State is required.';
      if (!addr.zipCode) errors.zipCode = 'ZipCode is required.';

      if (Object.keys(errors).length === 0) {
        if (isDuplicateAddress(addr, validAddresses)) {
          errors.duplicate = 'Duplicate address found.';
          hasDuplicate = true;
          hasError = true;
        }
      }

      if (Object.keys(errors).length) {
        allErrors[i] = errors;
        hasError = true;
        continue;
      }

      validAddresses.push({
        createdBy: userID,
        updatedBy: userID,
        isActive: true,
        id: doctorID,
        Type: 'Doctor',
        addressType: addr.addressType || '',
        address1: addr.address1 || '',
        address2: addr.address2 || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        isPrimary: addr.isPrimary || false,
      });
    }

    setFormErrors(allErrors);

    if (!isAnyFieldFilled) {
      // No toast or action if no fields filled
      return;
    }

    if (hasError || validAddresses.length === 0) {
      if (toastShown !== 'duplicate' && hasDuplicate) {
        toast.error('Duplicate addresses are not allowed.');
        setToastShown('duplicate');
      } else if (toastShown !== 'error' && !hasDuplicate) {
        toast.error('Please fix validation errors in the address form.');
        setToastShown('error');
      }
      return;
    }

    // New check: prevent saving if no changes from last saved addresses
    if (validAddresses.length > 0) {
      const isSameAsLastSaved =
        JSON.stringify(validAddresses) === JSON.stringify(lastSavedAddresses);
      if (isSameAsLastSaved) {
        // toast.info('No changes to save.');
        return;
      }
    }

    try {
      await api.post('/Address', validAddresses);

      if (toastShown !== 'success') {
        toast.success('All addresses saved successfully!');
        setToastShown('success');
      }
      // Save current valid addresses snapshot to state (deep copy)
      setLastSavedAddresses(JSON.parse(JSON.stringify(validAddresses)));
    } catch (err) {
      console.error('API error:', err);

      if (toastShown !== 'error') {
        toast.error('Something went wrong while saving addresses.');
        setToastShown('error');
      }
    }
  };

  const emptyAddressTemplate = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  };

  const handleAddressChange = (index: number, key: string, value: string) => {
    const updated = [...addresses];
    updated[index][key] = value;
    setAddresses(updated);
    setToastShown(false); // ✅ Allow toast again
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, emptyAddressTemplate]); // however you're adding
    setToastShown(''); // <-- reset toast state so new toasts can be shown
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const inputValue = e.target.value;

    // Allow only letters and space
    const filteredValue = inputValue.replace(/[^A-Za-z\s]/g, '');

    const updated = [...addresses];
    updated[index].city = filteredValue;
    setAddresses(updated);

    // Optionally validate immediately if field was touched
    if (touchedFields[`${index}-city`]) {
      validateAddress(updated[index], index);
    }
  };

  const isValidName = (name: string): boolean => {
    const cleaned = name.replace(/^Dr\.\s*/, ''); // Remove "Dr. " at start
    return /^[A-Za-z\s]+$/.test(cleaned.trim());
  };

  const validate = () => {
    const newErrors: any = {};

    // Tenant
    if (!isNotEmpty(form.tenant)) {
      newErrors.tenant = 'Tenant is required';
    }

    // Hospital
    if (!isNotEmpty(form.hospital)) {
      newErrors.hospital = 'Hospital is required';
    }

    // Doctor Name
    if (!isNotEmpty(form.doctorName)) {
      newErrors.doctorName = 'Doctor name is required';
    } else if (!isValidName(form.doctorName)) {
      newErrors.doctorName = 'Please enter a valid name';
    }

    // Email
    if (!isNotEmpty(form.doctorEmail)) {
      newErrors.doctorEmail = 'Email is required';
    } else if (!isValidEmail(form.doctorEmail)) {
      newErrors.doctorEmail = 'Please enter a valid email';
    }

    // Phone
    if (!isNotEmpty(form.doctorPhoneNumber)) {
      newErrors.doctorPhoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.doctorPhoneNumber)) {
      newErrors.doctorPhoneNumber =
        'Phone number must start with 6, 7, 8, or 9';
    }

    // Aadhaar
    if (!isNotEmpty(form.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!isValidAadhaar(form.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    // PAN
    if (!isNotEmpty(form.panNumber)) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!isValidPAN(form.panNumber)) {
      newErrors.panNumber = 'Please enter a valid PAN number';
    }

    // Qualification
    if (!isNotEmpty(form.qualification)) {
      newErrors.qualification = 'Qualification is required';
    }

    // Specialization
    if (!isNotEmpty(form.specialization)) {
      newErrors.specialization = 'Specialization is required';
    }

    // DOB
    if (!isNotEmpty(form.doctorDateOfBirth)) {
      newErrors.doctorDateOfBirth = 'Date of birth is required';
    } else if (!isValidDob(form.doctorDateOfBirth)) {
      newErrors.doctorDateOfBirth = 'Date of birth cannot be in the future';
    }

    // Gender
    if (!isNotEmpty(form.gender)) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    api
      .get('/Tenant') // Only path is visible, baseURL is handled internally
      .then((res) => {
        const tenants: Tenant[] = res.data.data;
        const activeTenants = tenants
          .filter((t) => t.isActive)
          .map((t) => ({
            id: t.tenantID,
            name: t.tenantName,
          }));

        setTenants(activeTenants);
      })
      .catch((err) => console.error('Error fetching tenants:', err));
  }, []);

  const fetchLOV = useCallback(
    async (
      type: string,
      setter: React.Dispatch<
        React.SetStateAction<{ id: number; name: string }[]>
      >,
    ) => {
      try {
        const res = await api.get(`/AppLOV?type=${type}`); // ✅ Only the endpoint path
        const activeItems = res.data.data.filter((item: any) => item.isActive);
        setter(
          activeItems.map((item: any) => ({
            id: item.appLOVID,
            name: item.name,
          })),
        );
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
      }
    },
    [], // ✅ Memoized on mount
  );
  useEffect(() => {
    fetchLOV('Qualification', setQualifications);
    fetchLOV('Specializations', setSpecializations);
    fetchLOV('Gender', setGenders);
  }, [fetchLOV]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      // Prevent double submission, optionally show a toast here if needed
      return;
    }

    if (validate()) {
      setIsSubmitting(true); // Disable button immediately

      const loggedInUserID = sessionStorage.getItem('userID');
      const doctorID = sessionStorage.getItem('doctorID');

      const doctorData = {
        doctorID: doctorID,
        createdBy: loggedInUserID,
        userID: loggedInUserID,
        isActive: true,
        tenantID: form.tenant,
        hospitalID: form.hospital,
        doctorName: form.doctorName,
        doctorDateOfBirth: form.doctorDateOfBirth,
        doctorEmail: form.doctorEmail,
        doctorPhoneNumber: form.doctorPhoneNumber,
        qualificationID: form.qualification,
        specializationID: form.specialization,
        genderID: form.gender,
        aadhaarNumber: form.aadhaarNumber,
        panNumber: form.panNumber,
      };

      try {
        const response = await api.post('/Doctor/SaveDoctor', doctorData);

        if (response.status === 200) {
          toast.success('Doctor data saved successfully!');
        } else {
          toast.error(`Error: ${response.data.message}`);
          setIsSubmitting(false); // Re-enable button if error
        }
      } catch (error: any) {
        console.error('Error submitting form:', error);
        toast.error('An error occurred while submitting the form.');
        setIsSubmitting(false); // Re-enable button if error
      }
    }
  };

  //All fetches for bind concepts
  //1.Basic
  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/${doctorID}`) // use relative path with your api instance
        .then((res) => {
          const data = res.data?.data;

          if (data) {
            setForm({
              tenant: data.tenantID || '',
              hospital: data.hospitalID || '',
              doctorName: data.doctorName || '',
              doctorEmail: data.doctorEmail || '',
              doctorPhoneNumber: data.doctorPhoneNumber || '',
              aadhaarNumber: data.aadhaarNumber || '',
              panNumber: data.panNumber || '',
              qualification: data.qualificationID || '',
              specialization: data.specializationID || '',
              doctorDateOfBirth: data.doctorDateOfBirth
                ? data.doctorDateOfBirth.split('T')[0]
                : '',
              gender: data.genderID || '',
            });
          }
        })
        .catch((err) => {
          console.error('Failed to fetch doctor data', err);
        });
    }
  }, []);

  //2.Address

  const fetchPatientAddress = async () => {
    const doctorID = sessionStorage.getItem('doctorID'); // ✅ fixed typo
    if (!doctorID) return;

    if (isAddressFetched.current) return;

    try {
      const response = await api.get(
        `/Address/getaddress?id=${doctorID}&Type=Doctor`,
      );

      const addressData = response.data?.data || [];

      if (!Array.isArray(addressData)) {
        console.warn('Invalid response format for address data');
        return;
      }

      if (addressData.length === 0) {
        setAddresses([
          {
            addressID: '',
            addressType: '',
            address1: '',
            address2: '',
            city: '',
            district: '',
            state: '',
            zipCode: '',
            type: '',
            isPrimary: false,
          },
        ]);
        return;
      }

      const formatted = addressData.map((addr: any) => ({
        addressID: addr.addressID || '',
        addressType: addr.addressType || '',
        address1: addr.address1 || '',
        address2: addr.address2 || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        type: addr.type || '',
        isPrimary: addr.isPrimary || false,
      }));

      setAddresses(formatted);
      isAddressFetched.current = true;

      // Optional: preload state, district, city data
      const address = formatted[0];
      if (address.state) {
        const districtRes = await api.get(
          `/Address/districts?StateCode=${address.state}`,
        );
        const districtData = districtRes.data?.data || [];
        setDistricts(districtData);

        const pincodes = [...new Set(districtData.map((d: any) => d.pinCode))];
        setPincodes(pincodes);
      }

      if (address.district) {
        const cityRes = await api.get(
          `/Address/cities?districtName=${encodeURIComponent(address.district)}`,
        );
        const cityData = cityRes.data?.data || [];
        setCities(cityData);
        setShowCityInput(cityData.length === 0);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
  };

  //3.Eductaions

  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/GetDoctorEducation?doctorId=${doctorID}`)
        .then((res) => {
          const educationData = res.data?.data || [];

          const uniqueData = educationData.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.degreeName === value.degreeName &&
                  t.graduateID === value.graduateID &&
                  t.specializationID === value.specializationID &&
                  t.location === value.location &&
                  t.universityName === value.universityName &&
                  t.startDate === value.startDate &&
                  t.endDate === value.endDate,
              ),
          );

          if (uniqueData.length === 0) {
            setEducationList([
              {
                degree: '',
                UG: '',
                specialization: '',
                location: '',
                university: '',
                startDate: '',
                endDate: '',
                highestEducation: false,
                errors: {},
              },
            ]);
            setEducationErrors([{}]); // initialize errors
          } else {
            const formattedData = uniqueData.map((item) => ({
              educationID: item.educationID,
              degree: item.degreeName || '',
              UG: item.graduateID || '',
              specialization: item.specializationID || '',
              location: item.location || '',
              university: item.universityName || '',
              startDate: item.startDate ? new Date(item.startDate) : '',
              endDate: item.endDate ? new Date(item.endDate) : '',
              highestEducation: item.isHighestEducation || false,
              errors: {},
            }));
            setEducationList(formattedData);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch doctor education data', err);
          setEducationList([
            {
              degree: '',
              UG: '',
              specialization: '',
              location: '',
              university: '',
              startDate: '',
              endDate: '',
              highestEducation: false,
              errors: {},
            },
          ]);
          setEducationErrors([{}]);
        });
    }
  }, []);

  // const handleSaveEducationDetails = async (educationData) => {
  //   const doctorID = sessionStorage.getItem('doctorID');

  //   const requests = educationData.map((data) => {
  //     const payload = {
  //       doctorId: doctorID,
  //       degreeName: data.degree,
  //       graduateID: data.UG,
  //       specializationID: data.specialization,
  //       location: data.location,
  //       universityName: data.university,
  //       startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
  //       endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
  //       isHighestEducation: data.highestEducation,
  //     };

  //     const isFilled =
  //       data.degree &&
  //       data.UG &&
  //       data.specialization &&
  //       data.location &&
  //       data.university &&
  //       data.startDate &&
  //       data.endDate;

  //     // Update if educationID is present (even if partial fields)
  //     if (data.educationID && data.educationID !== 0) {
  //       return axios.put(
  //         'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation',
  //         {
  //           educationID: data.educationID,
  //           ...payload,
  //         }
  //       );
  //     }
  //     // Create new if all fields are filled
  //     else if (isFilled) {
  //       return axios.post(
  //         'https://predart003-001-site1.anytempurl.com/api/Doctor/AddDoctorEducation',
  //         payload
  //       );
  //     }
  //     // Else, skip
  //     else {
  //       return Promise.resolve();
  //     }
  //   });

  //   try {
  //     await Promise.all(requests);
  //     alert('✅ Education details saved successfully!');
  //   } catch (error) {
  //     console.error('❌ Error saving education:', error);
  //     alert('Some entries could not be saved. Check console for details.');
  //   }
  // };

  // 4.Language

  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/GetLanguage?doctorId=${doctorID}`)
        .then((res) => {
          const langData = res.data?.data || [];

          if (langData && langData.length > 0) {
            const formattedLanguages = langData.map((item) => {
              const lang = languageOptions.find(
                (opt) => opt.appLOVID === item.languageMasterID,
              );

              return {
                language: lang?.name || '',
                read: item.read || false,
                write: item.write || false,
                speak: item.speak || false,
                doctorID: item.doctorID || doctorID,
                isActive: item.isActive ?? true,
                type: item.type || 'Doctor',
                errors: {},
              };
            });

            setLanguages(formattedLanguages);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch doctor languages:', err);
        });
    }
  }, []);

  //5.Doctor Experience

  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/GetDoctorExprience?doctorId=${doctorID}`)
        .then((res) => {
          const experienceData = res.data?.data || [];

          const uniqueData = experienceData.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.experienceID === value.experienceID &&
                  t.employmentType === value.employmentType &&
                  t.specializationID === value.specializationID &&
                  t.hospitalName === value.hospitalName &&
                  t.startDate === value.startDate &&
                  t.endDate === value.endDate,
              ),
          );

          const formattedData = uniqueData.map((item) => ({
            type: item.employmentType || '',
            specialization: item.specializationID || '',
            hospitalName: item.hospitalName || '',
            joinDate: item.startDate?.split('T')[0] || '',
            leaveDate: item.endDate?.split('T')[0] || '',
            errors: {},
          }));

          setExperiences(
            formattedData.length > 0
              ? formattedData
              : [
                  {
                    type: '',
                    specialization: '',
                    hospitalName: '',
                    joinDate: '',
                    leaveDate: '',
                    errors: {},
                  },
                ],
          );
        })
        .catch((err) => {
          console.error('Failed to fetch doctor experience data', err);
        });
    }
  }, []);

  //6.Doctor Skill

  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/GetDoctorSkill?doctorId=${doctorID}`)
        .then((res) => {
          const skillData = res.data?.data || [];

          const formattedSkills = skillData.map((item: any) => ({
            skillMasterID: item.skillMasterID || '',
            skill: item.skillMasterID || '', // Use ID or name based on your dropdown binding
            years: item.yearOfExperience?.toString() || '',
            months: item.monthOfExperience?.toString() || '',
            description: item.description || '',
            errors: {},
          }));

          setSkills(
            formattedSkills.length > 0
              ? formattedSkills
              : [
                  {
                    skillMasterID: '',
                    skill: '',
                    years: '',
                    months: '',
                    description: '',
                    errors: {},
                  },
                ],
          );
        })
        .catch((err) => {
          console.error('Failed to fetch doctor skill data', err);
        });
    }
  }, []);

  //7.Award

  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      api
        .get(`/Doctor/GetDoctorAward?doctorId=${doctorID}`)
        .then((res) => {
          const awardData = res.data?.data || [];

          const uniqueData = awardData.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.awardID === value.awardID &&
                  t.awardName === value.awardName &&
                  t.awardYear === value.awardYear &&
                  t.description === value.description,
              ),
          );

          const formattedData = uniqueData.map((item) => ({
            name: item.awardName || '',
            year: item.awardYear || '',
            description: item.description || '',
            errors: {},
          }));

          setAwards(
            formattedData.length > 0
              ? formattedData
              : [
                  {
                    name: '',
                    year: '',
                    description: '',
                    errors: {},
                  },
                ],
          );
        })
        .catch((err) => {
          console.error('Failed to fetch doctor award data', err);
        });
    }
  }, []);

  const handleComplete = () => {
    console.log('Form completed!');
    // Handle form completion logic here
  };

  const finishButtonTemplate = (handleComplete: () => void) => (
    <button className="finish-button" onClick={handleComplete}>
      Finish
    </button>
  );

  <div className="step-navigation">
    {steps.map((step, index) => (
      <div
        key={index}
        className={`tab ${completedSteps.includes(index + 1) ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
        onClick={() => setCurrentStep(index + 1)} // Optional: allows clicking tabs to navigate
      >
        {step.label}
      </div>
    ))}
  </div>;
  const nextButtonTemplate = (handleNext: () => void) => (
    <div>
      <button type="button" className="base-button" onClick={handleNext}>
        Next
      </button>
    </div>
  );

  const backTemplate = (handlePrev: () => void) => (
    <button type="button" className="base-button" onClick={handlePrev}>
      Back
    </button>
  );

  return (
    <>
      <FormWizard
        stepSize="sm"
        shape="circle"
        color="#2196f3"
        onComplete={handleComplete}
        backButtonTemplate={backTemplate}
        nextButtonTemplate={nextButtonTemplate}
        finishButtonTemplate={(onComplete) => (
          <button
            className="finish-button"
            onClick={() => {
              console.log('Form completed!');
              toast.success('Doctor profile completed successfully');
              onComplete();
            }}
          >
            Finish
          </button>
        )}
      >
        <FormWizard.TabContent
          title="Basic Details"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="ti-user"></i>
            </div>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-3 gap-4 p-4 max-w-6xl mx-auto"
          >
            <div className="flex flex-col">
              <select
                name="tenant"
                value={form.tenant || ''}
                onChange={handleChange}
                className={inputFieldClass}
              >
                <option value="">Select Tenant</option>
                {tenants?.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.tenant && (
                <span className="text-red-500 text-sm">{errors.tenant}</span>
              )}
            </div>

            <div className="flex flex-col">
              <select
                name="hospital"
                value={form.hospital || ''}
                onChange={handleChange}
                className={inputFieldClass}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>

              {errors.hospital && (
                <span className="text-red-500 text-sm">{errors.hospital}</span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                name="doctorName"
                placeholder="Enter Doctor Name"
                value={form.doctorName}
                onChange={handleChange}
                className={inputFieldClass}
              />
              {errors.doctorName && (
                <span className="text-red-500 text-sm">
                  {errors.doctorName}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                name="doctorEmail"
                placeholder="Enter Email"
                value={form.doctorEmail}
                onChange={handleChange}
                className={inputFieldClass}
              />
              {errors.doctorEmail && (
                <span className="text-red-500 text-sm">
                  {errors.doctorEmail}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                name="doctorPhoneNumber"
                placeholder="Enter Phone Number"
                value={form.doctorPhoneNumber}
                onChange={handleChange}
                className={inputFieldClass}
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                onKeyDown={(e) => {
                  if (
                    [
                      'Backspace',
                      'Tab',
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                    ].includes(e.key)
                  )
                    return;
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                }}
              />
              {errors.doctorPhoneNumber && (
                <span className="text-red-500 text-sm">
                  {errors.doctorPhoneNumber}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="Enter Aadhaar Number"
                value={form.aadhaarNumber}
                onChange={handleChange}
                className={inputFieldClass}
                pattern="[0-9]{12}"
                maxLength={12}
                inputMode="numeric"
                onKeyDown={(e) => {
                  if (
                    [
                      'Backspace',
                      'Tab',
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                    ].includes(e.key)
                  )
                    return;
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                }}
              />
              {errors.aadhaarNumber && (
                <span className="text-red-500 text-sm">
                  {errors.aadhaarNumber}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                name="panNumber"
                placeholder="Enter PAN Number"
                value={form.panNumber}
                onChange={handleChange}
                className={inputFieldClass}
              />
              {errors.panNumber && (
                <span className="text-red-500 text-sm">{errors.panNumber}</span>
              )}
            </div>

            <div className="flex flex-col">
              <select
                name="qualification"
                value={form.qualification || ''}
                onChange={handleChange}
                className={inputFieldClass}
              >
                <option value="">Select Qualification</option>
                {qualifications.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.qualification && (
                <span className="text-red-500 text-sm">
                  {errors.qualification}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <select
                name="specialization"
                value={form.specialization || ''}
                onChange={handleChange}
                className={inputFieldClass}
              >
                <option value="">Select Specialization</option>
                {specializations.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.specialization && (
                <span className="text-red-500 text-sm">
                  {errors.specialization}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="date"
                name="doctorDateOfBirth"
                placeholder="Select Date of Birth"
                value={form.doctorDateOfBirth}
                onChange={handleChange}
                className={inputFieldClass}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.doctorDateOfBirth && (
                <span className="text-red-500 text-sm">
                  {errors.doctorDateOfBirth}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <select
                name="gender"
                value={form.gender || ''}
                onChange={handleChange}
                className={inputFieldClass}
              >
                <option value="">Select Gender</option>
                {genders.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <span className="text-red-500 text-sm">{errors.gender}</span>
              )}
            </div>

            <div className="col-span-3 flex justify-center mt-4">
              <button
                type="submit"
                className={`bg-blue-600 text-white px-6 py-2 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitted' : 'Submit'}
              </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
          </form>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // handleSubmit will only handle the current form state
              handleAddressSubmit();
            }}
          >
            <h2 className="text-lg font-bold text-black-700 text-left mt-8">
              Address
            </h2>
            {addresses &&
              addresses.length > 0 &&
              addresses.map((address, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAddress(index)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {/* Address Type */}
                  <div className="mb-4">
                    <div className="flex flex-col">
                      <select
                        className="w-[200px] rounded-lg border border-stroke p-2 pl-4 text-black outline-none bg-transparent dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.addressType}
                        onChange={(e) =>
                          updateAddress(index, 'addressType', e.target.value)
                        }
                      >
                        <option value="">Select Address Type</option>
                        {addressTypes.map((type) => (
                          <option key={type.appLOVID} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {formErrors[index]?.addressType && (
                        <p className="text-red-500 text-sm mt-1 text-left">
                          {formErrors[index].addressType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.address1}
                        onChange={(e) => {
                          const sanitizedValue = e.target.value.replace(
                            /[^a-zA-Z0-9, /]/g,
                            '',
                          );
                          updateAddress(index, 'address1', sanitizedValue);
                        }}
                        placeholder="Enter address line 1"
                      />
                      {formErrors[index]?.address1 && (
                        <p className="text-red-500 text-sm">
                          {formErrors[index].address1}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.address2}
                        onChange={(e) => {
                          const sanitizedValue = e.target.value.replace(
                            /[^a-zA-Z0-9, /]/g,
                            '',
                          );
                          updateAddress(index, 'address2', sanitizedValue);
                        }}
                        placeholder="Enter address line 2"
                      />
                      {formErrors[index]?.address2 && (
                        <p className="text-red-500 text-sm">
                          {formErrors[index].address2}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City, District, State, Zip Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Section 1: State & District */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          value={address.state || ''}
                          onChange={(e) => handleStateChange(e, index)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state.id} value={state.stateName}>
                              {state.stateName}
                            </option>
                          ))}
                        </select>
                        {formErrors[index]?.state && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].state}
                          </p>
                        )}
                      </div>

                      <div>
                        <select
                          value={address.district || ''}
                          onChange={(e) => handleDistrictChange(e, index)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select District</option>
                          {[
                            ...new Map(
                              districts.map((d) => [d.districtName, d]),
                            ).values(),
                          ].map((dist) => (
                            <option key={dist.id} value={dist.districtName}>
                              {dist.districtName}
                            </option>
                          ))}
                        </select>
                        {formErrors[index]?.district && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].district}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Pincode & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          value={address.zipCode || ''}
                          onChange={(e) =>
                            updateAddress(index, 'zipCode', e.target.value)
                          }
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select Pincode</option>
                          {pincodes.map((pin, index) => (
                            <option key={index} value={pin}>
                              {pin}
                            </option>
                          ))}
                        </select>

                        {formErrors[index]?.zipCode && (
                          <p className="text-red-500 text-sm">
                            {formErrors[index].zipCode}
                          </p>
                        )}
                      </div>

                      <div>
                        {showCityInput ? (
                          <>
                            <input
                              type="text"
                              value={address.city || ''}
                              onChange={(e) => {
                                handleCityChange(e, index);
                                setManualCity(e.target.value);
                              }}
                              placeholder="Enter City"
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />

                            {formErrors[index]?.city && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].city}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <select
                              value={address.city || ''}
                              onChange={(e) =>
                                updateAddress(index, 'city', e.target.value)
                              }
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select City</option>
                              {cities.map((city) => (
                                <option key={city.id} value={city.cityName}>
                                  {city.cityName}
                                </option>
                              ))}
                            </select>

                            {formErrors[index]?.city && (
                              <p className="text-red-500 text-sm">
                                {formErrors[index].city}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    <label className="flex items-center gap-2 text-sm text-black dark:text-white">
                      <input
                        type="checkbox"
                        checked={address.isPrimary}
                        onChange={() => handlePrimaryChange(index)}
                      />
                      Set as Primary
                    </label>
                  </div>
                </div>
              ))}

            {/* Add New Address */}
            <div className="flex items-center justify-end gap-1">
              <div
                className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                onClick={handleAddAddress}
              >
                +
              </div>
              <span className="text-sm font-medium text-black-600">Add</span>
            </div>

            <div className="flex justify-end">
              <CustomButton
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
              >
                Save Address
              </CustomButton>
            </div>
          </form>
        </FormWizard.TabContent>

        <FormWizard.TabContent
          title="Education"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
        cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="fas fa-graduation-cap"></i>
            </div>
          }
        >
          <form onSubmit={handleFieldSubmit}>
            <div className="p-6 space-y-6">
              {educationList.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 p-4 max-w-6xl mx-auto border border-[#d1d5db] rounded-md"
                >
                  <div></div>
                  <div className="col-span-1"></div>

                  {/* Highest Education */}
                  <div className="col-span-1 flex items-end justify-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.highestEducation}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            'highestEducation',
                            e.target.checked,
                          )
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="font-semibold text-gray-900 text-sm">
                        Is this your highest education
                      </span>
                    </label>
                  </div>

                  {/* Degree */}
                  <div className="col-span-1 flex flex-col">
                    <input
                      type="text"
                      value={entry.degree}
                      onChange={(e) =>
                        handleInputChange(index, 'degree', e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder="Enter your degree"
                      className={inputFieldClass}
                    />
                    {educationErrors[index]?.degree && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].degree}
                      </p>
                    )}
                  </div>

                  {/* Qualification */}
                  <div className="col-span-1 flex flex-col">
                    <select
                      value={entry.UG || ''}
                      onChange={(e) =>
                        handleInputChange(index, 'UG', e.target.value)
                      }
                      className={inputFieldClass}
                    >
                      <option value="">Select Qualification</option>
                      {qualifications.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {educationErrors[index]?.qualification && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].qualification}
                      </p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="col-span-1 flex flex-col">
                    <select
                      value={entry.specialization || ''}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          'specialization',
                          e.target.value,
                        )
                      }
                      className={inputFieldClass}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {educationErrors[index]?.specialization && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].specialization}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="col-span-1 flex flex-col">
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) =>
                        handleInputChange(index, 'location', e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder="Enter your location"
                      className={inputFieldClass}
                    />
                    {educationErrors[index]?.location && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].location}
                      </p>
                    )}
                  </div>

                  {/* University */}
                  <div className="col-span-1 flex flex-col">
                    <input
                      type="text"
                      value={entry.university}
                      onChange={(e) =>
                        handleInputChange(index, 'university', e.target.value)
                      }
                      // onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder="Enter your university name"
                      className={inputFieldClass}
                    />
                    {educationErrors[index]?.university && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].university}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="col-span-1 flex flex-col">
                    <input
                      type={entry.startDate ? 'date' : 'text'}
                      name="startDate"
                      placeholder="Starting Date"
                      value={entry.startDate || ''}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(index, 'startDate', value);

                        if (new Date(value) > new Date()) {
                          setErrors((prev) => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              startDate: 'Start date cannot be in the future',
                            },
                          }));
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              startDate: '',
                            },
                          }));
                        }
                      }}
                      className={`${inputFieldClass} ${
                        educationErrors[index]?.startDate
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } ${!entry.startDate ? 'text-gray-400' : 'text-black'} appearance-none relative z-10`}
                      style={{
                        paddingTop: !entry.startDate ? '1.25rem' : undefined,
                      }}
                    />

                    {educationErrors[index]?.startDate && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].startDate}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="col-span-1 flex flex-col">
                    <input
                      type={entry.endDate ? 'date' : 'text'}
                      name="endDate"
                      placeholder="Ending Date"
                      value={entry.endDate || ''}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(index, 'endDate', value);

                        if (new Date(value) > new Date()) {
                          setErrors((prev) => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              endDate: 'End date cannot be in the future',
                            },
                          }));
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              endDate: '',
                            },
                          }));
                        }
                      }}
                      className={`${inputFieldClass} ${
                        errors[index]?.endDate
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } ${!entry.endDate ? 'text-gray-400' : 'text-black'} appearance-none relative z-10`}
                      style={{
                        paddingTop: !entry.endDate ? '1.25rem' : undefined,
                      }}
                    />

                    {educationErrors[index]?.endDate && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].endDate}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Entry Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEducation}
                  disabled={isAddDisabled}
                  className={`flex items-center space-x-2 font-semibold transition-colors duration-300 ${
                    isAddDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <div
                    className={`flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer transition-colors duration-300 text-lg ${
                      isAddDisabled
                        ? 'bg-gray-300'
                        : 'bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]'
                    }`}
                  >
                    +
                  </div>
                  <span
                    className={`transition-colors duration-300 ${
                      isAddDisabled ? 'text-gray-400' : 'text-blue-600'
                    }`}
                  >
                    Add
                  </span>
                </button>
              </div>

              {/* Submit Button - centered */}
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                >
                  Submit
                </button>
              </div>

              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </form>

          <form onSubmit={handleLanguageSubmit}>
            <div className="p-6 space-y-6 w-200">
              <h2 className="text-lg font-semibold text-gray-700">
                Language Known
              </h2>

              {languages.map((entry, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border border-[#d1d5db] rounded-md p-4"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Language Dropdown */}
                    <select
                      value={entry.language}
                      onChange={(e) =>
                        handle(index, 'language', e.target.value)
                      }
                      className={inputFieldClass + ' max-w-xs'}
                    >
                      <option value="">-- Select a Language --</option>
                      {languageOptions.map((lang) => (
                        <option key={lang.appLOVID} value={lang.name}>
                          {lang.name}
                        </option>
                      ))}
                    </select>

                    {/* Read */}
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={entry.read}
                        onChange={(e) =>
                          handle(index, 'read', e.target.checked)
                        }
                        className="form-checkbox"
                      />
                      <span>Read</span>
                    </label>

                    {/* Write */}
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={entry.write}
                        onChange={(e) =>
                          handle(index, 'write', e.target.checked)
                        }
                        className="form-checkbox"
                      />
                      <span>Write</span>
                    </label>

                    {/* Speak */}
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={entry.speak}
                        onChange={(e) =>
                          handle(index, 'speak', e.target.checked)
                        }
                        className="form-checkbox"
                      />
                      <span>Speak</span>
                    </label>
                  </div>

                  {/* Error Messages */}
                  {entry.errors?.language && (
                    <span className="text-red-500 text-sm">
                      {entry.errors.language}
                    </span>
                  )}
                  {entry.errors?.skill && (
                    <span className="text-red-500 text-sm">
                      {entry.errors.skill}
                    </span>
                  )}

                  {/* Submit Button */}
                </div>
              ))}

              {/* Add Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="flex items-center space-x-2 text-blue-600 font-semibold"
                >
                  <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]">
                    +
                  </div>
                  <span>Add</span>
                </button>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                >
                  Submit
                </button>
              </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
          </form>
        </FormWizard.TabContent>

        <FormWizard.TabContent
          title="Experience"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="far fa-clone"></i>
            </div>
          }
        >
          <form onSubmit={handleExperienceSubmit}>
            <div className="p-6 rounded-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Doctor Experience
              </h2>

              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="border border-[#d1d5db] p-4 mb-4 rounded-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Type */}
                    <div>
                      <select
                        className={`${inputFieldClass} ${
                          errors[idx]?.type
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        value={exp.type}
                        onChange={(e) =>
                          handleExperience(idx, 'type', e.target.value)
                        }
                      >
                        <option value="">-- Select Type --</option>
                        {employmentTypes.map((type) => (
                          <option key={type.appLOVID} value={type.appLOVID}>
                            {type.name}
                          </option>
                        ))}
                      </select>

                      {errors[idx]?.type && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].type}
                        </p>
                      )}
                    </div>

                    {/* Specialization and Hospital */}
                    <div className="flex gap-4 col-span-2">
                      <div className="w-full">
                        <select
                          value={exp.specialization}
                          onChange={(e) =>
                            handleExperience(
                              idx,
                              'specialization',
                              e.target.value,
                            )
                          }
                          className={`${inputFieldClass} ${
                            errors[idx]?.specialization
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">-- Select Specialization --</option>
                          {specializations.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                              {spec.name}
                            </option>
                          ))}
                        </select>

                        {errors[idx]?.specialization && (
                          <p className="text-red-600 text-sm">
                            {errors[idx].specialization}
                          </p>
                        )}
                      </div>

                      <div className="w-full">
                        <input
                          type="text"
                          value={exp.hospitalName}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Allow only letters and spaces
                            const filteredValue = inputValue.replace(
                              /[^A-Za-z\s]/g,
                              '',
                            );

                            handleExperience(
                              idx,
                              'hospitalName',
                              filteredValue,
                            );

                            // Optional: live error checking (if you're storing field errors)
                            if (filteredValue.length < 5) {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  hospitalName: 'Minimum 5 characters required',
                                },
                              }));
                            } else {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  hospitalName: '',
                                },
                              }));
                            }
                          }}
                          className={`${inputFieldClass} ${
                            errors[idx]?.hospitalName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="Enter Hospital Name"
                        />

                        {errors[idx]?.hospitalName && (
                          <p className="text-red-600 text-sm">
                            {errors[idx].hospitalName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-4 col-span-2">
                      <div className="w-full relative">
                        <input
                          type={exp.joinDate ? 'date' : 'text'}
                          name="joinDate"
                          placeholder="Join Date"
                          value={exp.joinDate || ''}
                          max={today}
                          onFocus={(e) => (e.target.type = 'date')}
                          onBlur={(e) => {
                            if (!e.target.value) e.target.type = 'text';
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleExperience(idx, 'joinDate', value);

                            if (new Date(value) > new Date()) {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  joinDate: 'Join date cannot be in the future',
                                },
                              }));
                            } else {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  joinDate: '',
                                },
                              }));
                            }
                          }}
                          className={`${inputFieldClass} ${
                            errors[idx]?.joinDate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } ${!exp.joinDate ? 'text-gray-400' : 'text-black'} appearance-none relative z-10`}
                          style={{
                            paddingTop: !exp.joinDate ? '1.25rem' : undefined,
                          }}
                        />

                        {errors[idx]?.joinDate && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors[idx].joinDate}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <input
                          type={exp.leaveDate ? 'date' : 'text'}
                          name="leaveDate"
                          placeholder="Leave Date"
                          value={exp.leaveDate || ''}
                          max={today}
                          onFocus={(e) => (e.target.type = 'date')}
                          onBlur={(e) => {
                            if (!e.target.value) e.target.type = 'text';
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleExperience(idx, 'leaveDate', value);

                            if (new Date(value) > new Date()) {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  leaveDate:
                                    'Leave date cannot be in the future',
                                },
                              }));
                            } else {
                              setErrors((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...prev[idx],
                                  leaveDate: '',
                                },
                              }));
                            }
                          }}
                          className={`${inputFieldClass} ${
                            errors[idx]?.leaveDate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } ${!exp.leaveDate ? 'text-gray-400' : 'text-black'} appearance-none relative z-10`}
                          style={{
                            paddingTop: !exp.leaveDate ? '1.25rem' : undefined,
                          }}
                        />
                        {errors[idx]?.leaveDate && (
                          <p className="text-red-600 text-sm">
                            {errors[idx].leaveDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* ✅ Submit Button */}
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                >
                  Submit
                </button>
              </div>
              {/* Add Button */}
              <div className="flex justify-end px-5 mt-4">
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex items-center space-x-2 text-blue-600 font-semibold"
                >
                  <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]">
                    +
                  </div>
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>
          <form onSubmit={handleSkillSubmit}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Skills
              </h2>

              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="border border-[#d1d5db] p-4 mb-4 rounded-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <select
                        className={inputFieldClass}
                        value={skill.skill}
                        onChange={(e) =>
                          handleSkill(idx, 'skill', e.target.value)
                        }
                      >
                        <option value="">Select a skill</option>
                        {skillsList.map((skill) => (
                          <option key={skill.appLOVID} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                      {skill.errors?.skill && (
                        <p className="text-red-500 text-sm">
                          {skill.errors.skill}
                        </p>
                      )}
                      <ToastContainer position="top-right" autoClose={3000} />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={skill.years}
                        onKeyDown={handleSkillKeyDown}
                        onChange={(e) =>
                          handleSkill(idx, 'years', e.target.value)
                        }
                        placeholder="Year of Experience"
                        className={`${inputFieldClass} ${skill.errors?.years ? 'border-red-500' : ''}`}
                      />
                      {skill.errors?.years && (
                        <p className="text-red-500 text-sm mt-1">
                          {skill.errors.years}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        className={`${inputFieldClass} ${skill.errors?.months ? 'border-red-500' : ''}`}
                        value={skill.months}
                        onKeyDown={handleSkillKeyDown}
                        onChange={(e) =>
                          handleSkill(idx, 'months', e.target.value)
                        }
                        placeholder="Month of Experience"
                      />
                      {skill.errors?.months && (
                        <p className="text-red-500 text-sm mt-1">
                          {skill.errors.months}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Description"
                      value={skill.description}
                      onChange={(e) => {
                        // Allow letters, numbers, spaces, commas, periods, hyphens only
                        const filteredValue = e.target.value.replace(
                          /[^a-zA-Z0-9\s,.\-]/g,
                          '',
                        );
                        handleSkill(idx, 'description', filteredValue);
                      }}
                      className={inputFieldClass}
                      rows={3}
                    />

                    {skill.errors?.description && (
                      <p className="text-red-500 text-sm">
                        {skill.errors.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSkillSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                >
                  Submit
                </button>
              </div>
              {/* </div> */}
              {/* ))} */}
            </div>

            <div className="flex justify-end px-5">
              <button
                type="button"
                onClick={handleAddSkill}
                className="flex items-center space-x-2 text-blue-600 font-semibold"
              >
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]">
                  +
                </div>
                <span>Add</span>
              </button>
            </div>
          </form>
        </FormWizard.TabContent>

        <FormWizard.TabContent
          title="Awards"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="fas fa-crown"></i>
            </div>
          }
        >
          <form onSubmit={handleAwardSubmit}>
            <div className="p-6 rounded-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Awards and Recognitions
              </h2>

              {awards.map((award, index) => (
                <div
                  key={index}
                  className="border border-[#d1d5db] p-4 mb-4 rounded-md grid gap-4 grid-cols-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter award name"
                        value={award.name}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        onChange={(e) =>
                          handleAwardChange(index, 'name', e.target.value)
                        }
                        className={inputFieldClass}
                      />
                      {award.errors?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {award.errors.name}
                        </p>
                      )}
                      <ToastContainer position="top-right" autoClose={3000} />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter Year"
                        value={award.year}
                        maxLength={4}
                        inputMode="numeric"
                        onChange={(e) =>
                          handleAwardChange(index, 'year', e.target.value)
                        }
                        className={inputFieldClass}
                      />
                      {award.errors?.year && (
                        <p className="text-red-500 text-sm mt-1">
                          {award.errors.year}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Enter description"
                      value={award.description}
                      onChange={(e) =>
                        handleAwardChange(index, 'description', e.target.value)
                      }
                      className={inputFieldClass}
                      rows={3}
                    />
                    {award.errors?.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {award.errors.description}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      onClick={handleAwardSubmit}
                      className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={handleAddAward}
                  className="flex items-center space-x-2 text-blue-600 font-semibold"
                >
                  <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]">
                    +
                  </div>
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>
        </FormWizard.TabContent>

        <FormWizard.TabContent
          title="Time Slots"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="far fa-clock"></i>
            </div>
          }
        >
          <form>
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-2">
                Existing Time Slots
              </h3>
              {existingTimeSlots.length > 0 ? (
                existingTimeSlots.map((slot, index) =>
                  renderTimeSlotRow(
                    slot,
                    index,
                    existingTimeSlots,
                    setExistingTimeSlots,
                    false,
                  ),
                )
              ) : (
                <p>No existing time slots available.</p>
              )}

              <h3 className="text-lg font-semibold my-4">Add New Time Slots</h3>
              {newTimeSlots.map((slot, index) =>
                renderTimeSlotRow(slot, index, newTimeSlots, setNewTimeSlots),
              )}
              <div className="flex items-center mt-2 justify-end gap-1">
                {/* Clickable Icon */}
                <div
                  className="flex justify-center items-center h-10 w-10
                                text-white rounded-full cursor-pointer bg-gradient-to-b
                                  from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                  onClick={addNewRow}
                >
                  +
                </div>

                {/* Non-clickable Text */}
                <span className="text-sm font-medium text-black-600">Add</span>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleTimeSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Time Slots
                </button>
              </div>
            </div>
          </form>
        </FormWizard.TabContent>

        <FormWizard.TabContent
          title="Documents"
          icon={
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
            >
              <i className="far fa-file"></i>
            </div>
          }
        >
          <form>
            <div className="p-6 bg-white rounded-md shadow-md">
              <h2 className="text-xl font-bold mb-4 mt-4">Document Upload</h2>

              {/* File Upload Section */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Document Type Dropdown */}
                <select
                  className="w-[35%] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black
    outline-none focus:border-primary"
                  onChange={(e) => setSelectedType(e.target.value)}
                  value={selectedType}
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map((doc) => (
                    <option key={doc.appLOVID} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>

                {/* File Input */}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-[30%]"
                />

                {/* Preview Icon */}
                {previewSrc && (
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="text-blue-500"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  className="w-[15%] bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]
    text-white py-2 px-4 rounded-lg text-sm"
                >
                  Upload
                </button>
              </div>

              {/* Uploaded Documents Table */}

              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2">Uploaded Documents</h2>
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">File Name</th>
                      <th className="border px-4 py-2">Document Type</th>

                      <th className="border px-4 py-2">Date</th>
                      <th className="border px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedDocuments.length > 0 ? (
                      uploadedDocuments.map((doc, index) => (
                        <tr key={index} className="text-center">
                          <td className="border px-4 py-2">
                            {doc.documentType}
                          </td>
                          <td className="border px-4 py-2">
                            {getFormattedFileName(doc.fileName)}
                          </td>
                          <td className="border px-4 py-2">
                            {doc.createdOn
                              ? doc.createdOn.split('T')[0]
                              : 'N/A'}
                          </td>
                          <td className="border px-4 py-2 justify-center gap-2">
                            {/* View Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleViewDocument(doc.documentID, doc.fileName)
                              }
                              className="bg-gradient-to-b from-[#008000] to-[#00FF00] hover:from-[#00FF00] hover:to-[#008000]
                text-white px-3 py-1 rounded-lg"
                            >
                              View
                            </button>

                            {/* Delete Button */}
                            {/* <button
                onClick={() => handleDeleteDocument(doc.documentID)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button> */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="border px-4 py-2 text-center"
                        >
                          No documents uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Preview Modal */}
              {isPreviewOpen && previewSrc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg w-96 relative">
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                    <h2 className="text-lg font-bold mb-2">
                      {selectedType} Preview
                    </h2>
                    {selectedFile?.type.includes('pdf') ? (
                      <iframe
                        src={previewSrc}
                        width="100%"
                        height="300px"
                        title="PDF Preview"
                      ></iframe>
                    ) : (
                      <img
                        src={previewSrc}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                </div>
              )}
              {/* Modal for Viewing Documents */}
              {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-4 rounded shadow-lg max-w-xl w-full relative flex flex-col items-center">
                    <button
                      className="absolute top-2 right-2 text-gray-500 text-xl"
                      onClick={() => setModalOpen(false)}
                    >
                      &times;
                    </button>
                    <h2 className="text-lg font-bold mb-2">View Document</h2>
                    <div className="flex justify-center items-center w-full max-h-[80vh]">
                      {isImage ? (
                        <img
                          src={documentURL}
                          alt="Document"
                          className="max-w-full max-h-[80vh] object-contain"
                        />
                      ) : (
                        <iframe
                          src={documentURL}
                          className="w-full h-[400px] border"
                          title="Document Preview"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </FormWizard.TabContent>
      </FormWizard>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add Style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");

       .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
         .validation-summary {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.validation-summary h4 {
  color: #856404;
  margin-bottom: 8px;
}
.tab {
  padding: 10px 20px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.tab.active {
  background-color: #007bff;
  color: white;
}
.tab.completed {
  background-color: #28a745; /* ✅ Green for completed steps */
  color: white;
}

.validation-summary ul {
  padding-left: 20px;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}
.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 16px;
}


        .title {
          margin-top: 40px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
        }
           /* Responsive styles */
  @media (max-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .w-[500px] {
      width: 100%;
    }

    .text-lg {
      font-size: 1rem;
    }

    .space-y-4 > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    .h-10 {
      height: 2.5rem;
    }
  }

   .base-button {
  background: linear-gradient(to bottom, #004A99, #007BFF);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  transition: background 0.15s ease-out;
  cursor: pointer;
}

.base-button:hover {
  background: linear-gradient(to bottom, #007BFF, #004A99);
  transition: background 0.15s ease-in;
}


.wizard .nav-tabs > li.completed > a {
  background-color: green !important;
  color: white !important;
}

  @media (min-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
    
      
        .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .base-button {
          background-color: blue;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          }
          
          .base-button:hover {
          background-color: navy;
          }
          
          .base-button:focus {
          outline: none;
          }
          
          .base-button:active {
          transform: translateY(2px);
          }

        .finish-button{
          background-color: green;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
        }
        .finish-button:hover {
          background-color: darkgreen;
          }
        
        .finish-button:focus {
          outline: none;
         }
          
        .finish-button:active {
          transform: translateY(2px);
         }
      
      `}</style>
    </>
  );
};

export default DoctorForm;
