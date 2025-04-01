import React, { useState, useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import DocumentUpload from '../UploadedDocument'; 

import { differenceInMonths, isFuture } from "date-fns";
interface Experience {
  exprienceID?: string;
  type: string;
  hospitalName: string;
  joinDate: string;
  leaveDate: string;
}

interface ExperienceErrors {
  [field: string]: string;
}

const DoctorFormWizard: React.FC = () => {
  const [languages, setLanguages] = useState([]);
  
  //const [doctorID, setdoctorID] = useState(null);
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [addressTypes, setAddressTypes] = useState([]);
  
    const [weekdays, setWeekdays] = useState([]);
    const [timeSlots, setTimeSlots] = useState([
      { day: "", hospital: "", duration: "", fromTime: null, toTime: null },
    ]);
  
  const [hospitals, setHospitals] = useState([]);
    const [genders, setGenders] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  interface FormData {
    tenant: string;
    hospital: string;
    name: string;
    email: string;
    phone: string;
    aadhaar: string;
    qualification: string;
    specialization: string;
    pan: string;
    DateOfBirth: string;
    gender: string;
  }
  type FormErrors = {
    [key: string]: string; // Allows dynamic keys like 'award_0_awardName'
  };
  
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

  const backTemplate = (handlePrevious: () => void) => {
    return (
      <button className="base-button" onClick={handlePrevious}>
        back
      </button>
    );
  };
  
  type AddressError = {
    addressType?: string;
    address1?: string;
    city?: string;
    zipCode?: string;
    type?: string;
    degreeName?:string;
location?:string;
university?:string;
startDate?:string;
endDate?:string;
  };
  const [steps, setSteps] = useState<{ label: string }[]>([]);
  const [experienceErrors, setExperienceErrors] = useState<Record<string, string>[]>([]);
  const [validatedTabs, setValidatedTabs] = useState<string[]>([]);
  const formSections = ["Basic Details", "Education", "Experience", "Awards"];
  const [educationData, setEducationData] = useState<any[]>([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [formData, setFormData] = useState({
    tenant: '',
    hospital: '',
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    qualification: '',
    specialization: '',
    pan: '',
    DateOfBirth: '',
    gender: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    tenant: '',
    hospital: '',
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    qualification: '',
    specialization: '',
    pan: '',
    DateOfBirth: '',
    gender: '',
    awardName: '',
  });
  

  
const [successMessage, setSuccessMessage] = useState('');
  const [workTypes, setWorkTypes] = useState([]);
const [isSuperAdmin, setIsSuperAdmin] = useState(false);
const doctorID = "4f753961-3a5b-4fa3-3c8b-08dd548796a6";
const [doctorDetails, setDoctorDetails] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
//const [doctorID, setDoctorID] = useState(() => sessionStorage.getItem("doctorID"));
  const [experience, setExperience] = useState([
    {
      type: '',
      specialization: '',
      hospitalName: '',
      joinDate: null,
      leaveDate: null,
    },
  ]);
  

  

 
   // Update state for experience fields
   const updateExperience = (index, field, value) => {
    const updatedExperience = [...experience]; // Create a new array to avoid mutation
    updatedExperience[index][field] = value;
    setExperience(updatedExperience); // Update the state with the new array
  };
  
   // Format date to ISO string (required by API)
   const formatDate = (date) => {
    return date ? date.toISOString() : null;
  };
 
  
  

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((response) => response.json())
      .then((data) => {
        console.log('Raw API Data:', data); // Log entire data to check its structure
  
        if (data && Array.isArray(data.data)) {
          // Log available types to understand what is available in the response
          const availableTypes = data.data.map((item) => item.type);
          console.log('Available Types in Data:', availableTypes);
  
          // Filter data based on type, including the 'LanguageMaster' type
          const filteredData = {
            workTypes: data.data.filter((item) => item.type?.toLowerCase() === 'worktype'),
            genderOptions: data.data.filter((item) => item.type?.toLowerCase() === 'gender'),
            hospitalTypes: data.data.filter((item) => item.type?.toLowerCase() === 'hospital'),
            qualificationTypes: data.data.filter((item) => item.type?.toLowerCase() === 'qualification'),
            specializationTypes: data.data.filter((item) => item.type?.toLowerCase() === 'specializations'),
            addressTypes: data.data.filter((item) => item.type?.toLowerCase() === 'address'),
            languageOptions: data.data.filter((item) => item.type?.toLowerCase() === 'languagemaster'),  // Add LanguageMaster filter
          };
  
          // Log filtered results for debugging
          console.log('Filtered Data:', filteredData);
  
          // Set state with the filtered data
          setWorkTypes(filteredData.workTypes);
          setGenderOptions(filteredData.genderOptions);
          setHospitalTypes(filteredData.hospitalTypes);
          setQualifications(filteredData.qualificationTypes);
          setSpecializations(filteredData.specializationTypes);
          setAddressTypes(filteredData.addressTypes);
          setLanguageOptions(filteredData.languageOptions); // Set language options
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  
  

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Name is required";
  
        case "email":
          if (!value.trim()) return "Email is required";
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value)
            ? ""
            : "Invalid email format: must contain exactly one '@' and one '.' after '@'";
        
  
      case "phone":
        if (!value.trim()) return "Phone number is required";
        return /^\d{10}$/.test(value) ? "" : "Phone number must be exactly 10 digits";
  
      case "aadhaar":
        if (!value.trim()) return "Aadhaar number is required";
        return /^\d{12}$/.test(value) ? "" : "Aadhaar must be exactly 12 digits";
  
      case "pan":
        if (!value.trim()) return "PAN number is required";
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) ? "" : "Invalid PAN format (e.g., ABCDE1234F)";
  
      case "tenant":
        return value ? "" : "Tenant is required";
  
      case "hospital":
        return value ? "" : "Hospital is required";
  
      case "qualification":
        return value ? "" : "Qualification is required";
  
      case "specialization":
        return value ? "" : "Specialization is required";
  
        case "DateOfBirth":
          if (!value) return "Date of Birth is required";
        
          const selectedDate = new Date(value);
          const today = new Date();
        
          // Check if DOB is in the future
          if (selectedDate > today) return "Date of Birth cannot be in the future";
        
          // Calculate age
          const age = today.getFullYear() - selectedDate.getFullYear();
          const monthDiff = today.getMonth() - selectedDate.getMonth();
          const dayDiff = today.getDate() - selectedDate.getDate();
        
          // Adjust age if the current date hasn't reached the birth date this year
          const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
          const actualAge = isBirthdayPassed ? age : age - 1;
        
          if (actualAge < 18) return "Age must be at least 18 years";
        
          return ""; // Valid DOB
        
  
      case "gender":
        return value ? "" : "Gender is required";
  
      default:
        return "";
    }
  };
  
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in. Please log in again.");
      return { isValid: false, errors: { userID: "User not logged in." } };
    }
  
    console.log("🚀 Submit button clicked!");
  
    const requestData = {
      createdBy: userID,
      doctorID: doctorID, // using state variable doctorID (or it might be null on first registration)
      tenantID: formData.tenant,
      hospitalID: formData.hospital,
      doctorName: formData.name.trim(),
      doctorDateOfBirth: formData.DateOfBirth ? `${formData.DateOfBirth}T00:00:00` : null,
      doctorEmail: formData.email.trim(),
      doctorPhoneNumber: formData.phone.trim(),
      doctorGender: formData.gender,
      qualificationID: formData.qualification,
      specializationID: formData.specialization,
      genderID: formData.gender,
      aadhaarNumber: formData.aadhaar.trim(),
      panNumber: formData.pan.trim(),
    };
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor",
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("🚀 API Response:", response);
  
      if (response.status === 200 || response.status === 201) {
        // Extract the new doctorID from the response and update both sessionStorage and state.
        const newDoctorID = response.data.data;
        sessionStorage.setItem("doctorID", newDoctorID);
        setDoctorID(newDoctorID);
        console.log("Stored doctorID:", newDoctorID);
  
        // Reset form after successful submission
        setFormData({
          name: "",
          gender: "",
          phone: "",
          email: "",
          aadhaar: "",
          pan: "",
          qualification: "",
          specialization: "",
          tenant: "",
          hospital: "",
          DateOfBirth: "",
        });
  
        return { isValid: true, errors: {} };
      } else {
        console.error("❌ Unexpected response status:", response.status);
        return {
          isValid: false,
          errors: { response: "Unexpected response from the server." },
        };
      }
    } catch (error) {
      console.error("🚨 Error submitting form:", error);
      return {
        isValid: false,
        errors: { submit: "Error occurred while registering the doctor." },
      };
    }
  };
  
  
  
  
  
  
  
 
  
  
  const [forms, setForms] = useState([
    {
      id: Date.now(),
      language: '',
      abilities: { read: false, write: false, speak: false },
    },
  ]);
  const [genderOptions, setGenderOptions] = useState<any[]>([]);
  interface Award {
    awardName: string;
    year: string;
    description: string;
  }

 
 // Handle change for a specific dropdown
 const handleHospitalChange = (index, value) => {
  setTimeSlots((prevSlots) =>
    prevSlots.map((slot, i) =>
      i === index ? { ...slot, hospital: value } : slot // Update only the selected row
    )
  );
};

 
const addNewRow = () => {
  setTimeSlots([
    ...timeSlots,
    { day: "", hospital: "", duration: "", fromTime: null, toTime: null },
  ]);
};

const handleChange = (index, field, value) => {
  const updatedSlots = [...timeSlots];
  updatedSlots[index][field] = value;
  setTimeSlots(updatedSlots);
};

  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const [awards, setAwards] = useState([
    {
      awardName: "",
      year: "",
      description: "",
    },
  ]);

  // Function to update the award fields dynamically
  const updateAwardField = (index: number, field: keyof Award, value: string) => {
    const updatedAwards = [...awards];
    updatedAwards[index][field] = value;
    setAwards(updatedAwards);
  
    const fieldPrefix = `award_${index}`;
    const updatedErrors = { ...formErrors };
  
    // ✅ Clear error for the current field when typing
    switch (field) {
      case "awardName":
        if (updatedErrors[`${fieldPrefix}_awardName`]) {
          delete updatedErrors[`${fieldPrefix}_awardName`];
        }
        break;
      case "year":
        if (updatedErrors[`${fieldPrefix}_awardYear`]) {
          delete updatedErrors[`${fieldPrefix}_awardYear`];
        }
        break;
      case "description":
        if (updatedErrors[`${fieldPrefix}_description`]) {
          delete updatedErrors[`${fieldPrefix}_description`];
        }
        break;
    }
  
    setFormErrors(updatedErrors);
  };
  
  
  const addAward = () => {
    setAwards([...awards, { awardName: '', year: '', description: '' }]);
  };

  const removeAward = (index: number) => {
    const updatedAwards = awards.filter((_, i) => i !== index);
    setAwards(updatedAwards);
  };

  
  const [addresses, setAddresses] = useState([
    {
      addressType: 'Work', 
      type: 'Doctor', 
      address1: '',  // Required
      address2: '',
      city: '',       // Required
      district: '',
      state: '',

      zipCode: '',    // FIXED: Renamed from 'pincode'
      isActive: true,
      degreeName: '',
     
      university: '',
      location: '',
      startDate: null, // Added startDate field
      endDate: null, // Added endDate field
      isHighestEducation:true,
    },
  ]);
  
  const [errors, setErrors] = useState<AddressError[]>([]);
  const [validationSummary, setValidationSummary] = useState<string[]>([]);
  
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        type: '',
        specialization: '',
        hospitalName: '',
        joinDate: null,
        leaveDate: null,
      },
    ]);
  };

  const removeExperience = (index) => {
    const updatedExperiences = experience.filter((_, i) => i !== index);
    setExperience(updatedExperiences);
  };
  // Experience

  // Define the type for a skill
  type Skill = {
    skill: string;
    years: string;
    months: string;
    description: string;
  };

  // State initialization

  const [skills, setSkills] = useState([
    {
      skill: "",
      yearsOfExperience: "",
      monthsOfExperience: "",
      description: "",
    },
  ]);

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;
    setSkills(updatedSkills);
  };
  
  const handleRemoveSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };
  // Add a new empty skill form
  const handleAddSkill = () => {
    setSkills([
      ...skills,
      {
        skill: "",
        yearsOfExperience: "",
        monthsOfExperience: "",
        description: "",
      },
    ]);
  };
  
  const fetchWeekdays = async () => {
    try {
      const response = await fetch(
        "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Weekday"
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setWeekdays(result.data);
      }
    } catch (error) {
      console.error("Error fetching weekdays:", error);
    }
  };
  useEffect(() => {
    fetchWeekdays();
    }, []);
  

  // Update a specific skill in the array
 

  const addForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        id: Date.now(),
        language: '',
        abilities: { read: false, write: false, speak: false },
      },
    ]);
  };

  const [savedLanguages, setSavedLanguages] = useState(
    JSON.parse(localStorage.getItem('savedLanguages') || '[]'),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [showForm, setShowForm] = useState(true);
  const [isPopupVisible, setPopupVisible] = useState(false);

  // time slots

 

  

  const removeForm = (id) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== id));
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  
    const updatedErrors = [...errors];
    if (updatedErrors[index]?.[field] && value.trim() !== "") {
      updatedErrors[index][field] = ""; // Clear error on correction
      setErrors(updatedErrors);
    }
  };
  


  const handleAddressSubmit = async (): Promise<{ isValid: boolean; errors: AddressError[] }> => {
    const userID = sessionStorage.getItem("userID");
    const doctorID = sessionStorage.getItem("doctorID");

    if (!userID) {
      alert("User not logged in. Please log in again.");
      return { isValid: false, errors: [] };
    }
  
    if (!addresses || addresses.length === 0) {
      alert("No addresses to submit.");
      return { isValid: false, errors: [] };
    }
  
    const newErrors: AddressError[] = addresses.map((address) => ({
      addressType: !address.addressType ? "Address type is required." : "",
      address1: !address.address1 ? "Address Line 1 is required." : "",
      city: !address.city ? "City is required." : "",
      zipCode: !address.zipCode
        ? "ZIP Code is required."
        : !/^\d{6}$/.test(address.zipCode)
        ? "ZIP Code must be exactly 6 digits."
        : "",
    }));
  
    setErrors(newErrors); // Set field-specific errors
  
    const isValid = newErrors.every((error) => Object.values(error).every((msg) => !msg));
    if (!isValid) {
      console.warn("⚠️ Validation errors:", newErrors);
      return { isValid: false, errors: newErrors };
    }
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Patient/SaveAddress",
        addresses.map((address) => ({ ...address, createdBy: userID,id:doctorID, }))
      );
  
      console.log("✅ Addresses saved:", response.data);
      alert("Addresses saved successfully!");
      return { isValid: true, errors: [] };
    } catch (error) {
      console.error("🚨 API Error:", error);
      alert("Failed to save addresses.");
      return { isValid: false, errors: [] };
    }
  };
  
  
  
  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        addressType: "TemporaryAddress",
        type: "Patient",
        address1: "", // Required
        address2: "",
        city: "", // Required
        district: "",
        state: "",
        zipCode: "", // Renamed from 'pincode'
        isActive: true,
        degreeName: "",
        university: "",
        location: "",
        startDate: null, // Added startDate field
        endDate: null, // Added endDate field
        isHighestEducation: true,
      },
    ]);
  };
  

 

  const removeAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };

  

  const handleDateChange = (date: Date | null): void => {
    setSelectedDate(date);
    setFormData((prevData) => ({ ...prevData, date }));
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleComplete = () => {
    console.log('Form completed!');
    setPopupVisible(true);
  };

 
  

 

 
  

const isFormValid = Object.values(formErrors).every((error) => error === "") &&
                    Object.values(formData).every((value) => value !== "");


  // Handle input change for form data
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    // Validate the changed field
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),  // Call field-specific validation
    }));
  };
  
  


 
  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // ✅ Should show the array of hospitals
        if (Array.isArray(data)) {
          setHospitals(data); // Set hospitals directly
        } else {
          console.warn("Unexpected data structure:", data);
          setHospitals([]); // Fallback for safety
        }
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);
  

   // Fetch and set user roles to determine if user is a SuperAdmin
    useEffect(() => {
      
       const userID = sessionStorage.getItem("userID");
    const tenantID = sessionStorage.getItem("tenantID");
  
    console.log("UserID from session:", userID);
    console.log("TenantID from session:", tenantID);
      if (!userID) {
        console.error("User ID not found in session storage.");
        return;
      }
  
      const fetchUserRoles = async () => {
        try {
          const roleResponse = await fetch(
            `https://predart003-001-site1.anytempurl.com/api/UserRoles/${userID}`
          );
          if (!roleResponse.ok) {
            throw new Error("Failed to fetch user roles.");
          }
          const roleData = await roleResponse.json();
  
          if (
            roleData.success &&
            Array.isArray(roleData.data) &&
            roleData.data.length > 0
          ) {
            const roleIDs = roleData.data.map((item) => item.roleID);
  
            // Fetch role names for each role ID
            const roleNamesPromises = roleIDs.map(async (roleID) => {
              const roleResponse = await fetch(
                `https://predart003-001-site1.anytempurl.com/api/Role/${roleID}`
              );
              if (!roleResponse.ok) {
                console.error(`Failed to fetch role for roleID: ${roleID}`);
                return null;
              }
              const roleInfo = await roleResponse.json();
              return roleInfo?.data?.roleName || `Unknown Role (${roleID})`;
            });
  
            const resolvedRoleNames = await Promise.all(roleNamesPromises);
            // Set isSuperAdmin to true if the resolved roles include "SuperAdmin"
            setIsSuperAdmin(resolvedRoleNames.includes("SuperAdmin"));
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      };
  
      fetchUserRoles();
    }, []);
  
  
    useEffect(() => {
      fetch('https://predart003-001-site1.anytempurl.com/api/Tenant')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Tenant Data:', data);
          const tenantList = data.data || data; // Adjust based on API structure
          setTenants(tenantList);
          
          const storedTenantID = sessionStorage.getItem('tenantID');
          if (storedTenantID) {
            const tenantExists = tenantList.find(
              (tenant) => tenant.tenantID === storedTenantID || tenant.id === storedTenantID
            );
            if (tenantExists) {
              setFormData((prev) => ({ ...prev, tenant: storedTenantID }));
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching tenant data:', error);
        });
    }, []);
  
  
  

 
  const handleFormInputChange = (index: number, field: string, value: string) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  
    const fieldErrors = validateEducationFields(updatedAddresses[index]);
    const updatedErrors = [...errors];
    updatedErrors[index] = fieldErrors;
    setErrors(updatedErrors); // Show error immediately on change
  };
  

  

  
  const handleAbilitiesChange = (
    index: number,
    abilityType: "read" | "write" | "speak",
    value: string
  ) => {
    const updatedForms = [...forms];
    updatedForms[index].abilities[abilityType] = value;
    setForms(updatedForms);
  
    if (errors[index]?.[abilityType]) {
      const updatedErrors = [...errors];
      updatedErrors[index][abilityType] = "";
      setErrors(updatedErrors);
    }
  };
  
  
  useEffect(() => {
    const fetchEducationData = async () => {
      try {
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation?doctorId=${doctorID}`
        );
        setEducationData(response.data); // Assuming the response is an array of education records
      } catch (error) {
        console.error("Error fetching education data:", error);
      }
    };
  
    fetchEducationData();
  }, []);

  useEffect(() => {
    if (educationData.length > 0) {
      const firstEducation = educationData[0]; // Use the first education entry or map if multiple
      setAddresses((prev) =>
        prev.map((address, index) => ({
          ...address,
          degreeName: firstEducation.degreeName || "",
          location: firstEducation.location || "",
          university: firstEducation.university || "",
          startDate: firstEducation.startDate || "",
          endDate: firstEducation.endDate || "",
        }))
      );
    }
  }, [educationData]);
  


  const validateEducationFields = (education: any) => {
    const errors: Record<string, string> = {};
  
    if (!education.degreeName?.trim()) {
      errors.degreeName = "Degree name is required.";
    }
  
    if (!education.location?.trim()) {
      errors.location = "Location is required.";
    }
  
    if (!education.university?.trim()) {
      errors.university = "University name is required.";
    }
  
    if (!education.startDate) {
      errors.startDate = "Start date is required.";
    } else if (isFuture(new Date(education.startDate))) {
      errors.startDate = "Start date cannot be in the future.";
    }
  
    if (!education.endDate) {
      errors.endDate = "End date is required.";
    } else if (isFuture(new Date(education.endDate))) {
      errors.endDate = "End date cannot be in the future.";
    } else if (
      education.startDate &&
      differenceInMonths(new Date(education.endDate), new Date(education.startDate)) < 6
    ) {
      errors.endDate = "The period between start and end date should exceed 6 months.";
    }
  
    return errors;
  };

  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in.");
      return;
    }
  
    const allErrors = addresses.map(validateEducationFields);
    setErrors(allErrors); // Update error state first
  
    const hasErrors = allErrors.some((error) => Object.keys(error).length > 0);
    if (hasErrors) {
      console.warn("🚨 Validation failed:", allErrors);
      return; // Stop submission if there are errors
    }
  
    try {
      const educationData = addresses.map((address) => ({
        createdBy: userID,
        tenantID: formData.tenant,
        doctorID: doctorID,
        graduateID: "17dd8bbe-0b29-4dc3-6321-08dd36ae8848",
        degreeName: address.degreeName.trim(),
        specializationID: "10779537-727c-44e1-6327-08dd36ae8848",
        location: address.location.trim(),
        universityName: address.university.trim(),
        startDate: new Date(address.startDate).toISOString().split("T")[0],
        endDate: new Date(address.endDate).toISOString().split("T")[0],
        isHighestEducation: Boolean(address.isHighestEducation),
      }));
  
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation",
        educationData,
        { headers: { "Content-Type": "application/json" } }
      );
  
      if ([200, 201].includes(response.status)) {
        console.log("✅ Education Data Saved:", response.data);
        setSuccessMessage("Doctor education details saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Unexpected error. Try again.");
      }
    } catch (error) {
      console.error("🚨 API Error:", error);
      setSuccessMessage("Error saving education details.");
    }
  };
  

  
const validateLanguageForm = (form: any) => {
  const errors: Record<string, string> = {};

  if (!form.language) {
    errors.language = "Language is required.";
  }
  if (!form.abilities.read) {
    errors.read = "Read ability is required.";
  }
  if (!form.abilities.write) {
    errors.write = "Write ability is required.";
  }
  if (!form.abilities.speak) {
    errors.speak = "Speak ability is required.";
  }

  return errors;
};
const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in.");
      return;
    }

    const allErrors = forms.map((form) => {
      const error: any = {};
      if (!form.language) error.language = "Language is required";
      return error;
    });

    const hasErrors = allErrors.some((err) => Object.keys(err).length > 0);
    setErrors(allErrors);

    if (hasErrors) {
      setSuccessMessage("Please correct the highlighted errors.");
      return;
    }

    try {
      const apiDataArray = forms.map((form) => ({
        createdBy: userID,
        id: doctorID, // Replace with actual doctorID variable
        type: "doctor",
        languageMasterID: form.language,
        read: form.abilities.read,
        write: form.abilities.write,
        speak: form.abilities.speak,
      }));

      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveLanguage",
        apiDataArray,
        { headers: { "Content-Type": "application/json" } }
      );

      if ([200, 201].includes(response.status)) {
        setSuccessMessage("Language data saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Unexpected error. Try again.");
      }
    } catch (error) {
      console.error("🚨 API Error:", error);
      setSuccessMessage("Error saving language details.");
    }
  };

  
const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
  setExperience((prevExperience) => {
    const updatedExperience = [...prevExperience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    return updatedExperience;
  });

  setExperienceErrors((prevErrors) => {
    const updatedErrors = [...prevErrors];
    if (!updatedErrors[index]) updatedErrors[index] = {};
    
    switch (field) {
      case "hospitalName":
        updatedErrors[index][field] = value.trim() ? "" : "Hospital name is required.";
        break;
      case "joinDate":
        updatedErrors[index][field] = !value
          ? "Join date is required."
          : new Date(value) > new Date()
          ? "Join date cannot be in the future."
          : "";
        break;
      case "leaveDate":
        const joinDate = new Date(experience[index]?.joinDate);
        const leaveDate = new Date(value);
        if (!value) {
          updatedErrors[index][field] = "Leave date is required.";
        } else if (leaveDate > new Date()) {
          updatedErrors[index][field] = "Leave date cannot be in the future.";
        } else if (experience[index].joinDate && leaveDate < joinDate) {
          updatedErrors[index][field] = "Leave date cannot be before join date.";
        } else {
          const monthsDiff =
            (leaveDate.getFullYear() - joinDate.getFullYear()) * 12 +
            (leaveDate.getMonth() - joinDate.getMonth());
          updatedErrors[index][field] = monthsDiff < 6 ? "Minimum 6-month gap required." : "";
        }
        break;
    }
    return updatedErrors;
  });
};

const handleExperienceSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const userID = sessionStorage.getItem("userID");
  if (!userID || !doctorID) {
    alert("User not logged in. Please log in again.");
    return;
  }

  const newErrors = experience.map((exp) => {
    const fieldErrors: ExperienceErrors = {};
    if (!exp.hospitalName?.trim()) fieldErrors.hospitalName = "Hospital name is required.";
    if (!exp.joinDate) fieldErrors.joinDate = "Join date is required.";
    if (!exp.leaveDate) fieldErrors.leaveDate = "Leave date is required.";
    return fieldErrors;
  });

  setExperienceErrors(newErrors);
  if (newErrors.some((errors) => Object.values(errors).some((msg) => msg))) return;

  const experienceDataArray = experience.map((exp) => ({
    createdBy: userID,
    createdOn: new Date().toISOString(),
    updatedBy: userID,
    updatedOn: new Date().toISOString(),
    isActive: true,
    exprienceID: exp.exprienceID || crypto.randomUUID(),
    doctorID: doctorID,
    employmentType: exp.type,
    specializationID: "10779537-727c-44e1-6327-08dd36ae8848",
    hospitalName: exp.hospitalName.trim(),
    joinDate: new Date(exp.joinDate).toISOString(),
    leaveDate: new Date(exp.leaveDate).toISOString(),
  }));

  try {
    const response = await axios.post(
      "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorExprience",
      experienceDataArray,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200 || response.status === 201) {
      alert("✅ Experience saved successfully!");
      setExperienceErrors([]);
    } else {
      console.error("Unexpected response:", response.status);
      alert("❌ Failed to save experience. Please try again.");
    }
  } catch (error: any) {
    console.error("🚨 API error:", error.response?.data || error.message);
    alert("API error: Unable to save experience.");
  }
};
  
  
  
  
  
  
  const [skillErrors, setSkillErrors] = useState(
    skills.map(() => ({
      yearsOfExperience: "",
      monthsOfExperience: "",
      description: "",
    }))
  );

  const handleSkillInputChange = (index: number, field: string, value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;

    const updatedErrors = [...skillErrors];
    updatedErrors[index][field] = value.trim() ? "" : `${field} is required`;

    setSkills(updatedSkills);
    setSkillErrors(updatedErrors);
  };
  const validateSkills = () => {
    const updatedErrors = skills.map((skill) => {
      const errors: Record<string, string> = {};
  
      // ✅ Validate Years of Experience (01 to 50)
      if (!skill.yearsOfExperience.trim()) {
        errors.yearsOfExperience = "Years of experience is required.";
      } else if (!/^\d{2}$/.test(skill.yearsOfExperience)) {
        errors.yearsOfExperience = "Enter a valid 2-digit year (01-50).";
      } else if (Number(skill.yearsOfExperience) < 1 || Number(skill.yearsOfExperience) > 50) {
        errors.yearsOfExperience = "Year must be between 01 and 50.";
      }
  
      // ✅ Validate Months of Experience (01 to 12)
      if (!skill.monthsOfExperience.trim()) {
        errors.monthsOfExperience = "Months of experience is required.";
      } else if (!/^(0[1-9]|1[0-2])$/.test(skill.monthsOfExperience)) {
        errors.monthsOfExperience = "Enter a valid month (01-12).";
      }
  
      // ✅ Validate Description
      if (!skill.description.trim()) {
        errors.description = "Description is required.";
      }
  
      return errors;
    });
  
    setSkillErrors(updatedErrors);
  
    // ✅ Return true if no errors exist
    return updatedErrors.every(
      (err) => !err.yearsOfExperience && !err.monthsOfExperience && !err.description
    );
  };
  

  const handleSkillSubmit = async (e) => {
    e.preventDefault();

    if (!validateSkills()) {
      console.error("🚨 Validation failed.");
      return;
    }

    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in. Please log in again.");
      return;
    }

    const apiSkillsData = skills.map((skill) => ({
      createdBy: userID,
      doctorID:doctorID, // Replace with actual doctorID
      skillMasterID: "10779537-727c-44e1-6327-08dd36ae8848",
      yearOfExperience: skill.yearsOfExperience,
      monthOfExperience: skill.monthsOfExperience,
      description: skill.description.trim(),
    }));

    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorSkill",
        apiSkillsData,
        { headers: { "Content-Type": "application/json" } }
      );

      if ([200, 201].includes(response.status)) {
        console.log("✅ Skill Data Saved Successfully:", response.data);
      } else {
        console.error("❌ Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("🚨 Error submitting skill details:", error?.response?.data || error.message);
    }
  };
  
  
 // Function to handle form submission
 const handleAwardSubmit = async (
  e: React.FormEvent
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  e.preventDefault();

  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return { isValid: false, errors: { general: "User not logged in." } };
  }

  if (!Array.isArray(awards) || awards.length === 0) {
    console.error("🚨 No awards data available.");
    return { isValid: false, errors: { general: "Please add at least one award." } };
  }

  let isValid = true;
  const errors: Record<string, string> = {};

  const apiAwardsData = awards.map((award, index) => {
    const fieldPrefix = `award_${index}`;

    // Award Name Validation
    if (!award.awardName?.trim()) {
      errors[`${fieldPrefix}_awardName`] = "Award name is required.";
      isValid = false;
    } else if (award.awardName.trim().length < 3) {
      errors[`${fieldPrefix}_awardName`] = "Award name must be at least 3 characters long.";
      isValid = false;
    }

   // Year Validation
if (!award.year) {
  errors[`${fieldPrefix}_awardYear`] = "Award year is required.";
  isValid = false;
} else if (!/^\d{4}$/.test(String(award.year).trim())) {  // ✅ Convert to string + trim
  errors[`${fieldPrefix}_awardYear`] = "Enter a valid 4-digit year.";
  isValid = false;
}


    // Description Validation
    if (!award.description?.trim()) {
      errors[`${fieldPrefix}_description`] = "Description is required.";
      isValid = false;
    } else if (award.description.trim().length < 10) {
      errors[`${fieldPrefix}_description`] = "Description must be at least 10 characters long.";
      isValid = false;
    }

    return {
      createdBy: userID,
      doctorID: doctorID,
      awardName: award.awardName.trim(),
      awardYear: award.year,
      description: award.description.trim(),
    };
  });

  setFormErrors(errors); // Update form errors to display below each field as the user types and on submit

  if (!isValid) {
    return { isValid: false, errors };
  }

  try {
    const response = await axios.post(
      "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorAward",
      apiAwardsData,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("✅ Award Data Saved Successfully:", response.data);
      return { isValid: true, errors: {} };
    } else {
      console.error("❌ Unexpected response status:", response.status);
      return { isValid: false, errors: { general: "Failed to save award details." } };
    }
  } catch (error) {
    console.error("🚨 Error submitting award details:", error?.response?.data || error.message);
    return { isValid: false, errors: { general: "Error submitting award details." } };
  }
};



const handleSubmit = async () => {
  const userID = sessionStorage.getItem("userID");

  if (!userID) {
    alert("User not logged in. Please log in again.");
    return;
  }

  
  const timestamp = new Date().toISOString();

  // 🛡️ Validation: Check for missing fields
  for (let slot of timeSlots) {
    if (!slot.hospital || !slot.day || !slot.fromTime || !slot.toTime || !slot.duration) {
      alert("Please fill all fields for each time slot before submitting.");
      return;
    }

    // 🕒 Validation: From Time < To Time
    if (slot.fromTime >= slot.toTime) {
      alert(`Invalid time range on ${slot.day}: 'From Time' must be earlier than 'To Time'.`);
      return;
    }
  }

  // 🚫 Validation: No overlapping slots for the same day
  const hasOverlap = timeSlots.some((slot, index) => {
    return timeSlots.some((compareSlot, compareIndex) => {
      if (index !== compareIndex && slot.day === compareSlot.day) {
        const fromA = slot.fromTime.getTime();
        const toA = slot.toTime.getTime();
        const fromB = compareSlot.fromTime.getTime();
        const toB = compareSlot.toTime.getTime();

        return (fromA < toB && toA > fromB); // Overlap condition
      }
      return false;
    });
  });

  if (hasOverlap) {
    alert("Overlapping time slots detected for the same day. Please adjust the timings.");
    return;
  }

  // ✅ Prepare Payload
  const payload = timeSlots.map((slot) => ({
    createdBy: userID,
    createdOn: timestamp,
    updatedBy: userID,
    updatedOn: timestamp,
    doctorID: doctorID,
    hospitalID: slot.hospital,
    dayofWeek: slot.day,
    fromTime: slot.fromTime.toLocaleTimeString("en-US", { hour12: false }),
    toTime: slot.toTime.toLocaleTimeString("en-US", { hour12: false }),
    slotDuration: slot.duration.toString(),
    isActive: true,
  }));

  console.log("Payload:", JSON.stringify(payload, null, 2));

  // 🚀 Submit to API
  try {
    const response = await fetch(
      "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorTimeSlot",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("Time slots saved successfully!");
      console.log("Success:", result);
    } else {
      alert(`Failed to save: ${result?.message || "Unknown error"}`);
      console.error("Error:", result);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("An error occurred while saving. Please try again.");
  }
};



  
  // Handle input changes in the form
  
  const handleMultipleFormsInputChange = (formId, field, value) => {
    console.log(`🔍 Updating Form ID: ${formId}, Field: ${field}, Value: ${value}`);  // Debugging
  
    setForms(
      forms.map((form) =>
        form.id === formId ? { ...form, [field]: value } : form
      )
    );
  };
  
  
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetLanguage?doctorId=${doctorID}`
        );
        const languages = response.data?.data || [];
        setLanguageOptions(languages);
        console.log("Languages fetched:", languages);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
  
    fetchLanguages();
  }, [doctorID]);

  // 📝 Handle language dropdown change
 
  const handleLangFormInputChange = (index: number, field: string, value: string) => {
    setForms((prevForms) => {
      const updatedForms = prevForms.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      );
  
      // ✅ Immediate validation after form update
      const fieldErrors = validateEducationFields(updatedForms[index]);
      setErrors((prevErrors) => {
        const updatedErrors = [...prevErrors];
        updatedErrors[index] = fieldErrors;
        return updatedErrors;
      });
  
      return updatedForms;
    });
  };

  // ✅ Handle checkbox change
  const handleCheckboxChange = (formId, ability) => {
    const updatedForms = forms.map((form) =>
      form.id === formId
        ? { ...form, abilities: { ...form.abilities, [ability]: !form.abilities[ability] } }
        : form
    );
    setForms(updatedForms);
  };
  
  
  
  

  const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepSubmit = async (
    e: React.FormEvent,
    handleNext: () => void,
    skipValidation = false // 🚀 Default value for skipping validation
  ) => {
    e.preventDefault();
  
    let validationResult: { isValid: boolean; errors: Record<string, string> } = {
      isValid: false,
      errors: {},
    };
  
    try {
      if (!skipValidation) {
        if (currentStep === 1) {
          // ✅ Step 1: Address & Registration
          const addressResult = await handleAddressSubmit();
          const registerResult = await handleRegister(e);
  
          validationResult = {
            isValid: addressResult.isValid && registerResult.isValid,
            errors: { ...addressResult.errors, ...registerResult.errors },
          };
  
        } else if (currentStep === 2) {
          // ✅ Step 2: Education & Language
          const educationResult = await handleEducationSubmit(e);
          const formResult = await handleFormSubmit(e);
  
          validationResult = {
            isValid: educationResult.isValid && formResult.isValid,
            errors: { ...educationResult.errors, ...formResult.errors },
          };
  
        } else if (currentStep === 3) {
          // ✅ Step 3: Experience & Skills
          const experienceResult = await handleExperienceSubmit(e);
          const skillResult = await handleSkillSubmit(e);
  
          validationResult = {
            isValid: experienceResult.isValid && skillResult.isValid,
            errors: { ...experienceResult.errors, ...skillResult.errors },
          };
        } else if (currentStep === 4) {
          // ✅ Step 4: Awards (Newly Added)
          const awardResult = await handleAwardSubmit(e);
  
          validationResult = {
            isValid: awardResult.isValid,
            errors: { ...awardResult.errors },
          };
        }
      } else {
        validationResult.isValid = true; // 🚀 Skip validation if requested
      }
  
      if (validationResult.isValid) {
        handleNext(); // ✅ Move to next step
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      } else {
        console.warn("⚠️ Missing or invalid fields:", validationResult.errors);
        setFormErrors(validationResult.errors);
  
        if (skipValidation) {
          handleNext(); // 🚀 Move on even if errors exist
          setCurrentStep((prev) => prev + 1);
        }
      }
  
    } catch (error) {
      console.error("🚨 Error saving data:", error);
    }
  };
  
  
  useEffect(() => {
    if (!doctorID) {
      setError("No doctor ID found. Please register first.");
      setLoading(false);
      return;
    }
  
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/${doctorID}`
        );
  
        if (response.status === 200 || response.status === 201) {
          setDoctorDetails(response.data.data);
        } else {
          setError("Failed to fetch doctor details.");
        }
      } catch (err) {
        console.error("Error fetching doctor details:", err);
        setError("Error occurred while fetching doctor details.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDoctorDetails();
  }, [doctorID]);

  if (loading) return <p>Loading doctor details...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
 
  
  
  
  
  // ✅ Next button template
  const nextButtonTemplate = (handleNext: () => void) => (
    <form onSubmit={(e) => handleStepSubmit(e, handleNext)}>
      {/* 🚀 Next button with validation */}
      <button type="submit" className="base-button">
        Next
      </button>
  
      {/* 🛡️ Skip & Next button without validation */}
      <button
        type="button"
        className="base-button skip-button"
        onClick={(e) => handleStepSubmit(e, handleNext, true)}
        style={{ marginLeft: "10px" }}
      >
        Skip & Next
      </button>
    </form>
  );
  
  
  // ✅ Finish button template
  const finishButtonTemplate = (handleComplete: () => void) => (
    <button className="finish-button" onClick={handleComplete}>
      Finish
    </button>
  );
  
  // useEffect(() => {
    
  //   const generatedSteps = formSections.map((section) => ({
  //     label: section,
  //   }));
  
  //   setSteps(generatedSteps);
  // }, []);



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
</div>

  return (
    <div className="bg-white min-h-screen">
      <div className="container">
        <>
        <FormWizard
   shape="circle"
   color="#2196f3"
   stepSize="sm"
   onComplete={handleComplete}
   backButtonTemplate={backTemplate}
   nextButtonTemplate={nextButtonTemplate}
   finishButtonTemplate={finishButtonTemplate}
>
            {/* Step 1*/}
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
              <form className="space-y-4">
                {/* User Info */}

                {/* Tenant */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Tenant */}
  <div>
  {isSuperAdmin && (
  <div>
    <select
      name="tenant"
      value={formData.tenant}
      onChange={(e) =>
        setFormData({ ...formData, tenant: e.target.value })
      }
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                 text-black outline-none focus:border-primary dark:border-form-strokedark 
                 dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Tenant</option>
      {tenants.map((tenant) => (
        <option
          key={tenant.tenantID || tenant.id}
          value={tenant.tenantID || tenant.id}
        >
          {tenant.tenantName || tenant.name || "Unnamed Tenant"}
        </option>
      ))}
    </select>
    {errors.tenant && <div className="error">{errors.tenant}</div>}
  </div>
)}

{!isSuperAdmin && (
  <div>
    <select
      disabled
      name="tenant"
      value={formData.tenant}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                 text-black outline-none focus:border-primary dark:border-form-strokedark 
                 dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      {tenants.map((tenant) => (
        <option
          key={tenant.tenantID || tenant.id}
          value={tenant.tenantID || tenant.id}
        >
          {tenant.tenantName || tenant.name || "Default Tenant"}
        </option>
      ))}
    </select>
  </div>
)}
    {formErrors.tenant && <p className="text-red-500 text-sm">{formErrors.tenant}</p>}
  </div>

  {/* Hospital */}
  <div>
  <select
  name="hospital"
 
  value={doctorDetails ? doctorDetails.hospitalID : formData.hospital}
  onChange={handleInputChange}
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="">Select Hospital</option>
  {hospitals.length > 0 ? (
    hospitals.map((hospital) => (
      <option key={hospital.hospitalID} value={hospital.hospitalID}>
        {hospital.hospitalName}
      </option>
    ))
  ) : (
    <option value="">No Hospitals Available</option>
  )}
</select>

     {formErrors.hospital && <p className="text-red-500 text-sm">{formErrors.hospital}</p>}
  </div>

  {/* Name */}
  <div>
  <input
    type="text"
    name="name"
    value={doctorDetails ? doctorDetails.doctorName : formData.name}
    onChange={handleInputChange}
    placeholder="Enter your name"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
</div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Email */}
  <div>
    <input
      type="email"
      name="email"
      
      value={doctorDetails ? doctorDetails.doctorEmail : formData.email}
      onChange={handleInputChange}
      placeholder="Enter your email"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
  </div>

  {/* Phone */}
  <div>
    <input
      type="tel"
      name="phone"
      
      value={doctorDetails ? doctorDetails.doctorPhoneNumber : formData.phone}
      onChange={handleInputChange}
      placeholder="Enter your number"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
  </div>

  {/* Aadhaar */}
  <div>
    <input
      type="text"
      name="aadhaar"
      
      value={doctorDetails ? doctorDetails.aadhaarNumber : formData.aadhaar}
      onChange={handleInputChange}
      placeholder="Enter your Aadhaar"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.aadhaar && <p className="text-red-500 text-sm">{formErrors.aadhaar}</p>}
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Qualification */}
  <div>
    <select
      name="qualification"
     
  value={doctorDetails ? doctorDetails.qualificationID : formData.qualification}
      onChange={handleInputChange}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Qualification</option>
      {qualifications.map((qual) => (
        <option key={qual.appLOVID} value={qual.appLOVID}>
          {qual.name}
        </option>
      ))}
    </select>
     {formErrors.qualification && <p className="text-red-500 text-sm">{formErrors.qualification}</p>}
  </div>

  {/* Specialization */}
  <div>
    <select
      name="specialization"
      
       
  value={doctorDetails ? doctorDetails.specializationID : formData.specialization}
      onChange={handleInputChange}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Specialization</option>
      {specializations.length > 0 ? (
        specializations.map((item) => (
          <option key={item.appLOVID} value={item.appLOVID}>
            {item.name}
          </option>
        ))
      ) : (
        <option value="">No Specializations Available</option>
      )}
    </select>
     {formErrors.specialization && <p className="text-red-500 text-sm">{formErrors.specialization}</p>}
  </div>

  {/* PAN */}
  <div>
    <input
      type="text"
      name="pan"
    
      value={doctorDetails ? doctorDetails.panNumber : formData.pan}
      onChange={handleInputChange}
      placeholder="Enter your PAN"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.pan && <p className="text-red-500 text-sm">{formErrors.pan}</p>}
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
  {/* Date of Birth */}
  <div>
  <input
    type="date"
    name="DateOfBirth"
    value={
      doctorDetails
        ? doctorDetails.doctorDateOfBirth.split("T")[0]
        : formData.DateOfBirth
    }
    onChange={handleInputChange}
    placeholder="Enter your date of birth"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
  {formErrors.DateOfBirth && <p className="text-red-500 text-sm">{formErrors.DateOfBirth}</p>}
</div>


  {/* Gender */}
  <div>
    <select
      name="gender"
     
      value={doctorDetails ? doctorDetails.genderID : formData.gender}
      onChange={handleInputChange}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Gender</option>
      {genderOptions.length > 0 ? (
        genderOptions.map((item) => (
          <option key={item.appLOVID} value={item.appLOVID}>
            {item.name}
          </option>
        ))
      ) : (
        <option value="">No Genders Available</option>
      )}
    </select>
     {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
  </div>
</div>


                {/* Address List */}
                <h2 className="text-lg font-bold text-black-700 text-left mt-8">
                  Address
                </h2>
                       {addresses.map((address, index) => (
                  <div
                    key={index}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {/* Address Type Dropdown */}
                    <div className="flex justify-between items-center mb-4">
                      <select
                        className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={address.type}
                        onChange={(e) =>
                          handleAddressChange(index, 'type', e.target.value)
                        }
                      >
                        <option value="">Select Address Type</option>
                        {addressTypes.map((type) => (
                          <option key={type.appLOVID} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {errors[index]?.type && <p className="error-text">{errors[index].type}</p>}
                    </div>
                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {/* <label className="block text-sm font-medium text-gray-700">
          Address Line 1
        </label> */}
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.address1}
                          onChange={(e) =>
                            handleAddressChange(index, 'address1', e.target.value)
                          }
                          placeholder="Enter address line 1"
                        />
                         {errors[index]?.address1 && <p className="error-text">{errors[index].address1}</p>}
                      </div>
                      <div>
                        {/* <label className="block text-sm font-medium text-gray-700">
          Address Line 2
        </label> */}
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.address2}
                          onChange={(e) =>
                            handleAddressChange(index, 'address2', e.target.value)
                          }
                          placeholder="Enter address line 2"
                        />
                        {errors[index]?.address2 && <p className="error-text">{errors[index].address2}</p>}
                      </div>
                    </div>

                    {/* City, District, State,pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                      <div>
                        {/* <label className="block text-sm font-medium text-gray-700">
      City
    </label> */}
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.city}
                          onChange={(e) =>
                            handleAddressChange(index, 'city', e.target.value)
                          }
                          placeholder="Enter city"
                        />
                         {errors[index]?.city && <p className="error-text">{errors[index].city}</p>}
                      </div>

                      <div>
                        {/* District Input Field */}
                        <input
                          type="text"
                          placeholder="Enter District"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.district}
                          onChange={(e) =>
                            handleAddressChange(index, 'district', e.target.value)
                          }
                        />
                        
                        {errors[index]?.district && <p className="error-text">{errors[index].district}</p>}
                      </div>

                      <div>
                        {/* State Input Field */}
                        <input
                          type="text"
                          placeholder="Enter State"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.state}
                          onChange={(e) =>
                            handleAddressChange(index, 'state', e.target.value)
                          }
                        />
                        
                        {errors[index]?.state && <p className="error-text">{errors[index].state}</p>}
                      </div>

                      <div>
                        {/* <label className="block text-sm font-medium text-gray-700">
      Pincode 
    </label> */}
                        <input
                          type="text"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.zipCode}
                          onChange={(e) =>
                            handleAddressChange(index, 'zipCode', e.target.value)
                          }
                          placeholder="Enter pincode"
                        />
                        {errors[index]?.zipCode && <p className="error-text">{errors[index].zipCode}</p>}

                      </div>
                    </div>

                    {/* Active Checkbox */}

                    <div className="flex justify-end mt-4">
                      <label className="text-sm font-medium text-gray-700 mr-2">
                        Active
                      </label>
                      <input
                        type="checkbox"
                        className="p-2 border rounded-md"
                        checked={address.isActive || true} // Makes sure it's checked initially
                        onChange={(e) =>
                          handleAddressChange(index, 'isActive', e.target.checked)
                        }
                      />
                    </div>
                  </div>
                ))}
                {/* Add New Address */}
                <div className="flex items-center justify-end gap-1">
                  {/* Clickable Icon */}
                  <div
                    className="flex justify-center items-center h-10 w-10
                     text-white rounded-full cursor-pointer bg-gradient-to-b
                      from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                    onClick={addAddress}
                  >
                    +
                  </div>

                  {/* Non-clickable Text */}
                  <span className="text-sm font-medium text-black-600">
                    Add
                  </span>
                </div>
               
               
                
              </form>

            </FormWizard.TabContent>

            {/* Step 2: Doctor Education */}
            {/* <FormWizard.TabContent title="Doctor Education" icon="ti-book"> */}
            <FormWizard.TabContent
              title="Education"
              icon={
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full 
                cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
                >
                  <i className="fa fa-graduation-cap"></i>
                </div>
              }
            >
              <form className="space-y-4">
                {/* Add New Address */}

                {/* Education */}
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Education
                </h2>

                {addresses.map((address, index) => (
  <div
    key={index}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
  >
    <div className="flex justify-between items-center mb-4">
      {/* Dropdown */}
      <select
        className="w-[80px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={address.type}
        onChange={(e) => handleFormInputChange(index, "type", e.target.value)}
      >
        <option value="UG">UG</option>
        <option value="PG">PG</option>
      </select>

      {/* Checkbox with text */}
      <label className="flex items-center ml-4">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:border-form-strokedark dark:bg-form-input"
          checked={address.isHighestEducation}
          onChange={(e) => handleFormInputChange(index, "isHighestEducation", e.target.checked)}
        />
        <span className="ml-2 text-sm text-gray-700 dark:text-white">
          <b>Is this your highest education</b>
        </span>
      </label>
    </div>

    {/* Degree Name, Specialization, and Location */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-4 items-center">
      {/* Degree Name */}
      <div>
        <input
          type="text"
          value={address.degreeName}
          onChange={(e) => handleFormInputChange(index, "degreeName", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your degree"
        />
       {errors[index]?.degreeName && (
  <p className="text-red-500 text-sm mt-1">{errors[index].degreeName}</p>
)}
      </div>

      {/* Location */}
      <div>
        <input
          type="text"
          value={address.location}
          onChange={(e) => handleFormInputChange(index, "location", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your location"
        />
         {errors[index]?.location && (
              <p className="text-red-500 text-sm mt-1">{errors[index].location}</p>
            )}
      </div>

      {/* University Name */}
      <div>
        <input
          type="text"
          value={address.university}
          onChange={(e) => handleFormInputChange(index, "university", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your university name"
        />
         {errors[index]?.university && (
              <p className="text-red-500 text-sm mt-1">{errors[index].university}</p>
            )}
      </div>

      {/* Starting Date */}
      <div className="relative">
        <DatePicker
          selected={address.startDate ? new Date(address.startDate) : null}
          onChange={(date) => handleFormInputChange(index, "startDate", date)}
          dateFormat="MM/dd/yyyy"
          placeholderText="Starting date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
         {errors[index]?.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors[index].startDate}</p>
            )}
        <span
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          style={{ color: "#c2c3c4" }}
        >
          <i className="fas fa-calendar-alt"></i>
        </span>
      </div>

      {/* Ending Date */}
      <div className="relative">
        <DatePicker
          selected={address.endDate ? new Date(address.endDate) : null}
          onChange={(date) => handleFormInputChange(index, "endDate", date)}
          dateFormat="MM/dd/yyyy"
          placeholderText="Ending date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
         {errors[index]?.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors[index].endDate}</p>
            )}
        <span
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          style={{ color: "#c2c3c4" }}
        >
          <i className="fas fa-calendar-alt"></i>
        </span>
      </div>
    </div>


  </div>
))}


                <div className="flex items-center justify-end gap-1">
                  {/* Clickable Icon */}
                  <div
                    className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer 
                    bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                    onClick={addAddress}
                  >
                    +
                  </div>

                  {/* Non-clickable Text */}
                  <span className="text-sm font-medium text-black-600">
                    Add
                  </span>
                </div>
                {/*LanguageKnown */}

                <h2 className="text-lg font-bold text-black-700 text-left mt-8">
                  Language Known
                </h2>

                <div className="space-y-4">
                {forms.map((form, index) => (
        <div
          key={form.id}
          className="w-150 rounded-lg border border-stroke bg-transparent py-4 px-6 text-black
            outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input 
            dark:text-white dark:focus:border-primary"
        >
          <div className="flex items-center gap-6">
            {/* 🌐 Language Dropdown */}
            <select
  value={forms[index]?.language || ""}
  onChange={(e) => handleLangFormInputChange(index, "language", e.target.value)}
  className="w-70 rounded-lg border border-stroke bg-transparent py-4 pl-8 pr-8 text-black outline-none"
>
  <option value="">-- Select a Language --</option>
  {languageOptions.length > 0 ? (
    languageOptions.map((language) => (
      <option key={language.id} value={language.id}>
        {language.name} {/* Display actual language name */}
      </option>
    ))
  ) : (
    <option disabled>No languages available</option>
  )}
</select>



            {/* 📝 Abilities Checkboxes */}
            <div className="flex gap-8 flex-grow">
              {["read", "write", "speak"].map((ability) => (
                <label key={ability} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.abilities[ability]}
                    onChange={() => handleCheckboxChange(form.id, ability)}
                    className="mr-1"
                  />
                  {ability.charAt(0).toUpperCase() + ability.slice(1)}
                </label>
              ))}
            </div>

            {/* 🚨 Error Message */}
            {errors[index]?.abilities && (
              <p className="text-red-500 text-sm mt-1">{errors[index].abilities}</p>
            )}
          </div>
        </div>
      ))}








                  {/* Add Button */}
                  <div className="flex items-center justify-end gap-1 mt-1 px-80">
                    <div
                      className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                      onClick={addForm}
                    >
                      +
                    </div>
                    <span className="text-sm pr-5 font-medium text-black-600">
                      Add
                    </span>
                  </div>
                </div>

              </form>
            </FormWizard.TabContent>

            {/* Step 3: Doctor Experience */}
            {/* <FormWizard.TabContent title="Doctor Experience" icon="ti-layers"> */}
            <FormWizard.TabContent
              title="Exprience"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-layers"></i>
                </div>
              }
            >
              <form className="space-y-6">
                {/* Doctor Experience Section */}
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Doctor Experience
                </h2>

                <div className="space-y-4">
                {(experience || []).map((exp, index) => (
  <div key={index} className="w-full border border-stroke rounded-lg p-4">

    {/* Work Type Dropdown */}
    <div className="mb-4">
  <select
    value={exp.type}
    onChange={(e) => handleExperienceChange(index, 'type', e.target.value)}
    className="w-full rounded-lg border border-stroke bg-transparent p-2 pl-4 text-black outline-none 
    focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  >
    <option value="">Select Work Type</option>
    {workTypes.map((type) => (
      <option key={type.appLOVID} value={type.appLOVID}>
        {type.name}
      </option>
    ))}
  </select>
  {formErrors.experience?.[`type_${index}`] && (
    <span className="text-red-500 text-sm mt-1 text-left">
      {formErrors.experience[`type_${index}`]}
    </span>
  )}
</div>


    {/* Experience Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      
      {/* Hospital Name */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Hospital Name"
          value={exp.hospitalName}
          onChange={(e) => handleExperienceChange(index, 'hospitalName', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black 
            outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white 
            dark:focus:border-primary"
        />
        {experienceErrors[index]?.hospitalName && (
          <span className="text-red-500 text-sm mt-1">
            {experienceErrors[index]?.hospitalName}
          </span>
        )}
      </div>

      {/* Hospital Dropdown */}
      <div className="w-full">
        <select
          value={formData.hospital}
          onChange={(e) => handleExperienceChange('hospital', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black 
            outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white 
            dark:focus:border-primary"
        >
          <option value="">Select Hospital</option>
          {hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <option key={hospital.hospitalID} value={hospital.hospitalID}>
                {hospital.hospitalName}
              </option>
            ))
          ) : (
            <option value="">No Hospitals Available</option>
          )}
        </select>
        {formErrors.hospital && (
          <span className="text-red-500 text-sm mt-1">{formErrors.hospital}</span>
        )}
      </div>

      {/* Date Picker Row */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Join Date */}
        <div className="relative w-full">
          <DatePicker
            selected={exp.joinDate}
            onChange={(date) => handleExperienceChange(index, 'joinDate', date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Join Date"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black 
              outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white 
              dark:focus:border-primary"
          />
          {experienceErrors[index]?.joinDate && (
            <span className="text-red-500 text-sm mt-1">
              {experienceErrors[index]?.joinDate}
            </span>
          )}
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2" style={{ color: '#c2c3c4' }}>
            <i className="fas fa-calendar-alt"></i>
          </span>
        </div>

        {/* Leave Date */}
        <div className="relative w-full">
          <DatePicker
            selected={exp.leaveDate}
            onChange={(date) => handleExperienceChange(index, 'leaveDate', date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Leave Date"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black 
              outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white 
              dark:focus:border-primary"
          />
          {experienceErrors[index]?.leaveDate && (
            <span className="text-red-500 text-sm mt-1">
              {experienceErrors[index]?.leaveDate}
            </span>
          )}
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2" style={{ color: '#c2c3c4' }}>
            <i className="fas fa-calendar-alt"></i>
          </span>
        </div>
      </div>
    </div>

    {/* Remove Experience Button */}
    {index > 0 && (
      <button
        type="button"
        onClick={() => removeExperience(index)}
        className="mt-4 bg-gradient-to-b from-[#990000] to-[#FF0000] hover:from-[#FF0000] hover:to-[#990000] 
          text-white py-2 px-4 rounded-lg"
      >
        Remove Experience
      </button>
    )}
  </div>
))}

 
                  <div className="flex items-center justify-end gap-1 ">
                    {/* Clickable Icon */}
                    <div
                      className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                      onClick={addExperience}
                    >
                      +
                    </div>

                    {/* Non-clickable Text */}
                    <span className="text-sm font-medium text-black-600">
                      Add
                    </span>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <h2 className="text-lg font-bold text-black-700 text-left">
                    Skills
                  </h2>

                  {/* Initial Persistent Skill Form */}
                  

                  {/* Additional Skill Forms */}
                  {skills.map((skill, index) => (
  <div
    key={index}
    className="border border-stroke p-4 mt-4 rounded-lg"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Skill Dropdown */}
      <div className="w-full">
        <select
          id={`specialization-${index}`}
          name="specialization"
          value={skill.specialization}
          onChange={(e) =>
            handleSkillInputChange(index, 'specialization', e.target.value)
          }
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Specialization</option>
          {specializations.length > 0 ? (
            specializations.map((item) => (
              <option key={item.appLOVID} value={item.appLOVID}>
                {item.name}
              </option>
            ))
          ) : (
            <option value="">No Specializations Available</option>
          )}
        </select>
        {skillErrors[index]?.specialization && (
          <p className="text-red-500 text-sm mt-1">
            {skillErrors[index].specialization}
          </p>
        )}
      </div>

      {/* Years of Experience Input */}
      <div className="w-full">
        <input
          type="number"
          min="0"
          max="20"
          maxLength={2}
          value={skill.yearsOfExperience}
          onChange={(e) =>
            handleSkillInputChange(index, 'yearsOfExperience', e.target.value)
          }
          placeholder="-- Years of Experience --"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        {skillErrors[index]?.yearsOfExperience && (
          <p className="text-red-500 text-sm mt-1">
            {skillErrors[index].yearsOfExperience}
          </p>
        )}
      </div>

      {/* Months of Experience Input */}
      <div className="w-full">
        <input
          type="number"
          min="0"
          max="11"
          value={skill.monthsOfExperience}
          onChange={(e) =>
            handleSkillInputChange(index, 'monthsOfExperience', e.target.value)
          }
          placeholder="-- Months of Experience --"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        {skillErrors[index]?.monthsOfExperience && (
          <p className="text-red-500 text-sm mt-1">
            {skillErrors[index].monthsOfExperience}
          </p>
        )}
      </div>
    </div>

    {/* Description Textarea */}
    <div className="w-full mt-4">
      <textarea
        value={skill.description}
        onChange={(e) =>
          handleSkillInputChange(index, 'description', e.target.value)
        }
        placeholder="Description"
        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 text-black 
        outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {skillErrors[index]?.description && (
        <p className="text-red-500 text-sm mt-1">
          {skillErrors[index].description}
        </p>
      )}
    </div>

    {/* Remove Skill Button */}
    {index > 0 && (
      <button
        type="button"
        onClick={() => handleRemoveSkill(index)}
        className="mt-4 bg-gradient-to-b from-[#990000] to-[#FF0000] hover:from-[#FF0000] hover:to-[#990000] 
        text-white py-2 px-4 rounded-lg"
      >
        Remove Skill
      </button>
    )}
  </div>
))}


                         
                  {/* Add Button */}
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <div
                      className="flex justify-center items-center h-10 w-10 text-white 
                      rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]
                       hover:from-[#007BFF] hover:to-[#004A99]"
                      onClick={handleAddSkill}
                    >
                      +
                    </div>
                    <span className="text-sm font-medium text-black-600">
                      Add
                    </span>
                  </div>
                </div>
              </form>
            </FormWizard.TabContent>

            {/* Step 4: Doctor Awards */}
            {/* <FormWizard.TabContent title="Doctor Awards" icon="ti-crown"> */}
            <FormWizard.TabContent
              title="Awards"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-crown"></i>
                </div>
              }
            >
              <form className="space-y-4">
                <h2 className="text-lg font-bold text-black-700 text-left">
                  Awards and Recognitions
                </h2>

               {awards.map((award, index) => (
  <div
    className="w-150 rounded-lg border border-stroke bg-transparent py-4 px-6
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
    key={index}
  >
    <div className="flex gap-4">
      {/* Award Name Input */}
      <div className="flex-1">
        <input
          type="text"
          value={award.awardName}
          onChange={(e) =>
            updateAwardField(index, 'awardName', e.target.value)
          }
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-4 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter award name"
          required
        />
        {formErrors[`award_${index}_awardName`] && (
          <p className="text-red-500 text-sm mt-1">
            {formErrors[`award_${index}_awardName`]}
          </p>
        )}
      </div>

      {/* Year Input */}
      <div className="flex-1">
        <input
          type="text"
          value={award.year}
          onChange={(e) =>
            updateAwardField(index, 'year', e.target.value)
          }
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-4 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter year"
          required
        />
        {formErrors[`award_${index}_awardYear`] && (
          <p className="text-red-500 text-sm mt-1">
            {formErrors[`award_${index}_awardYear`]}
          </p>
        )}
      </div>
    </div>

    {/* Description Input */}
    <div className="mt-4">
      <textarea
        value={award.description}
        onChange={(e) =>
          updateAwardField(index, 'description', e.target.value)
        }
        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        placeholder="Enter description"
        rows={3}
        required
      />
      {formErrors[`award_${index}_description`] && (
        <p className="text-red-500 text-sm mt-1">
          {formErrors[`award_${index}_description`]}
        </p>
      )}
    </div>
  </div>
))}



                <div className="flex items-center justify-end gap-1 mt-2 px-80">
                  <div
                    className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer
       bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                    onClick={addAward}
                  >
                    +
                  </div>
                  <span className="text-sm font-medium pr-5 text-black-600">
                    Add
                  </span>
                </div>
              </form>
            </FormWizard.TabContent>

            {/* Step 5: Doctor slot */}
            {/* <FormWizard.TabContent title="Doctor slot" icon="ti-crown"> */}
            <FormWizard.TabContent
              title="Time Slots"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="far fa-clock"></i>
                </div>
              }
            >
              
              <div className="col-span-2">

                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-center border border-stroke rounded-lg p-4 bg-transparent dark:border-form-strokedark dark:bg-form-input"
                      >
                        {/* Day Selection */}
                        <select
                          value={slot.day}
                          onChange={(e) => handleChange(index, "day", e.target.value)}
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
                          onChange={(e) => handleChange(index, "hospital", e.target.value)}
                          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select Hospital</option>
                          {hospitals.map((hospital) => (
                            <option key={hospital.hospitalID} value={hospital.hospitalID}>
                              {hospital.hospitalName}
                            </option>
                          ))}
                        </select>
              
                        {/* Duration Input */}
                        <input
                          type="text"
                          placeholder="Duration (mins)"
                          value={slot.duration}
                          onChange={(e) => handleChange(index, "duration", e.target.value)}
                          className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
              
                        {/* From Time Picker */}
                        <DatePicker
                          selected={slot.fromTime}
                          onChange={(time) => handleChange(index, "fromTime", time)}
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
                          onChange={(time) => handleChange(index, "toTime", time)}
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
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Time Slots
                      </button>
                    </div>
                  </div>
            </FormWizard.TabContent>

            {/* Step 6: Doctor Documents */}
            <FormWizard.TabContent
              title="Documents"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-file"></i>
                </div>
              }
            >
              <DocumentUpload /> 
            </FormWizard.TabContent>
          </FormWizard>

          {/* Popup */}
          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
                <h3 className="text-xl font-bold">
                  Profile Completed Successfully
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Inline styles */}
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
          background-color: ${isFormValid ? "#4CAF50" : "#ccc"};
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: ${isFormValid ? "pointer" : "not-allowed"};
          border: none;
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
      </div>
    </div>
  );
};

export default DoctorFormWizard;
