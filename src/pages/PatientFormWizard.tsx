import React, { useState } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PatientFormWizard: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    date: null as Date | null,
  });

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

  const [addresses, setAddresses] = useState([
    {
      type: 'Residential',
      address1: '',
      address2: '',
      city: '',
      district: '',
      state: '',
      country: '',
      pincode: '',
      active: true,
      degreeName: '',
      specialization: '',
      university: '',
      location: '',
      startingDate: '',
      endingDate: '',
    },
  ]);

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

  

    
  
  const handleCheckboxChange = (id, ability) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === id
          ? {
              ...form,
              abilities: {
                ...form.abilities,
                [ability]: !form.abilities[ability],
              },
            }
          : form,
      ),
    );
  };

  const removeForm = (id) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== id));
  };

  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

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

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        type: 'Residential',
        address1: '',
        address2: '',
        city: '',
        district: '',
        state: '',
        country: '',
        pincode: '',
        active: true,
        degreeName: '',
        specialization: '',
        university: '',
        location: '',
        startingDate: '',
        endingDate: '',
      },
    ]);
  };

  const [sections, setSections] = useState([
    { height: '', weight: '', bloodGroup: '' }
  ]);
  
  const updateAwardField = (
    index: number,
    field: keyof Award,
    value: string,
  ) => {
    const updatedAwards = [...awards];
    updatedAwards[index][field] = value;
    setAwards(updatedAwards);
  };

  const removeAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  };
  
  
  const updateAddress = (
    index: number,
    key: string,
    value: string | boolean,
  ) => {
    const updatedAddresses = addresses.map((address, i) =>
      i === index ? { ...address, [key]: value } : address,
    );
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

  const [boxes, setBoxes] = useState([{ height: '', weight: '', bloodGroup: '' }]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index][field] = value;
    setBoxes(updatedBoxes);
  };

  const handleAddBox = () => {
    setBoxes([...boxes, { height: '', weight: '', bloodGroup: '' }]);
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
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    padding: '1rem',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
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
         <form className="space-y-4">
  {/* First Line: Name and Email */}
  <div className="grid grid-cols-2 gap-4">
    {/* Name */}
    <div>

      <input
        type="text"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={formData.name}
        onChange={(e) => handleSingleInputChange('name', e.target.value)}
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
        value={formData.email}
        onChange={(e) => handleSingleInputChange('email', e.target.value)}
        placeholder="Enter your email"
      />
    </div>
  </div>

  {/* Second Line: Phone (below Name), Age and Gender (below Email) */}
  <div className="grid grid-cols-2 gap-4">
    {/* Phone */}
    <div>
      <input
        type="tel"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={formData.phone}
        onChange={(e) => handleSingleInputChange('phone', e.target.value)}
        placeholder="Enter your phone"
      />
    </div>

    {/* Age and Gender */}
    <div className="grid grid-cols-2 gap-4">
      {/* Age */}
      <div>
        <input
          type="number"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.age}
          onChange={(e) => handleSingleInputChange('age', e.target.value)}
          placeholder="Enter your age"
        />
      </div>

      {/* Gender */}
      <div>
        <select
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.gender}
          onChange={(e) => handleSingleInputChange('gender', e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
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
              <form className="space-y-4">
              

               
                
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
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
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
                        {/* <label className="block text-sm font-medium text-gray-700">
      District
    </label> */}
                        <select
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.district}
                          onChange={(e) =>
                            updateAddress(index, 'district', e.target.value)
                          }
                        >
                          <option value="">Select District</option>
                          <option value="District 1">District 1</option>
                          <option value="District 2">District 2</option>
                          {/* Add more options as required */}
                        </select>
                      </div>

                      <div>
                        {/* <label className="block text-sm font-medium text-gray-700">
      State
    </label> */}
                        <select
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={address.state}
                          onChange={(e) =>
                            updateAddress(index, 'state', e.target.value)
                          }
                        >
                          <option value="">Select State</option>
                          <option value="State 1">State 1</option>
                          <option value="State 2">State 2</option>
                          {/* Add more options as required */}
                        </select>
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
                          value={address.pincode}
                          onChange={(e) =>
                            updateAddress(index, 'pincode', e.target.value)
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
                    className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
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
        onChange={(e) => handleInputChange(index, 'height', e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {/* Weight */}
      <input
        type="text"
        placeholder="Weight"
        value={section.weight}
        onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {/* Blood Group */}
      <select
        value={section.bloodGroup}
        onChange={(e) => handleInputChange(index, 'bloodGroup', e.target.value)}
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      >
        <option value="">Select Blood Group</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
      </select>
    </div>
  </div>
))}


     
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
      {checkboxes.map((label, index) => (
        <label key={index} style={itemStyle}>
          <input type="checkbox" />
          {label}
        </label>
      ))}
    </div>
  
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
             <form className="space-y-6">
     
     <h2 className="text-lg font-bold text-black-700 text-left">
     Medical Information
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
          value={formData.phone}
          onChange={(e) => handleSingleInputChange('phone', e.target.value)}
          placeholder="Enter your number"
        />
      </div>
    </div>

    {/* Age, Blood Group, Height, Weight, Gender, and PAN in the second row (6 columns) */}
    <div className="grid grid-cols-6 gap-4 mt-4">
      {/* Age */}
      <div className="col-span-1">
        <input
          type="number"
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={formData.age}
          onChange={(e) => handleSingleInputChange('age', e.target.value)}
          placeholder="Enter age"
          style={{ paddingRight: '10px' }}
        />
      </div>

      {/* Blood Group */}
      <div className="col-span-1">
        <select
          value={box.bloodGroup}
          onChange={(e) => handleInputChange(index, 'bloodGroup', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Blood</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>

      {/* Height */}
      <div className="col-span-1">
        <input
          type="text"
          placeholder="Height"
          value={box.height}
          onChange={(e) => handleInputChange(index, 'height', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>

      {/* Weight */}
      <div className="col-span-1">
        <input
          type="text"
          placeholder="Weight"
          value={box.weight}
          onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>

     

      
    </div>
  </div>
))}








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
