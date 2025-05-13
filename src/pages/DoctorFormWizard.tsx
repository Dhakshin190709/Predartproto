import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
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

const initialEntry = {
  UG: '',
  highestEducation: false,
  degree: '',
  specialization: '',
  location: '',
  university: '',
  startDate: null,
  endDate: null,
  errors: {},
};

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
  const [selectedPartTime, setSelectedPartTime] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [awards, setAwards] = useState([
    { name: '', year: '', description: '', errors: {} },
  ]);
  //  const [isAddDisabled, setIsAddDisabled] = useState(false);
  // const [skillErrors, setSkillErrors] = useState([]);

  // const [errors, setErrors] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0]; // today's date in yyyy-mm-dd
  const [educationList, setEducationList] = useState([initialEntry]);
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

  const currentYear = new Date().getFullYear();
  const [weekdays, setWeekdays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
  ]);

  useEffect(() => {
    fetchHospitals();
    fetchWeekdays();
  }, []);

  const fetchHospitals = async () => {
    try {
      const unitID = sessionStorage.getItem('unitID');
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Hospital',
      );
      const result = await response.json();

      if (result && Array.isArray(result)) {
        const filteredHospitals = result
          .filter((hospital: any) => hospital.isActive) // remove unitID filter if not needed
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
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Weekday',
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setWeekdays(result.data);
      }
    } catch (error) {
      console.error('Error fetching weekdays:', error);
    }
  };

  const addNewRow = () => {
    setTimeSlots([
      ...timeSlots,
      { day: '', hospital: '', duration: '', fromTime: null, toTime: null },
    ]);
  };

  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const handleTimeSubmit = async () => {
    // Retrieve userID from sessionStorage
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found in session storage.');
      alert('User not logged in. Please log in again.');
      return;
    }
    const doctorID = 'ee7462c5-55a1-46cd-0610-08dd40f5dca2'; // Replace dynamically if needed

    const timestamp = new Date().toISOString(); // Generate current timestamp

    const payload = timeSlots.map((slot) => ({
      createdBy: userID,
      createdOn: timestamp,
      updatedBy: userID, // Assuming the same user updates
      updatedOn: timestamp,
      doctorID,
      hospitalID: slot.hospital, // Ensure this is the hospital ID
      dayofWeek: slot.day, // Ensure this is the weekday name
      fromTime: slot.fromTime
        ? slot.fromTime.toLocaleTimeString('en-US', { hour12: false })
        : '00:00:00',
      toTime: slot.toTime
        ? slot.toTime.toLocaleTimeString('en-US', { hour12: false })
        : '00:00:00',
      slotDuration: slot.duration.toString(), // Convert to string explicitly
      isActive: true, // Default to active
    }));

    console.log('Payload:', JSON.stringify(payload, null, 2)); // Debug payload

    try {
      const response = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorTimeSlot',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (response.ok) {
        console.log('Time slots saved successfully!', result);
      } else {
        console.error('Failed to save time slots:', result);
      }
    } catch (error) {
      console.error('Error submitting time slots:', error);
    }
  };

  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get(
        'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=documentType',
      );
      if (response.data && Array.isArray(response.data.data)) {
        setDocumentTypes(response.data.data);
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
      const response = await axios.get(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDocuments?doctorID=${doctorID}&userID=${userID}',
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

  // Upload Document (POST API)
  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      alert('Please select a file and document type.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (!base64String) {
        console.error('Failed to convert file to Base64');
        return;
      }

      const userID = sessionStorage.getItem('userID');
      const doctorID = sessionStorage.getItem('doctorID'); // ✅ Get doctorID from session

      if (!userID || !doctorID) {
        alert('User or Doctor ID missing. Please log in again.');
        return;
      }

      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `uploads/${selectedFile.name}`;

      const payload = {
        createdBy: userID,
        isActive: true,
        id: doctorID,
        type: 'doctor',
        documentType: selectedType,
        fileName: selectedFile.name,
        fileLocation: filePath,
        fileBase64: base64String,
        fileExtenstion: fileExtension,
      };

      try {
        const response = await axios.post(
          'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDocuments',
          payload,
        );
        console.log('Upload successful:', response.data);
        setSelectedFile(null);
        setPreviewSrc(null);
        setSelectedType('');
      } catch (error: any) {
        console.error('Upload failed:', error);
      }
    };
  };

  // View Document in Modal
  const handleViewDocument = async (documentID, fileName) => {
    try {
      const response = await axios.get(
        ' https://predart003-001-site1.anytempurl.com/api/Doctor/Documents/${documentID}',
      );

      if (!response.data?.data?.fileBase64) {
        alert('Invalid file data received.');
        return;
      }

      const fileBase64 = response.data.data.fileBase64;
      const isImageFile = fileName.match(/\.(jpg|jpeg|png|gif)$/i);
      setIsImage(!!isImageFile);

      const byteCharacters = atob(fileBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const fileType = isImageFile
        ? `image/${fileName.split('.').pop()}`
        : 'application/pdf';

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
      const numericYear = value.replace(/\D/g, '').slice(0, 4); // only digits, max 4
      const currentYear = new Date().getFullYear();

      // If year is 4 digits and in the future, skip update
      if (numericYear.length === 4 && parseInt(numericYear) > currentYear) {
        return;
      }

      updatedAwards[index][field] = numericYear;
    } else {
      updatedAwards[index][field] = value;
    }

    setAwards(updatedAwards); // make sure you're using setAwards from useState
  };

  const handleAddAward = () => {
    setAwards([...awards, { name: '', year: '', description: '', errors: {} }]);
  };

  const validateAwards = () => {
    const updated = awards.map((award) => {
      const errors = {};

      if (!award.name.trim()) {
        errors.name = 'Award name is required';
      } else if (!/^[A-Za-z\s]+$/.test(award.name)) {
        errors.name = 'Only letters and spaces are allowed';
      }
      if (!award.year) {
        errors.year = 'Year is required';
      } else if (!/^\d{4}$/.test(award.year)) {
        errors.year = 'Year must be exactly 4 digits';
      } else if (parseInt(award.year) > currentYear) {
        errors.year = `Year cannot be in the future`;
      }

      if (!award.description.trim()) {
        errors.description = 'Description is required';
      }

      return { ...award, errors };
    });

    setAwards(updated);
    return updated.every((a) => Object.keys(a.errors).length === 0);
  };

  const handleAwardSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAwards();
    if (isValid) {
      console.log('Awards submitted:', awards);
      // You can proceed with submitting the form or API call
    } else {
      console.log('Validation failed');
    }
  };
  const [skills, setSkills] = useState([
    { skill: '', years: '', months: '', description: '', errors: {} },
  ]);

  const handleSkill = (index, field, value) => {
    if (field === 'months') {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 12) {
        // Optional: show error
        console.error('Only numbers from 1 to 12 are allowed.');
        return;
      }
    }

    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;
    setSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    setSkills([
      ...skills,
      { skill: '', years: '', months: '', description: '', errors: {} },
    ]);
  };

  const validateSkills = () => {
    const updatedSkills = skills.map((s) => {
      const errors = {};

      if (!s.skill) errors.skill = 'Please select a skill';
      if (s.years === '') errors.years = 'years of experience is required';
      if (s.months === '') errors.months = 'Month of experience is required';
      if (!s.description.trim()) {
        errors.description = 'Description is required';
      }

      return { ...s, errors };
    });

    setSkills(updatedSkills);
    return updatedSkills.every((s) => Object.keys(s.errors).length === 0);
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSkills()) {
      const payload = skills.map((entry) => ({
        createdBy: userID,
        createdOn: new Date().toISOString(),
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: true,
        skillID: entry.skill, // fixed: must be ID
        yearOfExperience: Number(entry.years), // fixed
        monthOfExperience: Number(entry.months), // fixed
        description: entry.description,
      }));

      console.log('Payload being sent:', payload); // optional for debug

      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorSkill',
          {
            method: 'POST',
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          alert('Skill details submitted successfully!');
        } else {
          const result = await response.json();
          alert(`Error: ${result.message || 'Something went wrong'}`);
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred during submission.');
      }
    }
  };

  const [experiences, setExperiences] = useState([
    {
      type: '',
      specialization: '',
      hospitalName: '',
      joinDate: '',
      leaveDate: '',
    },
  ]);

  const handleExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleAddExperiences = () => {
    setExperiences([
      ...experiences,
      {
        type: '',
        specialization: '',
        hospitalName: '',
        joinDate: '',
        leaveDate: '',
      },
    ]);
  };

  const validateExperience = () => {
    const newErrors = experiences.map((exp) => {
      const error = {};
      if (!exp.type) error.type = 'Type is required';
      if (!exp.specialization) {
        error.specialization = 'Specialization is required';
      } else if (!/^[A-Za-z\s]+$/.test(exp.specialization)) {
        error.specialization = 'Only letters allowed';
      }
      if (!exp.hospitalName) error.hospitalName = 'Hospital name is required';
      if (!exp.joinDate) error.joinDate = 'Join date is required';
      if (!exp.leaveDate) {
        error.leaveDate = 'Leave date is required';
      } else if (exp.joinDate && exp.leaveDate < exp.joinDate) {
        error.leaveDate = 'Leave date must be after join date';
      }
      return error;
    });

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Specializations',
        );
        const activeSkills = res.data.data.filter((item: any) => item.isActive);
        setSkillsList(activeSkills.map((item: any) => item.name));
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    // Fetch Employment Types
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Worktype',
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('📌 Employment Type API Response:', data);
        if (data?.data) {
          setEmploymentTypes(data.data); // ✅ Store as employmentTypes
        }
      })
      .catch((err) =>
        console.error('❌ Error fetching Employment Types:', err),
      );
  }, []);

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateExperience()) {
      const payload = {
        employmentType: selectedPartTime, // example: 'Full-time' or 'Part-time'
        specialization: specialization, // example: 'Dermatologist'
        hospitalName: hospitalName,
        joinDate: joinDate, // format: 'YYYY-MM-DD'
        leaveDate: leaveDate, // format: 'YYYY-MM-DD'
        createdBy: userID,
        createdOn: new Date().toISOString(),
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: true,
      };

      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorExprience',
          {
            method: 'POST',
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          alert('Experience details submitted successfully!');
        } else {
          const result = await response.json();
          alert(`Error: ${result.message || 'Something went wrong'}`);
        }
      } catch (error) {
        console.error('Experience submission error:', error);
        alert('An error occurred during experience submission.');
      }
    }
  };

  const [languages, setLanguages] = useState([
    { language: '', read: false, write: false, speak: false, errors: {} },
  ]);

  const handle = (index, field, value) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  const handleAddLanguage = () => {
    setLanguages([
      ...languages,
      { language: '', read: false, write: false, speak: false, errors: {} },
    ]);
  };

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
    // Fetch Employment Types
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=LanguageMaster',
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('📌 Employment Type API Response:', data);
        if (data?.data) {
          setLanguageOptions(data.data); // ✅ Store as employmentTypes
        }
      })
      .catch((err) =>
        console.error('❌ Error fetching Employment Types:', err),
      );
  }, []);

  const handleLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLanguages()) {
      const payload = languages.map((entry) => ({
        createdBy: userID,
        createdOn: new Date().toISOString(),
        updatedBy: userID,
        updatedOn: new Date().toISOString(),
        isActive: true,
        languageID: entry.language, // Make sure this is the ID
        id: entry.id,
        type: 'string',
        languageMasterID: entry.languageMasterID,
        read: entry.read,
        write: entry.write,
        speak: entry.speak,
      }));

      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveLanguage',
          {
            method: 'POST',
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          alert('Language details submitted successfully!');
        } else {
          const result = await response.json();
          alert(`Error: ${result.message || 'Something went wrong'}`);
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred during submission.');
      }
    }
  };

  const isAddDisabled = educationList.some((entry) => entry.highestEducation);
  const isValidText = (text) => /^[A-Za-z\s]+$/.test(text);

  const validateEntry = (entry) => {
    const errors = {};

    if (!entry.degree || !isValidText(entry.degree)) {
      errors.degree = 'Degree is required';
    }

    if (!entry.location || !isValidText(entry.location)) {
      errors.location = 'Location is required';
    }

    if (!entry.university || !isValidText(entry.spacalization)) {
      errors.spacalization = 'Spacalization is required';
    }

    if (!entry.university || !isValidText(entry.university)) {
      errors.university = 'University name is required';
    }

    const today = new Date();
    if (!entry.startDate || entry.startDate > today) {
      errors.dates = 'Start date is required';
    }

    if (!entry.endDate) {
      errors.dates = 'End date is required';
    } else if (
      !entry.startDate ||
      entry.endDate.getFullYear() - entry.startDate.getFullYear() < 4
    ) {
      errors.dates = 'End date must be at least 4 years after the start date';
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
    const hasHighest = educationList.some((entry) => entry.highestEducation);
    if (hasHighest) {
      alert(
        'You cannot add more education entries after selecting highest education.',
      );
      return;
    }
    setEducationList([...educationList, { ...initialEntry }]);
  };

  useEffect(() => {
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation',
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Inspect the structure of the response
        setDegreeNames(data.data); // assuming 'data' is the key that holds the array
      })
      .catch((error) => {
        console.error('Error fetching doctor education data:', error);
      });
  }, []);

  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');

    if (!doctorID || !userID) {
      alert('Missing doctorID or userID in session.');
      return;
    }

    // Validate all entries
    for (const entry of educationList) {
      const errors = validateEntry(entry);
      if (Object.keys(errors).length > 0) {
        alert('Please fill all required fields correctly before submitting.');
        return;
      }
    }

    // Prepare payload
 const payload = educationList.map((entry) => ({
  doctorID: doctorID,
  graduateID: entry.UG, // Use UG here (degree)
  degreeName: entry.degree,
  specializationID: entry.specialization, // Use specialization here
  location: entry.location,
  universityName: entry.university,
  startDate: entry.startDate?.toISOString(),
  endDate: entry.endDate?.toISOString(),
  isHighestEducation: entry.highestEducation,
  createdBy: userID,
  isActive: true,
}));



    try {
      const res = await fetch(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation',
        {
          method: 'POST',
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        alert('✅ Education details submitted successfully!');
      } else {
        const result = await res.json();
        alert(`❌ Error: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      alert('An error occurred while submitting education data.');
    }
  };

  const [addresses, setAddresses] = useState([
    {
      type: 'Select Address type',
      line1: '',
      line2: '',
      city: '',
      state: '',
      district: '',
      pincode: '',
    },
  ]);

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        type: 'Select Address type',
        line1: '',
        line2: '',
        city: '',
        state: '',
        district: '',
        pincode: '',
      },
    ]);
    setErrors([...errors, {}]);
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const updated = [...addresses]; // Make sure 'addresses' is an array
    updated[index][field] = value;
    setAddresses(updated);
  };

  const validateAddress = () => {
    const newErrors = addresses.map((addr) => {
      const err: any = {};
      if (!addr.line1) err.line1 = 'Address Line 1 is required';
      if (!addr.line2) err.line2 = 'Address Line 2 is required';
      if (!addr.city) err.city = 'City is required';
      if (!addr.state) err.state = 'State is required';
      if (!addr.district) err.district = 'District is required';
      if (!/^\d{6}$/.test(addr.pincode))
        err.pincode = 'Valid 6-digit pincode required';
      return err;
    });

    setErrors(newErrors);
    return newErrors.every((err) => Object.keys(err).length === 0);
  };

  useEffect(() => {
    const fetchLOV = async () => {
      try {
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/AppLOV',
        );
        const data = await response.json();

        if (data?.data) {
          // Filter the data for address types
          const addressTypeData = data.data.filter(
            (item: any) => item.type?.toLowerCase() === 'addresstype',
          );
          setAddressTypes(addressTypeData.map((item: any) => item.name)); // Assuming the addressType name is in `name`

          // Similarly, you can fetch states and districts if needed
          const stateData = data.data.filter(
            (item: any) => item.type?.toLowerCase() === 'state',
          );
          setStates(stateData.map((item: any) => item.name)); // Assuming the state name is in `name`

          const districtData = data.data.filter(
            (item: any) => item.type?.toLowerCase() === 'district',
          );
          setDistricts(districtData.map((item: any) => item.name)); // Assuming the district name is in `name`
        }
      } catch (error) {
        console.error('Error fetching LOV:', error);
      }
    };

    fetchLOV();
  }, []); // Empty dependency array to run this once when the component mounts

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      alert('Submitted Successfully!');
      console.log(addresses);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
    } else if (!isValidPhone(form.doctorPhoneNumber)) {
      newErrors.doctorPhoneNumber = 'Please enter a 10-digit number';
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
    axios
      .get('https://predart003-001-site1.anytempurl.com/api/Tenant')
      .then((res) => {
        const tenants: Tenant[] = res.data.data;
        const activeTenants = tenants
          .filter((t) => t.isActive)
          .map((t) => ({
            id: t.tenantID,
            name: t.tenantName,
          }));

        setTenants(activeTenants); // Store both ID and Name in state
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
        const res = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/AppLOV?type=${type}`,
        );
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
    [], // Empty dependency array ensures this function is memoized and doesn't change on each render
  );

  useEffect(() => {
    fetchLOV('Qualification', setQualifications);
    fetchLOV('Specializations', setSpecializations);
    fetchLOV('Gender', setGenders);
  }, [fetchLOV]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const loggedInUserID = sessionStorage.getItem('userID');
      const doctorID = sessionStorage.getItem('doctorID'); // Retrieve doctorID from sessionStorage

      const doctorData = {
        doctorID: doctorID, // Include doctorID in the data
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
        const response = await fetch(
          'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor', // This endpoint should handle both create and update
          {
            method: 'POST', // Always POST for both create and update
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(doctorData),
          },
        );

        const result = await response.json();

        if (response.ok) {
          alert('Doctor data saved successfully!');
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting the form.');
      }
    }
  };

  //All fetches for bind concepts
  //1.Basic
  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');

    if (doctorID) {
      axios
        .get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/${doctorID}`,
        )
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

  //3.Eductaions


useEffect(() => {
  const doctorID = sessionStorage.getItem('doctorID');

  const fetchEducationData = async () => {
    try {
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation?doctorId=${doctorID}`
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        setEducationList(response.data);
      } else {
        // Keep showing initial entry if no data
        console.log('No education data found for this doctor.');
      }
    } catch (error) {
      console.error('Error fetching education data', error);
      // Still keep initial entry box in case of error
    }
  };

  fetchEducationData();
}, []);



  const handleComplete = () => {
    console.log('Form completed!');
    // Handle form completion logic here
  };

  return (
    <>
      <FormWizard stepSize="sm" onComplete={handleComplete}>
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
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>

          <form onSubmit={handleAddressSubmit}>
            <div className="p-6 rounded-md max-w-6xl mx-auto">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Address
              </h2>

              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="gap-4 p-4 max-w-6xl mx-auto border border-[#d1d5db] rounded-lg "
                >
                  {/* Type */}
                  <div className="flex justify-start items-start">
                    <select
                      className="rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={addr.type}
                      onChange={(e) =>
                        handleAddressChange(idx, 'type', e.target.value)
                      }
                    >
                      <option>Select Address type</option>
                      {addressTypes.map((type, i) => (
                        <option key={i} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Lines */}
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter address line 1"
                        className={inputFieldClass}
                        value={addr.line1}
                        onChange={(e) =>
                          handleAddressChange(idx, 'line1', e.target.value)
                        }
                      />
                      {errors[idx]?.line1 && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].line1}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter address line 2"
                        className={inputFieldClass}
                        value={addr.line2}
                        onChange={(e) =>
                          handleAddressChange(idx, 'line2', e.target.value)
                        }
                      />
                      {errors[idx]?.line2 && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].line2}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City, State, District, Pincode */}
                  <div className="grid grid-cols-4 gap-4 mt-5">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter city"
                        className={inputFieldClass}
                        value={addr.city}
                        onChange={(e) =>
                          handleAddressChange(idx, 'city', e.target.value)
                        }
                      />
                      {errors[idx]?.city && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].city}
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        className={inputFieldClass}
                        value={addr.district}
                        onChange={(e) =>
                          handleAddressChange(idx, 'district', e.target.value)
                        }
                      >
                        <option value="">Select State</option>
                        <option value="Chennai">TamilNadu</option>
                        <option value="Coimbatore">Kerala</option>
                      </select>
                      {errors[idx]?.state && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].state}
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        className={inputFieldClass}
                        value={addr.district}
                        onChange={(e) =>
                          handleAddressChange(idx, 'district', e.target.value)
                        }
                      >
                        <option value="">Select District</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Coimbatore">Coimbatore</option>
                      </select>
                      {errors[idx]?.district && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].district}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        className={inputFieldClass}
                        maxLength={6}
                        value={addr.pincode}
                        onChange={(e) => {
                          const pin = e.target.value
                            .replace(/[^0-9]/g, '')
                            .slice(0, 6);
                          handleAddressChange(idx, 'pincode', pin);
                        }}
                      />
                      {errors[idx]?.pincode && (
                        <p className="text-red-600 text-sm">
                          {errors[idx].pincode}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                  >
                    Submit
                  </button>
                </div>
              ))}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={addAddress}
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
                    handleInputChange(index, 'highestEducation', e.target.checked)
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
                placeholder="Enter your degree"
                className={inputFieldClass}
              />
              {entry.errors?.degree && (
                <span className="text-red-500 text-sm">{entry.errors.degree}</span>
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
              {entry.errors?.UG && (
                <span className="text-red-500 text-sm">{entry.errors.UG}</span>
              )}
            </div>

            {/* Specialization */}
            <div className="col-span-1 flex flex-col">
              <select
                value={entry.specialization || ''}
                onChange={(e) =>
                  handleInputChange(index, 'specialization', e.target.value)
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
              {entry.errors?.specialization && (
                <span className="text-red-500 text-sm">{entry.errors.specialization}</span>
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
                placeholder="Enter your location"
                className={inputFieldClass}
              />
              {entry.errors?.location && (
                <span className="text-red-500 text-sm">{entry.errors.location}</span>
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
                placeholder="Enter your university name"
                className={inputFieldClass}
              />
              {entry.errors?.university && (
                <span className="text-red-500 text-sm">{entry.errors.university}</span>
              )}
            </div>

            {/* Start Date */}
            <div className="col-span-1 flex flex-col">
              <DatePicker
                selected={entry.startDate}
                onChange={(date) => handleInputChange(index, 'startDate', date)}
                placeholderText="Starting date"
                dateFormat="dd/MM/yyyy"
                className={inputFieldClass}
              />
              {entry.errors?.dates && (
                <span className="text-red-500 text-sm">{entry.errors.dates}</span>
              )}
            </div>

            {/* End Date */}
            <div className="col-span-1 flex flex-col">
              <DatePicker
                selected={entry.endDate}
                onChange={(date) => handleInputChange(index, 'endDate', date)}
                placeholderText="Ending date"
                dateFormat="dd/MM/yyyy"
                className={inputFieldClass}
              />
              {entry.errors?.dates && (
                <span className="text-red-500 text-sm">{entry.errors.dates}</span>
              )}
            </div>
          </div>
        ))}

        {/* Add Entry Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddEntry}
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
        <div className="col-span-3 flex justify-center">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded mt-5">
            Submit
          </button>
        </div>
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
                        <option key={lang.id} value={lang.name.toLowerCase()}>
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
                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                    >
                      Submit
                    </button>
                  </div>
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
            </div>
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
                        {employmentTypes.map((type: any) => (
                          <option key={type.appLOVID} value={type.name}>
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
  <option key={spec.id} value={spec.name}>
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
                        <select
                          value={exp.hospitalName}
                          onChange={(e) =>
                            handleExperience(
                              idx,
                              'hospitalName',
                              e.target.value,
                            )
                          }
                          className={`${inputFieldClass} ${
                            errors[idx]?.hospitalName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">-- Select Hospital --</option>
                        {hospitals.map((hospital) => (
  <option key={hospital.id} value={hospital.name}>
    {hospital.name}
  </option>
))}


                        </select>

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
                          type="date"
                          placeholder
                          text="Join Date"
                          value={exp.joinDate}
                          max={today}
                          onChange={(e) =>
                            handleExperience(idx, 'joinDate', e.target.value)
                          }
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
                          type="date"
                          value={exp.leaveDate}
                          onChange={(e) =>
                            handleExperience(idx, 'leaveDate', e.target.value)
                          }
                          className={`${inputFieldClass} ${
                            errors[idx]?.leaveDate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {errors[idx]?.leaveDate && (
                          <p className="text-red-600 text-sm">
                            {errors[idx].leaveDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* ✅ Submit Button */}
                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Button */}
              <div className="flex justify-end px-5 mt-4">
                <button
                  type="button"
                  onClick={handleAddExperiences}
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
                        <option value="">-- Select a Skill --</option>
                        {skillsList.map((skillOption) => (
                          <option key={skillOption} value={skillOption}>
                            {skillOption}
                          </option>
                        ))}
                      </select>

                      {skill.errors?.skill && (
                        <p className="text-red-500 text-sm">
                          {skill.errors.skill}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={skill.years}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const parsedYear = parseInt(inputValue, 10);
                          // Only allow numbers and prevent letters, spaces, and future years
                          if (
                            inputValue === '' ||
                            (parsedYear <= currentYear &&
                              parsedYear >= 0 &&
                              !/\D/.test(inputValue))
                          ) {
                            handleSkill(idx, 'years', inputValue);
                          }
                        }}
                        placeholder="Year of Experience"
                        className={`${inputFieldClass} ${skill.errors?.years ? 'border-red-500' : ''}`}
                      />
                      {skill.errors?.years && (
                        <p className="text-red-500 text-sm mt-1">
                          {skill.errors.years}
                        </p>
                      )}{' '}
                    </div>

                    <div>
                      <input
                        type="text"
                        className={`${inputFieldClass} ${errors.skills?.[idx]?.months ? 'border-red-500' : ''}`}
                        value={skill.months}
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
                      onChange={(e) =>
                        handleSkill(idx, 'description', e.target.value)
                      }
                      className={inputFieldClass}
                      rows={3}
                    />
                    {skill.errors?.description && (
                      <p className="text-red-500 text-sm">
                        {skill.errors.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSkillSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded mt-5"
                  >
                    Submit
                  </button>
                </div>
              ))}
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
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-center border border-stroke rounded-lg p-4 bg-transparent dark:border-form-strokedark dark:bg-form-input"
                >
                  {/* Day Selection */}
                  <select
                    value={slot.day}
                    onChange={(e) =>
                      handleTimeChange(index, 'day', e.target.value)
                    }
                    className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Day</option>
                    {weekdays.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.name}
                      </option>
                    ))}
                  </select>

                  {/* Hospital Selection */}
                  <select
                    value={slot.hospital}
                    onChange={(e) =>
                      handleTimeChange(index, 'hospital', e.target.value)
                    }
                    className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital) => (
                      <option
                        key={hospital.hospitalID}
                        value={hospital.hospitalID}
                      >
                        {hospital.hospitalName}
                      </option>
                    ))}
                  </select>

                  {/* Duration Input */}
                  <input
                    type="text"
                    placeholder="Duration (mins)"
                    value={slot.duration}
                    onChange={(e) =>
                      handleTimeChange(index, 'duration', e.target.value)
                    }
                    className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />

                  {/* From Time Picker */}
                  <DatePicker
                    selected={slot.fromTime}
                    onChange={(time) =>
                      handleTimeChange(index, 'fromTime', time)
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    placeholderText="From Time"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />

                  {/* To Time Picker */}
                  <DatePicker
                    selected={slot.toTime}
                    onChange={(time) => handleTimeChange(index, 'toTime', time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    placeholderText="To Time"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              ))}

              {/* Add Row Button */}
              <div className="flex items-center justify-end gap-1 mt-4">
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                  onClick={addNewRow}
                >
                  +
                </div>
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
                    <option key={doc.id} value={doc.name}>
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
      {/* Add Style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </>
  );
};

export default DoctorForm;
