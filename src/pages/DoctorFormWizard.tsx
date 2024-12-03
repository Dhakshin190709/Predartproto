import React, { useState } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const DoctorFormWizard: React.FC = () => {
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
           

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
  {/* Age and Gender */}
  <div className="grid grid-cols-2 gap-4">
    {/* Age */}
    <div>
      {/* <label className="block text-sm font-medium text-gray-700">Age</label> */}
      <input
        type="number"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={formData.age}
        onChange={(e) =>
          handleSingleInputChange('age', e.target.value)
        }
        placeholder="Enter age"
        style={{ paddingRight: '10px' }}
      />
    </div>

    {/* Gender */}
    <div>
      {/* <label className="block text-sm font-medium text-gray-700">Gender</label> */}
      <select
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={formData.gender}
        onChange={(e) =>
          handleSingleInputChange('gender', e.target.value)
        }
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
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
    onChange={(e) => updateAddress(index, 'type', e.target.value)}
  >
    <option value="Residential">UG</option>
    <option value="Commercial">PG</option>
  </select>

  {/* Checkbox with text */}
  <label className="flex items-center ml-4">
    <input
      type="checkbox"
      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:border-form-strokedark dark:bg-form-input"
      onChange={(e) => console.log(e.target.checked)} // Add your logic here
    />
    <span className="ml-2 text-sm text-gray-700 dark:text-white"><b>Is this your highest education</b></span>
  </label>
</div>


                    {/* Degree Name, Specialization, and Location in the same line */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-4 items-center">
  {/* Degree Name */}
  <div>
    <input
      type="text"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter your degree"
    />
  </div>

  {/* Specialization */}
  <div>
    <input
      type="text"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter your specialization"
    />
  </div>

  {/* Location */}
  <div>
    <input
      type="text"
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
      className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter your university name"
    />
  </div>

  {/* Starting Date */}
  <div className="relative">
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Starting date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
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

      {/* Ending Date */}
      <div className="relative">
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Ending date"
          className="w-full md:w-[280px] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
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
        {/* Dropdown for Language */}
        <select
          value={form.language}
          onChange={(e) =>
            handleMultipleFormsInputChange(
              form.id,
              'language',
              e.target.value,
            )
          }
          className="w-70 rounded-lg border border-stroke bg-transparent py-4 pl-8 pr-8
            text-black outline-none focus:border-primary dark:border-form-strokedark 
            dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">-- Select a Language --</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>

        {/* Checkboxes for Abilities */}
        <div className="flex gap-8 flex-grow">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.abilities.read}
              onChange={() => handleCheckboxChange(form.id, 'read')}
              className="mr-1"
            />
            Read
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.abilities.write}
              onChange={() => handleCheckboxChange(form.id, 'write')}
              className="mr-1"
            />
            Write
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.abilities.speak}
              onChange={() => handleCheckboxChange(form.id, 'speak')}
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
      {experiences.map((exp, index) => (
        <div key={index} className="w-full border border-stroke rounded-lg p-4">
          {/* Dropdown for Part-time/Full-time */}
          <div className="flex justify-between items-center mb-4">
            <select
              value={exp.type}
              onChange={(e) => updateExperience(index, 'type', e.target.value)}
              className="w-[120px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="Part-time">Part-time</option>
              <option value="Full-time">Full-time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
  {/* Specialization */}
  <input
    type="text"
    placeholder="Specialization"
    value={exp.specialization}
    onChange={(e) => updateExperience(index, 'specialization', e.target.value)}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
  {/* Hospital Name */}
  <input
    type="text"
    placeholder="Hospital Name"
    value={exp.hospitalName}
    onChange={(e) => updateExperience(index, 'hospitalName', e.target.value)}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />

  {/* Date Picker Row */}
  <div className="grid grid-cols-2 gap-4 w-full">
    {/* Join Date */}
    <div className="relative">
      <DatePicker
        selected={exp.joinDate}
        onChange={(date) => updateExperience(index, 'joinDate', date)}
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
        onChange={(date) => updateExperience(index, 'leaveDate', date)}
        dateFormat="MM/dd/yyyy"
        placeholderText="Leave Date"
        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
      /> <span
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

      <div className="flex items-center justify-end gap-1 ">
        {/* Clickable Icon */}
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addExperience}
        >
          +
        </div>

        {/* Non-clickable Text */}
        <span className="text-sm font-medium text-black-600">Add</span>
      </div>
    </div>


      {/* Skills Section */}
      <div>
        <h2 className="text-lg font-bold text-black-700 text-left">Skills</h2>

        {/* Initial Persistent Skill Form */}
        <div className="border border-stroke p-4 mt-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skill Dropdown */}
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">-- Select a Skill --</option>
              <option value="Surgery">Surgery</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>

            {/* Years of Experience Dropdown */}
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">-- Years of Experience --</option>
              {[...Array(21)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>

            {/* Months of Experience Dropdown */}
            <select
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">-- Months of Experience --</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <textarea
            placeholder="Description"
            className="w-full mt-4 rounded-lg border border-stroke bg-transparent py-2 px-4 text-black 
              outline-none focus:border-primary dark:border-form-strokedark 
              dark:bg-form-input dark:text-white dark:focus:border-primary"
          ></textarea>
        </div>

        {/* Additional Skill Forms */}
        {skills.map((skill, index) => (
          <div key={index} className="border border-stroke p-4 mt-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skill Dropdown */}
              <select
                value={skill.skill}
                onChange={(e) => handleSkillChange(index, 'skill', e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                  text-black outline-none focus:border-primary dark:border-form-strokedark 
                  dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">-- Select a Skill --</option>
                <option value="Surgery">Surgery</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>

              {/* Years of Experience Dropdown */}
              <select
                value={skill.years}
                onChange={(e) => handleSkillChange(index, 'years', e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                  text-black outline-none focus:border-primary dark:border-form-strokedark 
                  dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">-- Years of Experience --</option>
                {[...Array(21)].map((_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>

              {/* Months of Experience Dropdown */}
              <select
                value={skill.months}
                onChange={(e) => handleSkillChange(index, 'months', e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                  text-black outline-none focus:border-primary dark:border-form-strokedark 
                  dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">-- Months of Experience --</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <textarea
              value={skill.description}
              onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
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
        
        {/* Add Button */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={handleAddSkill}
          >
            +
          </div>
          <span className="text-sm font-medium text-black-600">Add</span>
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
  <div className="flex items-center justify-end gap-1 mt-2 px-80">
    <div
      className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
      onClick={addAward}
    >
      +
    </div>
    <span className="text-sm font-medium pr-5 text-black-600">Add</span>
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
    <div key={index} className="grid grid-cols-5 gap-2 items-center">
      {/* Day Label */}
      <div>
        <label className="block font-medium text-blue-500">{slot.day}</label>
      </div>

      {/* Hospital Dropdown */}
      <div className="col-span-2"> {/* Makes the dropdown wider */}
        <select
          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
          text-black outline-none focus:border-primary dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={slot.hospital || ""}
          onChange={(e) => handleTimeChange(index, "hospital", e.target.value)}
        >
          <option value="">Select Hospital</option>
          <option value="Hospital A">Hospital A</option>
          <option value="Hospital B">Hospital B</option>
          <option value="Hospital C">Hospital C</option>
        </select>
      </div>

      {/* From Time */}
      <div>
        <DatePicker
          selected={slot.fromTime}
          onChange={(time) => handleTimeChange(index, "fromTime", time)}
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
          onChange={(time) => handleTimeChange(index, "toTime", time)}
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
      <div className="col-span-5 flex justify-end mt-2"> {/* Using flex and justify-end to align to the right */}
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
    <h3 className="text-lg font-medium mb-4">Additional Information</h3>
    <div className="grid grid-cols-2 gap-4">
      {/* Checkbox 1 */}
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="form-checkbox text-blue-500" />
        <span>I'm ready to work in government holidays</span>
      </label>

      {/* Checkbox 2 */}
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="form-checkbox text-blue-500" />
        <span>I'm ready to work in government holidays</span>
      </label>

      {/* Checkbox 3 */}
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="form-checkbox text-blue-500" />
        <span>I'm ready to work in government holidays</span>
      </label>

      {/* Checkbox 4 */}
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="form-checkbox text-blue-500" />
        <span>I'm ready to work in government holidays</span>
      </label>
    </div>
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
             <div className="p-4">
  <h2 className="w-100 text-lg font-bold text-black-700 text-left">Documents</h2>
 

  {/* Container for upload boxes */}
  <div className="flex flex-col gap-4 mt-4"> {/* Changed flex-wrap to flex-col */}
  {uploadBoxes.map((box) => (
    <div
      key={box.id}
      className="w-full sm:w-80 md:w-96 rounded-lg border border-stroke bg-transparent py-4 px-6"
    >
      {/* Dropdown */}
      <select
        value={box.selectedType}
        onChange={(e) => handleDropdownChange(box.id, e.target.value)}
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
          handleFileChange(box.id, { target: { files: e.dataTransfer.files } });
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
                {box.previewType === "image" ? (
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
    <span className="text-sm pr-7 font-medium text-black-600">Add</span>
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
