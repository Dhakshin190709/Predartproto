import React, { useState, useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';


const DoctorFormWizard: React.FC = () => {
  const [languages, setLanguages] = useState([]);
  const doctorID = "871f2ad1-649d-4268-65a2-08dd41b6b422"; // Define at component level
  //const [doctorID, setdoctorID] = useState(null);
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [addressTypes, setAddressTypes] = useState([]);
  const [hospitals, setHospitals] = useState([]);
    const [genders, setGenders] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);

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
  const [languageOptions, setLanguageOptions] = useState([]);

  const [tenants, setTenants] = useState([]); // State for tenant data
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    qualification: '',
    specialization: '',
    tenant: '',
    hospital: '',
    DateOfBirth:'',
    date: null as Date | null,
  });
  
const [successMessage, setSuccessMessage] = useState('');
  const [workTypes, setWorkTypes] = useState([]);
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
  
  


  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page refresh
  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
    console.log("🚀 Submit button clicked!");
  
    // Build your request data object
    const requestData = {
      createdBy: userID, // Replace with actual logged-in user ID
      tenantID: formData.tenant, // Ensure this is an ID
      hospitalID: formData.hospital, // Ensure this is an ID
      doctorName: formData.name,
      doctorDateOfBirth: formData.DateOfBirth,
      doctorEmail: formData.email,
      doctorPhoneNumber: formData.phone,
      doctorGender: genderOptions.find((g) => g.appLOVID === formData.gender)?.name,
      qualificationID: formData.qualification, // Ensure this is an ID
      specializationID: formData.specialization, // Ensure this is an ID
      genderID: formData.gender, // Ensure this is an ID
      aadhaarNumber: formData.aadhaar,
      panNumber: formData.pan,
    };
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("🚀 API Response:", response); // Log full API response
  
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✅ Doctor registered successfully!");
  
        // Log the received doctorID
        const doctorID = response.data?.doctorID; // Assuming the response contains a `doctorID` field
        if (doctorID) {
          console.log(`🎉 Received Doctor ID: ${doctorID}`);
        } else {
          console.warn("⚠️ No doctorID received in API response!");
        }
  
        // Store doctorID in sessionStorage
        sessionStorage.setItem("doctorID", doctorID || "");
  
        // Fetch doctor details if doctorID is present
        if (doctorID) {
          fetchDoctorDetails(doctorID);
        }
  
        // Reset formData after success
        setFormData({
          name: "",
          age: "",
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
          date: null as Date | null,
        });
      } else {
        console.error("❌ Unexpected response status:", response.status);
        setSuccessMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Error submitting form:", error);
      setSuccessMessage("Error occurred while registering the doctor.");
    }
  };
  
  // Function to fetch doctor details by doctorID
  const fetchDoctorDetails = async (doctorID) => {
    try {
      console.log(`🔍 Fetching details for Doctor ID: ${doctorID}`);
      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor?doctorID=${doctorID}`
      );
  
      if (response.status === 200) {
        console.log("✅ Doctor Details:", response.data);
      } else {
        console.error("❌ Error fetching doctor details");
      }
    } catch (error) {
      console.error("🚨 Error fetching doctor details:", error);
    }
  };
  
  
  
  


  const updateAddress = (index, field, value) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address, i) =>
        i === index ? { ...address, [field]: value } : address
      )
    );
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

  // State to store time slots
  const [timeSlots, setTimeSlots] = useState([
    { day: 'Sunday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Monday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Tuesday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Wednesday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Thursday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Friday', fromTime: null, toTime: null, hospital: '' },
    { day: 'Saturday', fromTime: null, toTime: null, hospital: '' },
    
  ]);

 // Handle change for a specific dropdown
 const handleHospitalChange = (index, value) => {
  setTimeSlots((prevSlots) =>
    prevSlots.map((slot, i) =>
      i === index ? { ...slot, hospital: value } : slot // Update only the selected row
    )
  );
};

 
  // Function to handle time or dropdown value changes
  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  // Function to add a new row below the clicked row
  const addNewRowBelow = (index, day) => {
    const updatedSlots = [...timeSlots];
    updatedSlots.splice(index + 1, 0, {
      day: day,
      hospital: '',
      fromTime: null,
      toTime: null,
    });
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
const updateAwardField = (index, field, value) => {
  const updatedAwards = [...awards];
  updatedAwards[index][field] = value;
  setAwards(updatedAwards);
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
  // Initialize time slots with 7 days on component mount
  useEffect(() => {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const initialTimeSlots = days.map((day) => ({
      day,
      hospital: '',
      hospital: '',
      fromTime: null,
      toTime: null,
    }));
    setTimeSlots(initialTimeSlots);
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
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [isPopupVisible, setPopupVisible] = useState(false);

  // time slots

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  

  const removeForm = (id) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== id));
  };

  


  // Submit all addresses
  const handleAddressSubmit = () => {
    // const doctorID = "871f2ad1-649d-4268-65a2-08dd41b6b422";
  
    // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }

    console.log("Current addresses:", addresses); // Debug log
  
    if (!addresses || addresses.length === 0) {
      console.error("No addresses found!");
      alert("No addresses to submit.");
      return;
    }
  
    const addressData = addresses.map((address) => ({
      ...address,
      id: doctorID,
      createdBy: userID,
    }));
  
    console.log("Mapped address data:", addressData); // Debug log
  
    // Validate required fields
    const requiredFields = ["addressType", "address1", "city", "zipCode", "type"];

    const invalidAddresses = addressData.filter((address) =>
      requiredFields.some((field) => !address[field])
    );
  
    console.log("Invalid addresses:", invalidAddresses); // Debug log
  
    if (invalidAddresses.length > 0) {
      alert("Some addresses are missing required fields. Please check your input.");
      return;
    }
  
    // Make API call
    axios
      .post(
        "https://predart003-001-site1.anytempurl.com/api/Patient/SaveAddress",
        addressData
      )
      .then((response) => {
        console.log("Addresses saved successfully:", response.data);
        alert("Addresses saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving addresses:", error);
        alert("Failed to save addresses.");
      });
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

  // const updateAddress = (
  //   index: number,
  //   key: string,
  //   value: string | boolean,
  // ) => {
  //   const updatedAddresses = addresses.map((address, i) =>
  //     i === index ? { ...address, [key]: value } : address,
  //   );
  //   setAddresses(updatedAddresses);
  // };

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

  const [uploadBoxes, setUploadBoxes] = useState([
    {
      id: Date.now(),
      files: [],
      preview: null,
      previewType: '',
      selectedType: '',
    },
  ]);

  const addUploadBox = () => {
    setUploadBoxes((prev) => [
      ...prev,
      {
        id: Date.now(),
        files: [],
        preview: null,
        previewType: '',
        selectedType: '',
      },
    ]);
  };

  type UploadBox = {
    id: number;
    files: File[];
    preview: string | null;
    previewType: string;
    selectedType: string;
    showPreview: boolean;
  };
 

  
  const handleFileChange = (boxId, e) => {

    // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
  
    const file = e.target.files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Prepare FormData to send the file and other data to the API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("createdBy", "userID"); // Example user ID
        formData.append("id", "doctorID"); // Doctor ID
  
        // Sending the POST request to the API
        axios.post('https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDocuments', formData)
          .then(response => {
            const { fileName, fileLocation } = response.data;
            setUploadBoxes(prevState => prevState.map(box => 
              box.id === boxId ? {
                ...box,
                files: [{ name: fileName, location: fileLocation }],
                preview: reader.result,
                previewType: file.type.split('/')[0],
                fileLocation
              } : box
            ));
          })
          .catch(error => {
            console.error('File upload error:', error);
          });
      };
  
      reader.readAsDataURL(file);
    }
  };
  



  // Handle input change for form data
  const handleSingleInputChange = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePreview = (boxId) => {
    setUploadBoxes(prevState => prevState.map(box => 
      box.id === boxId ? { ...box, showPreview: true } : box
    ));
  };
  
  const closePreview = (boxId) => {
    setUploadBoxes(prevState => prevState.map(box => 
      box.id === boxId ? { ...box, showPreview: false } : box
    ));
  };

  const removeFile = (boxId) => {
    setUploadBoxes(prevState => prevState.map(box => 
      box.id === boxId ? {
        ...box,
        files: [],
        preview: '',
        previewType: '',
        fileLocation: ''
      } : box
    ));
  };
  const handleDropdownChange = (boxId, value) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId ? { ...box, selectedType: value } : box,
      ),
    );
  };
  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data) {
          setHospitals(data.data); // Assuming `data.data` contains the list
        }
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);

  // Fetch tenant data
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
        setTenants(data.data || data); // Adjust based on the API structure
      })
      .catch((error) => {
        console.error('Error fetching tenant data:', error);
      });
  }, []);


  const handleEducationSubmit = async (e) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    if (!addresses || addresses.length === 0) {
      console.error("🚨 No education data provided!");
      setSuccessMessage("No education data provided.");
      return;
    }
  
    const doctorID = "871f2ad1-649d-4268-65a2-08dd41b6b422"; // Replace with actual doctor ID
  
    try {
      const educationData = addresses.map((address) => ({
        createdBy: userID,
        tenantID: "c12a4af2-2f8f-46b5-d438-08dd36f371c9",
        doctorID: doctorID,
        graduateID: "17dd8bbe-0b29-4dc3-6321-08dd36ae8848",
        degreeName: address.degreeName?.trim() || "",
        specializationID: "10779537-727c-44e1-6327-08dd36ae8848",
        location: address.location?.trim() || "",
        universityName: address.university?.trim() || "",
        startDate: address.startDate ? new Date(address.startDate).toISOString().split("T")[0] : null,
        endDate: address.endDate ? new Date(address.endDate).toISOString().split("T")[0] : null,
        isHighestEducation: Boolean(address.isHighestEducation),
      }));
  
      console.log("📤 Sending Education Data:", JSON.stringify(educationData, null, 2));
  
      // Send as a batch if API supports it
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation",
        educationData, // Send multiple entries
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Education Data Saved Successfully:", response.data);
        setSuccessMessage("Doctor education details saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("❌ Unexpected response status:", response.status);
        setSuccessMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Error submitting education details:", error.response || error);
      setSuccessMessage("Error occurred while saving doctor education details.");
    }
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    if (!forms || forms.length === 0) {
      console.error("🚨 No language data provided!");
      setSuccessMessage("No language data provided.");
      return;
    }
  
    // Loop through all forms and create API data for each language
    const apiDataArray = forms.map((form) => ({
      createdBy: userID,
      id: doctorID,
      type: "doctor",
      languageMasterID: form.language, // Ensure this is an ID
      read: form.abilities.read,
      write: form.abilities.write,
      speak: form.abilities.speak,
    }));
  
    console.log("📤 Sending API Data:", JSON.stringify(apiDataArray, null, 2));
  
    try {
      // Send as a batch if API supports multiple entries at once
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveLanguage",
        apiDataArray, // Send multiple language records
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Language Data Saved Successfully:", response.data);
        setSuccessMessage("Language data saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("❌ Unexpected response status:", response.status);
        setSuccessMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Error submitting language details:", error?.response?.data || error.message);
      setSuccessMessage(error?.response?.data?.message || "Error occurred while saving language details.");
    }
  };
  
  
  

  // Change function name to handleExperienceSubmit
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    if (!Array.isArray(experience) || experience.length === 0) {
      console.error("🚨 No experience data available.");
      return;
    }
  
    const experienceDataArray = experience.map((exp) => ({
      createdBy: userID,
      createdOn: new Date().toISOString(), // Current timestamp
      updatedBy: userID,
      updatedOn: new Date().toISOString(), // Current timestamp
      isActive: true, // Assuming the experience is active by default
      exprienceID: exp.exprienceID || crypto.randomUUID(), // Generate if not available
      doctorID: doctorID, // Ensure this is a valid UUID
      employmentType: exp.type, // Ensure this is a UUID
      specializationID: "10779537-727c-44e1-6327-08dd36ae8848",
      hospitalName: exp.hospitalName.trim(), // Trim spaces
      joinDate: exp.joinDate ? new Date(exp.joinDate).toISOString() : null,
      leaveDate: exp.leaveDate ? new Date(exp.leaveDate).toISOString() : null,
    }));
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorExprience",
        experienceDataArray, // ✅ Send an array (not wrapped in an object)
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Experience Data Saved Successfully:", response.data);
      } else {
        console.error("❌ Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("🚨 Error submitting experience details:", error?.response?.data || error.message);
    }
  };
  
  
  
  
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
  
    // Retrieve userID from sessionStorage
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found in session storage.");
      alert("User not logged in. Please log in again.");
      return;
    }
  
    if (!Array.isArray(skills) || skills.length === 0) {
      console.error("🚨 No skills data available.");
      return;
    }
  
    // Map the skills array to match the API request format
    const apiSkillsData = skills.map((skill) => ({
      createdBy: userID,
      doctorID: doctorID, // Ensure this is a valid UUID
      skillMasterID: "10779537-727c-44e1-6327-08dd36ae8848", // Ensure this is a valid UUID
      yearOfExperience: skill.yearsOfExperience,
      monthOfExperience: skill.monthsOfExperience,
      description: skill.description.trim(),
    }));
  
    try {
      // Send the entire array in a single API call
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorSkill",
        apiSkillsData, // ✅ Sending an array instead of looping multiple requests
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Skill Data Saved Successfully:", response.data);
      } else {
        console.error("❌ Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("🚨 Error submitting skill details:", error?.response?.data || error.message);
    }
  };
  
  
 // Function to handle form submission
 const handleAwardSubmit = async (e) => {
  e.preventDefault();

  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }

  if (!Array.isArray(awards) || awards.length === 0) {
    console.error("🚨 No awards data available.");
    return;
  }

  // Map the awards array to match the API request format
  const apiAwardsData = awards.map((award) => ({
    createdBy: userID,
    doctorID: doctorID, // Ensure this is a valid UUID
    awardName: award.awardName.trim(),
    awardYear: award.year,
    description: award.description.trim(),
  }));

  try {
    // Send the entire array in a single API call
    const response = await axios.post(
      "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorAward",
      apiAwardsData, // ✅ Sending an array instead of looping multiple requests
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200 || response.status === 201) {
      console.log("✅ Award Data Saved Successfully:", response.data);
    } else {
      console.error("❌ Unexpected response status:", response.status);
    }
  } catch (error) {
    console.error("🚨 Error submitting award details:", error?.response?.data || error.message);
  }
};

  
 // Prepare data for API request
 const handleSaveSlots = async () => {
  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }

  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    console.error("🚨 No time slots available.");
    alert("Please select at least one hospital and time slot before saving.");
    return;
  }

  try {
    // Filter valid slots
    const validSlots = timeSlots.filter(slot => slot.hospital && slot.fromTime && slot.toTime);

    if (validSlots.length === 0) {
      alert("Please ensure all selected slots have a hospital, from time, and to time.");
      return;
    }

    // Map the slots into the required API format
    const payload = validSlots.map(slot => ({
      createdBy: userID, // Dynamic user ID
      doctorID: "871f2ad1-649d-4268-65a2-08dd41b6b422", // Replace with dynamic doctor ID if needed
      hospitalID: slot.hospital, // Use selected hospital ID
      dayofWeek: slot.day.toUpperCase(), // Convert to uppercase
      fromTime: slot.fromTime
        ? slot.fromTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      toTime: slot.toTime
        ? slot.toTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    }));

    // Send the entire array in a single API request
    const response = await fetch(
      "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorTimeSlot",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // ✅ Sending an array instead of a single object
      }
    );

    const data = await response.json();
    if (response.ok) {
      alert("✅ Time slots saved successfully!");
    } else {
      alert(`❌ Error: ${data.message || "Failed to save slots"}`);
    }
  } catch (error) {
    console.error("🚨 Error saving slots:", error);
    alert("An error occurred while saving the slots.");
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
  
  
  // Handle checkbox changes
  const handleCheckboxChange = (formId, ability) => {
    setForms(forms.map((form) =>
      form.id === formId
        ? { ...form, abilities: { ...form.abilities, [ability]: !form.abilities[ability] } }
        : form
    ));
  };
  
  
  
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container">
        <>
          <FormWizard
            stepSize="xs"
            bg-white
            onComplete={handleComplete}
            onTabChange={() => {}}
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
                  <div>
                    <select
                      value={formData.tenant || ''} // Use formData.tenant
                      onChange={(e) => {
                        setFormData({ ...formData, tenant: e.target.value });
                        handleSingleInputChange('tenant', e.target.value);
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled>
                        Select Tenant
                      </option>
                      {tenants.map((tenant) => (
                        <option key={tenant.tenantID} value={tenant.tenantID}>
                          {tenant.tenantName} {/* Display the tenant's name */}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hospital */}
                  <div>
                    <select
                      value={formData.hospital}
                      onChange={(e) =>
                        handleSingleInputChange('hospital', e.target.value)
                      }
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.length > 0 ? (
                        hospitals.map((hospital) => (
                          <option
                            key={hospital.hospitalID}
                            value={hospital.hospitalID}
                          >
                            {hospital.hospitalName}
                          </option>
                        ))
                      ) : (
                        <option value="">No Hospitals Available</option>
                      )}
                    </select>
                  </div>
                  {/* Name */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Name</label> */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.name}
                      onChange={(e) =>
                        handleSingleInputChange('name', e.target.value)
                      }
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Email */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Email</label> */}
                    <input
                      type="email"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.email}
                      onChange={(e) =>
                        handleSingleInputChange('email', e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Phone</label> */}
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.phone}
                      onChange={(e) =>
                        handleSingleInputChange('phone', e.target.value)
                      }
                      placeholder="Enter your number"
                    />
                  </div>

                  {/* Aadhaar */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Aadhaar</label> */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.aadhaar}
                      onChange={(e) =>
                        handleSingleInputChange('aadhaar', e.target.value)
                      }
                      placeholder="Enter your Aadhaar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Qualification */}
                  <div>
                    <select
                      value={formData.qualification}
                      onChange={(e) =>
                        handleSingleInputChange('qualification', e.target.value)
                      }
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Qualification</option>
                      {qualifications.map((qual) => (
                        <option key={qual.appLOVID} value={qual.appLOVID}>
                          {qual.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={(e) =>
                        handleSingleInputChange(
                          'specialization',
                          e.target.value,
                        )
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
                  </div>

                  {/* PAN */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700">PAN</label> */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.pan}
                      onChange={(e) =>
                        handleSingleInputChange('pan', e.target.value)
                      }
                      placeholder="Enter your PAN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                  {/* Age and Gender */}

                  {/* Age */}
                  


<div>
              <input
                type="date"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.DateOfBirth}
                onChange={(e) => handleSingleInputChange('DateOfBirth', e.target.value)}
                placeholder="Enter your date of birth"
              />
            </div>
                  

                  {/* Gender */}
                  <div>
                  <select
  id="gender"
  name="gender"
  value={formData.gender}
  onChange={(e) =>
    handleSingleInputChange('gender', e.target.value)
  }
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                          updateAddress(index, 'type', e.target.value)
                        }
                      >
                        <option value="">Select Address Type</option>
                        {addressTypes.map((type) => (
                          <option key={type.appLOVID} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
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
                            updateAddress(index, 'address1', e.target.value)
                          }
                          placeholder="Enter address line 1"
                        />
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
                            updateAddress(index, 'address2', e.target.value)
                          }
                          placeholder="Enter address line 2"
                        />
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
                            updateAddress(index, 'city', e.target.value)
                          }
                          placeholder="Enter city"
                        />
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
                            updateAddress(index, 'district', e.target.value)
                          }
                        />
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
                            updateAddress(index, 'state', e.target.value)
                          }
                        />
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
                            updateAddress(index, 'zipCode', e.target.value)
                          }
                          placeholder="Enter pincode"
                        />
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
                          updateAddress(index, 'isActive', e.target.checked)
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
                <button onClick={handleAddressSubmit} disabled={!doctorID}
      type="button"
      className="bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white py-2 px-6 rounded-lg hover:from-[#007BFF] hover:to-[#004A99]"
     
    >
      Save Address
    </button>
                <div className="mt-9">
                  <button
                    onClick={handleRegister}
                    className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                      hover:from-[#007BFF] hover:to-[#004A99]
                      text-white transition duration-150 
                      ease-out hover:ease-in py-2 px-5 rounded-lg"
                  >
                    Register Now
                  </button>
                </div>

                {successMessage && (
                  <p className="mt-4 text-green-500 text-lg">
                    {successMessage}
                  </p>
                )}
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
        onChange={(e) => updateAddress(index, "type", e.target.value)}
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
          onChange={(e) => updateAddress(index, "isHighestEducation", e.target.checked)}
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
          onChange={(e) => updateAddress(index, "degreeName", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your degree"
        />
      </div>

      {/* Location */}
      <div>
        <input
          type="text"
          value={address.location}
          onChange={(e) => updateAddress(index, "location", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your location"
        />
      </div>

      {/* University Name */}
      <div>
        <input
          type="text"
          value={address.university}
          onChange={(e) => updateAddress(index, "university", e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Enter your university name"
        />
      </div>

      {/* Starting Date */}
      <div className="relative">
        <DatePicker
          selected={address.startDate ? new Date(address.startDate) : null}
          onChange={(date) => updateAddress(index, "startDate", date)}
          dateFormat="MM/dd/yyyy"
          placeholderText="Starting date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
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
          onChange={(date) => updateAddress(index, "endDate", date)}
          dateFormat="MM/dd/yyyy"
          placeholderText="Ending date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
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

<div className="flex items-center justify-center gap-1">
<button
  onClick={handleEducationSubmit}
  className="bg-blue-500 text-white px-4 py-2 rounded-md"
>
  Save Education
</button>

{successMessage && (
  <p className="text-green-500 mt-2">{successMessage}</p>
)}

</div>
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
                        {/* Dropdown for Language */}
                        {/* Only render dropdown if languages are available */}
                        <select
  value={form.language} // Ensure this is storing the appLOVID
  onChange={(e) =>
    handleMultipleFormsInputChange(
      form.id,
      "language",
      e.target.value // ✅ Store appLOVID (instead of ID)
    )
  }
  className="w-70 rounded-lg border border-stroke bg-transparent py-4 pl-8 pr-8
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
>
  <option value="">-- Select a Language --</option>
  {languageOptions.map((language) => (
    <option key={language.appLOVID} value={language.appLOVID}> {/* ✅ Use appLOVID */}
      {language.name}
    </option>
  ))}
</select>

                        {/* Checkboxes for Abilities */}
                        <div className="flex gap-8 flex-grow">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={form.abilities.read}
                              onChange={() =>
                                handleCheckboxChange(form.id, 'read')
                              }
                              className="mr-1"
                            />
                            Read
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={form.abilities.write}
                              onChange={() =>
                                handleCheckboxChange(form.id, 'write')
                              }
                              className="mr-1"
                            />
                            Write
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={form.abilities.speak}
                              onChange={() =>
                                handleCheckboxChange(form.id, 'speak')
                              }
                              className="mr-1"
                            />
                            Speak
                          </label>
                        </div>

                        {/* Remove Button */}
                        {/* <div className="flex items-center">
          {index > 0 ? (
            <button
              onClick={() => removeForm(form.id)}
              className="bg-gradient-to-b from-[#990000] to-[#FF0000] 
            hover:from-[#FF0000] hover:to-[#990000] 
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-1 rounded-lg"
            >
              Remove
            </button>
          ) : (
            <div className="w-[85px]"></div>
          )}
        </div> */}
        
                      </div>
                    </div>
                  ))}



<button type="button" onClick={handleFormSubmit}
className="mt-4 w-50 py-2 px-4 bg-gradient-to-b from-[#004A99] to-[#007BFF] 
hover:from-[#007BFF] hover:to-[#004A99] text-white rounded-lg"
>Save</button> 





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
                  {(experience || []).map((exp, index)=> (
                    <div
                      key={index}
                      className="w-full border border-stroke rounded-lg p-4"
                    >
                      {/* Dropdown for Part-time/Full-time */}
                      {/* Work Type Dropdown */}
                      <div className="flex justify-between items-center mb-4">
                        <select
                          value={exp.type}
                          onChange={(e) =>
                            updateExperience(index, 'type', e.target.value)
                          }
                          className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <option value="">Select Work Type</option>
                          {workTypes.map((type) => (
                            <option key={type.appLOVID} value={type.appLOVID}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        
                        {/* Hospital Name */}
                        <input
                          type="text"
                          placeholder="Hospital Name"
                          value={exp.hospitalName}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              'hospitalName',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <div>
                    <select
                      value={formData.hospital}
                      onChange={(e) =>
                        handleSingleInputChange('hospital', e.target.value)
                      }
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.length > 0 ? (
                        hospitals.map((hospital) => (
                          <option
                            key={hospital.hospitalID}
                            value={hospital.hospitalID}
                          >
                            {hospital.hospitalName}
                          </option>
                        ))
                      ) : (
                        <option value="">No Hospitals Available</option>
                      )}
                    </select>
                  </div>

                        {/* Date Picker Row */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                          {/* Join Date */}
                          <div className="relative">
                            <DatePicker
                              selected={exp.joinDate}
                              onChange={(date) =>
                                updateExperience(index, 'joinDate', date)
                              }
                              dateFormat="MM/dd/yyyy"
                              placeholderText="Join Date"
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <span
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                              style={{ color: '#c2c3c4' }}
                            >
                              <i className="fas fa-calendar-alt"></i>
                            </span>
                          </div>
                          {/* Leave Date */}
                          <div className="relative">
                            <DatePicker
                              selected={exp.leaveDate}
                              onChange={(date) =>
                                updateExperience(index, 'leaveDate', date)
                              }
                              dateFormat="MM/dd/yyyy"
                              placeholderText="Leave Date"
                              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />{' '}
                            <span
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                              style={{ color: '#c2c3c4' }}
                            >
                              <i className="fas fa-calendar-alt"></i>
                            </span>
                          </div>
                        </div>
                      </div>

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
 <button
 onClick={handleExperienceSubmit}
        type="submit"
        className="mt-6 bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white py-2 px-6 rounded-lg"
      >
        Save Experience 
      </button>
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
                        <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={(e) =>
                        handleSingleInputChange(
                          'specialization',
                          e.target.value,
                        )
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

                        {/* Years of Experience Dropdown */}
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={skill.yearsOfExperience}
                          onChange={(e) =>
                            handleSkillChange(index, 'yearsOfExperience', e.target.value)
                          }
                          placeholder="-- Years of Experience --"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />

                        {/* Months of Experience Input */}
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={skill.monthsOfExperience}
                          onChange={(e) =>
                            handleSkillChange(index, 'monthsOfExperience', e.target.value)
                          }
                          placeholder="-- Months of Experience --"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>

                      {/* Description Textarea */}
                      <textarea
                        value={skill.description}
                        onChange={(e) =>
                          handleSkillChange(index, 'description', e.target.value)
                        }
                        placeholder="Description"
                        className="w-full mt-4 rounded-lg border border-stroke bg-transparent py-2 px-4 text-black 
                outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                      ></textarea>

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
<button
                          type="button"
                          onClick={handleSkillSubmit}
                          className="mt-4 bg-gradient-to-b from-[#004A99] to-[#007BFF]
                       hover:from-[#007BFF] hover:to-[#004A99] 
                  text-white py-2 px-4 rounded-lg"
                        >
                          Save Skill
                        </button>
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
                      <input
                        type="text"
                        value={award.awardName}
                        onChange={(e) =>
                          updateAwardField(index, 'awardName', e.target.value)
                        }
                        className="flex-1 rounded-lg border border-stroke bg-transparent py-4 px-4 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                        placeholder="Enter award name"
                        required
                      />

                      {/* Year Input */}
                      <input
                        type="text"
                        value={award.year}
                        onChange={(e) =>
                          updateAwardField(index, 'year', e.target.value)
                        }
                        className="flex-1 rounded-lg border border-stroke bg-transparent py-4 px-4 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                        placeholder="Enter year"
                        required
                      />
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
                    </div>

                    {/* Remove Button */}
                    {/* {index > 0 && (
        <button
          type="button"
          onClick={() => removeAward(index)}
          className="bg-gradient-to-b from-[#990000] to-[#FF0000] 
            hover:from-[#FF0000] hover:to-[#990000] 
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-5 rounded-lg mt-4"
        >
          Remove
        </button>
      )} */}
                  </div>
                ))}
<button
          type="button"
          onClick={handleAwardSubmit}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-5 rounded-lg mt-4"
        >
         Save Award
        </button>

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
              
              <div className="space-y-6">
                {/* Days and Time Slots Section */}
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-2 items-center"
                  >
                    {/* Day Label */}
                    <div>
                      <label className="block font-medium text-blue-500">
                        {slot.day}
                      </label>
                    </div>

                   
                    {/* Hospital Dropdown */}
<div className="col-span-2">
  <select
    value={slot.hospital} // Bind to specific row's hospital value
    onChange={(e) => handleHospitalChange(index, e.target.value)} // Pass row index
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
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
</div>


                    {/* From Time */}
                    <div>
                      <DatePicker
                        selected={slot.fromTime}
                        onChange={(time) =>
                          handleTimeChange(index, 'fromTime', time)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="From Time"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {/* To Time */}
                    <div>
                      <DatePicker
                        selected={slot.toTime}
                        onChange={(time) =>
                          handleTimeChange(index, 'toTime', time)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="To Time"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {/* Add Button Below To Time (Aligned to the End) */}
                    <div className="col-span-5 flex justify-end mt-2">
                      {' '}
                      {/* Using flex and justify-end to align to the right */}
                      <button
                        type="button"
                        className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                        onClick={() => addNewRowBelow(index, slot.day)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Additional Information Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Checkbox 1 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500"
                      />
                      <span>I'm ready to work in government holidays</span>
                    </label>

                    {/* Checkbox 2 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500"
                      />
                      <span>I'm ready to work in government holidays</span>
                    </label>

                    {/* Checkbox 3 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500"
                      />
                      <span>I'm ready to work in government holidays</span>
                    </label>

                    {/* Checkbox 4 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500"
                      />
                      <span>I'm ready to work in government holidays</span>
                    </label>
                  </div>
                </div>

                <button
  type="button"
  onClick={handleSaveSlots}
  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg mt-4"
>
  Save Slot
</button>


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
              <div className="p-4">
                <h2 className="w-100 text-lg font-bold text-black-700 text-left">
                  Documents
                </h2>

                {/* Container for upload boxes */}
                <div className="flex flex-col gap-4 mt-4">
                  {' '}
                  {/* Changed flex-wrap to flex-col */}
                  {uploadBoxes.map((box) => (
                    <div
                      key={box.id}
                      className="w-full sm:w-80 md:w-96 rounded-lg border border-stroke bg-transparent py-4 px-6"
                    >
                      {/* Dropdown */}
                      <select
                        value={box.selectedType}
                        onChange={(e) =>
                          handleDropdownChange(box.id, e.target.value)
                        }
                        className="w-full mb-4 flex rounded-lg border border-stroke bg-transparent py-4 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="">-- Select File Type --</option>
                        <option value="PAN">PAN</option>
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="Photo">Photo</option>
                      </select>

                      {/* Drag and Drop Area */}
                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileChange(box.id, {
                            target: { files: e.dataTransfer.files },
                          });
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        className="w-full border-stroke bg-transparent text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center"
                      >
                        <p className="text-gray-500">Drag & Drop Files Here</p>
                        <p className="text-gray-500 mt-2">or</p>
                        <label
                          htmlFor={`file-upload-${box.id}`}
                          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-5 rounded-lg cursor-pointer"
                        >
                          Choose File
                        </label>
                        <input
                          id={`file-upload-${box.id}`}
                          type="file"
                          onChange={(e) => handleFileChange(box.id, e)}
                          className="hidden"
                        />
                      </div>

                      {/* Uploaded Files and Preview */}
                      {box.files.length > 0 && (
                        <div className="mt-4">
                          <div className="flex border border-stroke bg-transparent text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary items-center justify-between p-2 border border-gray-300 rounded mt-2">
                            {/* File Name */}
                            <div className="flex items-center">
                              <div className="bg-gray-200 h-10 w-10 rounded flex items-center justify-center mr-2">
                                📄
                              </div>
                              <span
                                className="text-gray-700 cursor-pointer"
                                onClick={() => handlePreview(box.id)}
                              >
                                {box.files[0].name}
                              </span>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFile(box.id)}
                              className="text-red-500 underline hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Preview Modal */}
                          {box.showPreview && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white p-4 rounded-lg max-w-lg max-h-screen overflow-auto">
                                {box.previewType === 'image' ? (
                                  <img
                                    src={box.preview}
                                    alt="Preview"
                                    className="max-w-full max-h-96"
                                  />
                                ) : (
                                  <pre className="whitespace-pre-wrap break-words text-black">
                                    {box.files[0].name}
                                  </pre>
                                )}
                                <button
                                  onClick={() => closePreview(box.id)}
                                  className="mt-2 text-red-500 underline"
                                >
                                  Close Preview
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Add button */}
                  <div className="flex items-center justify-start gap-1 mt-2 px-80">
                    {/* Clickable Icon */}
                    <div
                      className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                      onClick={addUploadBox}
                    >
                      +
                    </div>

                    {/* Non-clickable Text */}
                    <span className="text-sm pr-7 font-medium text-black-600">
                      Add
                    </span>
                  </div>
                </div>
              </div>
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
   .wizard-btn {
   background: linear-gradient(to bottom, #004A99, #007BFF) !important; /* Gradient from dark blue to light blue */
  color: white; /* Text color */
  padding: 12px 30px; /* Adjust padding to fit text */
  border-radius: 10px; /* Rounded corners */
  font-size: 16px; /* Font size */
  font-weight: bold; /* Bold text */
  text-align: center;
  transition: background-color 0.3s ease, transform 0.2s ease-in-out;
  border: none; /* Remove any borders */
}

.wizard-btn:hover {
  background: linear-gradient(to bottom, #007BFF, #004A99) !important; /* Reverse the gradient on hover */
  cursor: pointer; /* Pointer cursor on hover */
}


      `}</style>
        </>
      </div>
    </div>
  );
};

export default DoctorFormWizard;
