import React, { useState,useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const PatientFormWizard: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientDateOfBirth: '',
    patientGender: '',
    patientPhoneNumber: '',
    patientEmail: '',
    createdBy: "dd606a34-6e0a-4b0f-8cfd-8e9138267627",
   
    height: "",
    weight: "",
    bloodGroupID: "",
    email: "",
    phoneNumber: "",
    name: "",
    
  });
  const [genderOptions, setGenderOptions] = useState<string[]>([]); // State to store gender options
 
  const [selectedAddress, setSelectedAddress] = useState(null);
  const handleSelectAddress = (addressIndex) => {
    setSelectedAddress(addresses[addressIndex]);
    console.log("Selected Address:", addresses[index]);
  };

  const [forms, setForms] = useState([
    {
      id: Date.now(),
      language: '',
      abilities: { read: false, write: false, speak: false },
    },
  ]);

  interface Award {
    awardName: string;
    year: string;
    description: string;
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
  const [addresses, setAddresses] = useState([
    {
      addressType: "Commercial",
      address1: "",
      address2: "",
      city: "",
      district: "",
      state: "",
      zipCode: "",
      type: "Doctor", // Default type, can be updated dynamically
    },
  ]);
  const [sections, setSections] = useState([
    { height: '', weight: '', bloodGroup: '' },
  ]);

  

  const handleChange = (index, field, value) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections[index][field] = value;
      return updatedSections;
    });
  };

  
  // State to store time slots
const [timeSlots, setTimeSlots] = useState([
  { day: "Sunday", fromTime: null, toTime: null, hospital: "" },
  { day: "Monday", fromTime: null, toTime: null, hospital: "" },
  { day: "Tuesday", fromTime: null, toTime: null, hospital: "" },
  { day: "Wednesday", fromTime: null, toTime: null, hospital: "" },
  { day: "Thursday", fromTime: null, toTime: null, hospital: "" },
  { day: "Friday", fromTime: null, toTime: null, hospital: "" },
  { day: "Saturday", fromTime: null, toTime: null, hospital: "" },
  // Add more days as needed
]);

// Function to handle time or dropdown value changes
const handleTimeChange = (index, field, value) => {
  const updatedSlots = [...timeSlots];
  updatedSlots[index][field] = value;
  setTimeSlots(updatedSlots);
};

// Function to add a new row below the clicked row
const addNewRowBelow = (index, day) => {
  const newRow = { day: day, fromTime: null, toTime: null, hospital: "" };
  const updatedSlots = [...timeSlots];
  updatedSlots.splice(index + 1, 0, newRow); // Insert new row after the clicked row
  setTimeSlots(updatedSlots);
};

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [patientID, setPatientID] = useState(null); // State to store patientID
  

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const [awards, setAwards] = useState<Award[]>([
    { awardName: '', year: '', description: '' },
  ]);

  const addAward = () => {
    setAwards([...awards, { awardName: '', year: '', description: '' }]);
  };

  const removeAward = (index: number) => {
    const updatedAwards = awards.filter((_, i) => i !== index);
    setAwards(updatedAwards);
  };

  const [showAddressFields, setShowAddressFields] = useState(false);
  
 
  const [bloodGroups, setBloodGroups] = useState([]);
 
  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
      .then((response) => response.json())
      .then((data) => {
        const filteredBloodGroups = data.data.filter(
          (item) => item.type === "Bloodgroup"
        );
        setBloodGroups(filteredBloodGroups);
      })
      .catch((error) => console.error("Error fetching blood groups:", error));
  }, []);

  // const handleInputChange = (index, field, value) => {
  //   const updatedSections = [...sections];
  //   updatedSections[index][field] = value;
  //   setSections(updatedSections);
  // };
  

  
  const [addressTypes, setAddressTypes] = useState([]);
  

  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
      .then((response) => response.json())
      .then((data) => {
        const filteredAddressTypes = data.data.filter(
          (item) => item.type === "Address"
        );
        setAddressTypes(filteredAddressTypes);
      })
      .catch((error) => console.error("Error fetching address types:", error));
  }, []);

  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  };
  
   // Handle input change for dynamic fields
   const handleInputChange = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  };

  // Add a new address row
  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        addressType: "Residential",
        address1: "",
        address2: "",
        city: "",
        district: "",
        state: "",
        zipCode: "",
        type: "Patient", // Default type for new address
      },
    ]);
  };

  // Remove an address row
  const removeAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };
  
  

  const [experiences, setExperiences] = useState([
    {
      type: 'Part-time',
      specialization: '',
      hospitalName: '',
      joinDate: null,
      leaveDate: null,
    },
  ]);

  const updateExperience = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value, // Update only the specified field
    };
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        type: 'Part-time',
        specialization: '',
        hospitalName: '',
        joinDate: null,
        leaveDate: null,
      },
    ]);
  };

  const removeExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };
  // Experience

 
  

  // Fetch the gender options on component mount
  useEffect(() => {
    const fetchGenderOptions = async () => {
      try {
        const response = await axios.get('https://predart003-001-site1.anytempurl.com/api/AppLOV', {
          params: {
            type: 'gender',
          },
        });

        if (response.data && response.data.data) {
          setGenderOptions(response.data.data); // Update the gender options
        }
      } catch (error) {
        console.error('Error fetching gender options:', error);
      }
    };

    fetchGenderOptions();
  }, []);
  // Handle input change for form data
  const handleSingleInputChange = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  

  // Define the type for a skill
  type Skill = {
    skill: string;
    years: string;
    months: string;
    description: string;
  };

  // State initialization

  const [skills, setSkills] = useState<Skill[]>([]);

  // Add a new empty skill form
  const handleAddSkill = () => {
    setSkills([
      ...skills,
      {
        skill: '',
        years: '',
        months: '',
        description: '',
      },
    ]);
  };

  // Remove a skill form
  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  // Update a specific skill in the array
  const handleSkillChange = (index: number, field: string, value: any) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

 
  
  

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
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  

    
  
  // const handleCheckboxChange = (id, ability) => {
  //   setForms((prevForms) =>
  //     prevForms.map((form) =>
  //       form.id === id
  //         ? {
  //             ...form,
  //             abilities: {
  //               ...form.abilities,
  //               [ability]: !form.abilities[ability],
  //             },
  //           }
  //         : form,
  //     ),
  //   );
  // };

  const removeForm = (id) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== id));
  };

  // const handleSingleInputChange = (key: string, value: string) => {
  //   setFormData({ ...formData, [key]: value });
  // };

  const handleMultipleFormsInputChange = (id, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === id
          ? {
              ...form,
              [field]: value,
            }
          : form,
      ),
    );
  };

 

  
  const updateAwardField = (
    index: number,
    field: keyof Award,
    value: string,
  ) => {
    const updatedAwards = [...awards];
    updatedAwards[index][field] = value;
    setAwards(updatedAwards);
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

 

  const handleSingInputChange = (index: number, key: string, value: string) => {
    const newBoxes = [...boxes];
    newBoxes[index][key] = value;
    setBoxes(newBoxes);
  };

  const handleAddBox = () => {
    setBoxes([...boxes, { bloodGroup: "" }]);
  };

  const [boxes, setBoxes] = useState([{ bloodGroup: "" }]);
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bloodGroupID = bloodGroups.find(group => group.name === boxes[0].bloodGroup)?.appLOVID;

    const payload = {
      createdBy: formData.createdBy,
      patientsID: patientID, 
      height: parseFloat(formData.height), // Ensure height is a number
      weight: parseFloat(formData.weight), // Ensure weight is a number
      bloodGroupID, // Pass the blood group ID
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    try {
      const response = await fetch("https://predart003-001-site1.anytempurl.com/api/Patient/SaveFamily", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        alert("Family information saved successfully!");
      } else {
        alert("Failed to save family information.");
      }
    } catch (error) {
      console.error("Error saving family information:", error);
      alert("An error occurred while saving.");
    }
  };

  const [uploadBoxes, setUploadBoxes] = useState([
    {
      id: Date.now(),
      files: [],
      preview: null,
      previewType: "",
      selectedType: "",
    },
  ]);

  const addUploadBox = () => {
    setUploadBoxes((prev) => [
      ...prev,
      {
        id: Date.now(),
        files: [],
        preview: null,
        previewType: "",
        selectedType: "",
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
  const handleFileChange = (boxId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith("image/") ? "image" : "text";
      const previewUrl = fileType === "image" ? URL.createObjectURL(file) : "";
  
      setUploadBoxes((prev) =>
        prev.map((box) =>
          box.id === boxId
            ? { ...box, files: [file], preview: previewUrl, previewType: fileType }
            : box
        )
      );
    }
  };

  
  
  const handlePreview = (boxId) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId ? { ...box, showPreview: true } : box
      )
    );
  };

  const closePreview = (boxId) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId ? { ...box, showPreview: false } : box
      )
    );
  };

  const removeFile = (boxId) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId ? { ...box, files: [], preview: null, previewType: "" } : box
      )
    );
  };

  const handleDropdownChange = (boxId, value) => {
    setUploadBoxes((prev) =>
      prev.map((box) =>
        box.id === boxId ? { ...box, selectedType: value } : box
      )
    );
  };


 
const checkboxes = [
  "Email Notification",
  "Phone Notification",
  "SMS Notification",
  "App Notification",
  "Browser Notification",
  "Marketing Updates",
  "Security Alerts",
  "Account Updates",
  "Survey Requests",
  "Newsletter Subscription",
];

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",
  padding: "1rem",
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};


  // Initialize all preferences as false
  const [preferences, setPreferences] = useState({
    emailNotification: false,
    phoneNotification: false,
    smsNotification: false,
    appNotification: false,
    browserNotification: false,
    marketingUpdates: false,
    securityAlerts: false,
    accountUpdates: false,
    surveyRequests: false,
    newsletterSubscription: false,
  });

  // Handle checkbox state change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setPreferences((prevState) => ({
      ...prevState,
      [name]: checked, // Toggle the specific preference based on the checkbox clicked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form Data to be Sent:', formData); // Log the form data before sending

    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Patient/SaveBasicDetails',
        formData
      );

      if (response.data?.data) {
        const receivedPatientID = response.data.data; // Extract the patientID
        console.log('Patient ID:', receivedPatientID);
        setPatientID(receivedPatientID); // Store the patientID in state
        alert(`Patient details saved successfully! Patient ID: ${receivedPatientID}`);
      } else {
        console.error('Patient ID not found in the API response:', response.data);
        alert('Failed to retrieve patient ID.');
      }
    } catch (error) {
      console.error('Error sending data:', error.response?.data || error.message);
      alert('Failed to save patient details.');
    }
  };
  
 // Submit all addresses
 const handleAddressSubmit = () => {
  // Add patientID and createdBy to each address dynamically
  const addressData = addresses.map((address) => ({
    ...address,
    id: patientID,
    createdBy: "dd606a34-6e0a-4b0f-8cfd-8e9138267627",

  }));

  // Validate required fields for all addresses
  const requiredFields = ["addressType", "address1", "city", "zipCode", "type"];
  const invalidAddresses = addressData.filter((address) =>
    requiredFields.some((field) => !address[field])
  );

  if (invalidAddresses.length > 0) {
    console.error("Missing required fields in some addresses:", invalidAddresses);
    alert(`Some addresses are missing required fields. Please check your input.`);
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

  
  // Submit data to the API
  const handleMedicalSubmit = (event) => {
    event.preventDefault();
    
    // Validate the data
    if (!validateMedicalInfo()) {
      alert("Please fill out all required fields correctly.");
      return;
    }
  
    // Prepare the medical info to be submitted in the correct format
    const medicalInfo = {
      patientsID: patientID, // Replace with actual Patient ID (e.g., from props, state, or context)
      height: parseFloat(sections[0].height), // Ensure height is a number
      weight: parseFloat(sections[0].weight), // Ensure weight is a number
      bloodGroupID: bloodGroups.find(
        (group) => group.name === sections[0].bloodGroup
      )?.appLOVID, // Find corresponding blood group ID by name
      createdBy: "dd606a34-6e0a-4b0f-8cfd-8e9138267627", // Replace with actual creator ID (e.g., from user context)
    };
  
    console.log("Payload to send:", medicalInfo); // Log payload to verify before sending
  
    // Make API call to save medical information
    axios
      .post(
        "https://predart003-001-site1.anytempurl.com/api/Patient/SaveMedicalInformation",
        medicalInfo
      )
      .then((response) => {
        console.log("Medical Information saved successfully:", response.data);
        alert("Medical Information saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving Medical Information:", error);
        if (error.response) {
          // If server returned an error response
          alert(`Failed to save Medical Information: ${error.response.data.message}`);
        } else {
          alert("Failed to save Medical Information. Please try again.");
        }
      });
  };
  
  // Validate if medical info is correctly filled
  const validateMedicalInfo = () => {
    const currentSection = sections[0]; // Assume you're handling the first section, extend if multiple sections
    if (!currentSection.height || !currentSection.weight || !currentSection.bloodGroup) {
      return false; // Return false if any required field is missing
    }
    return true;
  };

  
  
  // Submit the preferences to the API
 
  const handlePreferencesSubmit = (event) => {
    event.preventDefault();

    const preferencesData = {
      patientsID: patientID, // Example Patient ID
      ...preferences, // Spread preferences dynamically
      createdBy: "dd606a34-6e0a-4b0f-8cfd-8e9138267627", // Example creator ID
    };

    axios
      .post(
        "https://predart003-001-site1.anytempurl.com/api/Patient/SavePreferences",
        preferencesData
      )
      .then((response) => {
        console.log("Preferences saved successfully:", response.data);
        alert("Preferences saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving preferences:", error);
        alert("Failed to save preferences.");
      });
  };

  return (
    
    <div className="bg-white min-h-screen">
         {/* <div className="py-4 bg-gray-100 shadow-md">
    <h2 className="text-2xl font-semibold text-center text-black">Patient Profile</h2>
  </div> */}
      
      <div className="container">
      

        <>
          <FormWizard
            stepSize="xs"
            bg-white
            onComplete={handleComplete}
            onTabChange={() => {}}
          >
             {/* Step 1: patient details*/}
             <FormWizard.TabContent
      title="Basic Details"
      icon={
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full 
          cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
        >
          <i className="fa fa-id-card"></i>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* First Line: Name and Email */}
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={formData.patientName}
              onChange={(e) => handleSingleInputChange('patientName', e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={formData.patientEmail}
              onChange={(e) => handleSingleInputChange('patientEmail', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Second Line: Phone, Date of Birth, and Gender */}
        <div className="grid grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <input
              type="tel"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={formData.patientPhoneNumber}
              onChange={(e) => handleSingleInputChange('patientPhoneNumber', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div>
              <input
                type="date"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.patientDateOfBirth}
                onChange={(e) => handleSingleInputChange('patientDateOfBirth', e.target.value)}
                placeholder="Enter your date of birth"
              />
            </div>

            {/* Gender */}
            <div>
      <select
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={formData.patientGender}
        onChange={(e) => handleSingleInputChange('patientGender', e.target.value)}
      >
        <option value="">Select Gender</option>
        {genderOptions.map((gender, index) => (
          <option key={index} value={gender.code}> {/* Use the 'code' or 'name' based on your API response */}
            {gender.name} {/* Display the gender name */}
          </option>
        ))}
      </select>
    </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Details
          </button>
        </div>
      </form>
    </FormWizard.TabContent>

            {/* Step 2: patient address */}
           
            <FormWizard.TabContent
  title="Address"
  icon={
    <div
      className="flex justify-center items-center h-10 w-10 text-white rounded-full 
      cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
    >
      <i className="fa fa-map-marker-alt text-lg"></i>
    </div>
  }
>
  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
    <h2 className="text-lg font-bold text-black-700 text-left mt-8">
      Address
    </h2>

    {addresses.map((address, index) => (
  <div key={index} onClick={() => handleSelectAddress(index)}

        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      >
        {/* Address Type */}
        
        <div className="flex justify-between items-center mb-4">
            <select
              className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={address.type}
              onChange={(e) =>
                updateAddress(index, "type", e.target.value)
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

        {/* City, District, State, Zip Code */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div>
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
    onChange={(e) => updateAddress(index, 'district', e.target.value)}
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
    onChange={(e) => updateAddress(index, 'state', e.target.value)}
  />
</div>

          <div>
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
              text-black outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={address.zipCode}
              onChange={(e) =>
                updateAddress(index, 'zipCode', e.target.value)
              }
              placeholder="Enter zip code"
            />
          </div>
        </div>
      </div>
    ))}

    {/* Add New Address */}
    <div className="flex items-center justify-end gap-1">
      <div
        className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer 
        bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
        onClick={addAddress}
      >
        +
      </div>
      <span className="text-sm font-medium text-black-600">Add</span>
    </div>
    <div className="flex justify-end mt-6">
    <button onClick={handleAddressSubmit} disabled={!patientID}
      type="button"
      className="bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white py-2 px-6 rounded-lg hover:from-[#007BFF] hover:to-[#004A99]"
     
    >
      Save Address
    </button>

    
  </div>
  </form>
</FormWizard.TabContent>


            {/* Step 3: patient medical info */}
           
            <FormWizard.TabContent
              title="Medical Information"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                   <i className="fa fa-medkit text-lg"></i>
                </div>
              }
            >
               <form className="space-y-6">
     
      <h2 className="text-lg font-bold text-black-700 text-left">
      Medical Information
      </h2>
     

      

     
      
       
       
       <div>
       {sections.map((section, index) => (
  <div
    key={index}
    className="border border-stroke p-4 mt-4 rounded-lg"
  >
    {/* Fields: Height, Weight, Blood Group */}
    <div className="flex items-center gap-4">
      {/* Height */}
      <input
        type="text"
        placeholder="Height"
        value={section.height}
        onChange={(e) => handleChange(index, 'height', e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {/* Weight */}
      <input
        type="text"
        placeholder="Weight"
        value={section.weight}
        onChange={(e) => handleChange(index, 'weight', e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {/* Blood Group */}
      <select
            value={section.bloodGroup}
            onChange={(e) =>
              handleChange(index, "bloodGroup", e.target.value)
            }
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((group) => (
              <option key={group.appLOVID} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
      
    </div>
  </div>
))}
   {/* Submit Button */}
   <button
  className="mt-4 bg-primary text-white py-2 px-4 rounded-lg"
  onClick={handleMedicalSubmit} // Attach the submit function
  type="button" // Ensure it's not a submit button
>
  Save Medical Information
</button>

     
    </div>
    </form>
            </FormWizard.TabContent>

            {/* Step 4: patient prefrences */}
          
            <FormWizard.TabContent
              title="Preferences"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                <i className="fa fa-cogs text-lg"></i>
                </div>
              }
            >
              <form className="space-y-4">
  <h2 className="text-lg font-bold text-black-700 text-left">
  Preferences
  </h2>

  
   <div style={gridStyle}>
        {checkboxes.map((label, index) => {
          // Convert label to lowercased and remove spaces for matching the state property
          const checkboxName = label.toLowerCase().replace(/\s+/g, "");

          return (
            <label key={index} style={itemStyle}>
              <input
                type="checkbox"
                name={checkboxName} // Use sanitized name
                checked={preferences[checkboxName] || false} // Dynamically bind state (default to false if undefined)
                onChange={handleCheckboxChange} // Toggle checkbox state
              />
              {label}
            </label>
          );
        })}
      </div>

      <button
        className="mt-4 bg-primary text-white py-2 px-4 rounded-lg"
        onClick={handlePreferencesSubmit}
      >
        Save Preferences
      </button>
</form>

            </FormWizard.TabContent>



            {/* Step 5: Patient Family members */}
            <FormWizard.TabContent
              title="Family"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="fa fa-users text-lg"></i>
                </div>
              }
            >
             <form className="space-y-6" onSubmit={handleFormSubmit}>
     
     <h2 className="text-lg font-bold text-black-700 text-left">
     Family Medical Information
     </h2>
    

     

    
     
      
      
      <div>
      {boxes.map((box, index) => (
  <div key={index} className="border border-stroke p-4 mt-4 rounded-lg">
    {/* Name, Email, and Phone in one row */}
    <div className="grid grid-cols-3 gap-4">
      {/* Name */}
      <div>
        <input
          type="text"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.name}
          onChange={(e) => handleSingleInputChange('name', e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.email}
          onChange={(e) => handleSingleInputChange('email', e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      {/* Phone */}
      <div>
        <input
          type="tel"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.phoneNumber}
          onChange={(e) => handleSingleInputChange('phoneNumber', e.target.value)}
          placeholder="Enter your number"
        />
      </div>
    </div>

    {/* Age, Blood Group, Height, Weight, Gender, and PAN in the second row (6 columns) */}
    <div className="grid grid-cols-6 gap-4 mt-4">
      {/* Age */}
     

      <div className="col-span-2">
              <input
                type="date"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.patientDateOfBirth}
                onChange={(e) => handleSingleInputChange('patientDateOfBirth', e.target.value)}
                placeholder="DOB"
              />
            </div>

      {/* Blood Group */}
      <div className="col-span-2">
                <select
                  value={box.bloodGroup || ""}
                  onChange={(e) => handleSingInputChange(index, "bloodGroup", e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((group) => (
                    <option key={group.appLOVID} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

     {/* Height */}
     <div className="col-span-1">
                <input
                  type="number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.height}
                  onChange={(e) => handleSingleInputChange('height', e.target.value)}
                  placeholder="Height (in cm)"
                />
              </div>

              {/* Weight */}
              <div className="col-span-1">
                <input
                  type="number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.weight}
                  onChange={(e) => handleSingleInputChange('weight', e.target.value)}
                  placeholder="Weight (in kg)"
                />
              </div>
    

      
    </div>
   
  </div>
  
))}
<div className='flex mt-4'>
<button
        type="submit"
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
      >
        Save
      </button>
      </div>





     {/* Add Button */}
     <div className="flex items-center justify-end gap-1 mt-4">
       <div
         className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
         onClick={handleAddBox}
       >
         +
       </div>
       <span className="text-sm font-medium text-black-600">Add</span>
     </div>
   </div>
   

   </form>

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

export default PatientFormWizard;
