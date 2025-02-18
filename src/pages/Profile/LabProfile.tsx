import React, { useState,useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';


const LabProfile: React.FC = () => {

   const [formData, setFormData] = useState({
          tenant: '',
          hospitalType: '',
          
        });

     const [hospitals, setHospitals] = useState([]);
      const [tenants, setTenants] = useState([]); 


  const [genderOptions, setGenderOptions] = useState<string[]>([]); // State to store gender options
  
  const [selectedAddress, setSelectedAddress] = useState(null);
 
  const [selectedFacilities, setSelectedFacilities] = useState<LabFacility[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeArrow, setActiveArrow] = useState<string | null>(null);

  const handleSelectAddress = (addressIndex) => {
    setSelectedAddress(addresses[addressIndex]);
    console.log("Selected Address:", addresses[index]);
  };

  interface LabFacility {
    laboratoryID: string;
    labFacilities: string;
  }
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
  const [selectedFacilitiesType, setSelectedFacilitiesType] = useState("");
  
 
  const [facilities, setFacilities] = useState<string[]>([]);
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(
          "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=facilitiestype"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch facilities");
        }
  
        const responseData = await response.json();
        console.log("Fetched Data:", responseData); // Debugging: Check API response
  
        // Ensure data is an array and extract `name`
        if (Array.isArray(responseData.data)) {
          const facilityNames = responseData.data.map((item) => ({
            id: item.appLOVID, // Unique key
            name: item.name, // Extracted name
          }));
          setFacilities(facilityNames);
        } else {
          console.error("Unexpected data format:", responseData);
          setFacilities([]); // Prevent crashes
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]); // Prevent undefined errors
      }
    };
  
    fetchFacilities();
  }, []);
  
  

  
  // State to store time slots

const [labTypes, setLabTypes] = useState([]);




const [labDetails, setLabDetails] = useState<any>(null);
const labID = "bc4c719a-768e-4702-9ead-08dd49c3522e";

const handleArrowClick = (arrow) => {
  setActiveArrow(arrow);
};
 const [selectedLabType, setSelectedLabType] = useState("");
const [labName, setLabName] = useState("");
const [labCode, setLabCode] = useState("");
const [labFacilities, setLabFacilities] = useState("");


  const [patientID, setPatientID] = useState(null); // State to store patientID
  const [facilitiesTypes, setFacilitiesTypes] = useState([]);


  useEffect(() => {
    fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
      .then((response) => response.json())
      .then((data) => {
        const filteredAddressTypes = data.data.filter(
          (item) => item.type === "Address"
        );
        const filteredLabTypes = data.data.filter(
          (item) => item.type === "LabType"
        );
        const filteredFacilitiesTypes = data.data.filter(
          (item) => item.type === "FacilitiesType"
        );

        setAddressTypes(filteredAddressTypes);
        setLabTypes(filteredLabTypes);
        setFacilitiesTypes(filteredFacilitiesTypes);
      })
      .catch((error) => console.error("Error fetching data:", error));
}, []);

useEffect(() => {
  const fetchLabDetails = async () => {
    try {

      const response = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Laboratory/${labID}`
      );

      if (response.data && response.data.data) {
        const { labName, labCode, labType, labFacilities } = response.data.data;

        // Split labFacilities string into an array
        const facilitiesArray = labFacilities
          ? labFacilities.split(",").map((id) => id.trim())
          : [];

        console.log("Lab Name:", labName);
        console.log("Lab Code:", labCode);
        console.log("Lab Type:", labType);
        console.log("Lab Facilities:", facilitiesArray); // Now an array

        setLabDetails({
          ...response.data.data,
          labFacilities: facilitiesArray, // Store as an array
        });
      } else {
        console.error("Unexpected API response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching lab details:", error);
    }
  };

  fetchLabDetails();
}, []);

useEffect(() => {
  const fetchFacilities = async () => {
    try {
      const facilitiesRes = await axios.get(
        "https://predart003-001-site1.anytempurl.com/api/AppLOV?type=facilitiestype"
      );

      if (!facilitiesRes.data || !Array.isArray(facilitiesRes.data.data)) {
        throw new Error("Invalid facilities response");
      }

      console.log("Facilities API Response:", facilitiesRes.data.data); // Debugging

      // Create a Map of facility IDs to Names
      const facilityMap = new Map(
        facilitiesRes.data.data.map((f: any) => [f.appLOVID, f.name])
      );

      // Ensure labFacilities exist and map correctly
      let selectedFacilitiesData: { id: string; name: string }[] = [];

      if (labDetails?.labFacilities && Array.isArray(labDetails.labFacilities)) {
        selectedFacilitiesData = labDetails.labFacilities
          .map((id: string) => ({
            id,
            name: facilityMap.get(id) || "Unknown",
          }))
          .filter((item) => item.name !== "Unknown");

        console.log("Mapped Selected Facilities:", selectedFacilitiesData); // Debugging
      }

      setSelectedFacilities(selectedFacilitiesData);

      // Remove selected facilities from available facilities
      const availableFacilities = facilitiesRes.data.data
        .filter((f: any) => !selectedFacilitiesData.some((sf) => sf.id === f.appLOVID))
        .map((f: any) => ({ id: f.appLOVID, name: f.name }));

      console.log("Available Facilities (Left Box):", availableFacilities); // Debugging
      setFacilities(availableFacilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    }
  };

  if (labDetails) {
    fetchFacilities();
  }
}, [labDetails]);





  // Handle Checkbox Selection
  const handleCheckboxChange = (id: string) => {
    setChecked((prevChecked) => {
      const newChecked = new Set(prevChecked);
      newChecked.has(id) ? newChecked.delete(id) : newChecked.add(id);
      return newChecked;
    });
  };

// Move to Selected Facilities
const moveToSelected = () => {
  const selectedItems = facilities.filter((f) => checked.has(f.id));
  setSelectedFacilities([...selectedFacilities, ...selectedItems]);
  setFacilities(facilities.filter((f) => !checked.has(f.id)));
  setChecked(new Set());
};

// Move back to Available Facilities
const moveToAvailable = () => {
  const returningItems = selectedFacilities.filter((f) =>
    checked.has(f.id)
  );
  setFacilities([...facilities, ...returningItems]);
  setSelectedFacilities(selectedFacilities.filter((f) => !checked.has(f.id)));
  setChecked(new Set());
};
  

const [weekdays, setWeekdays] = useState([]);

const [timeSlots, setTimeSlots] = useState([
  { day: '', hospital: '', duration: '', fromTime: null, toTime: null } 
]);

useEffect(() => {
  fetchHospitals();
  fetchWeekdays();
}, []);




const fetchHospitals = async () => {
  try {
    const response = await fetch('https://predart003-001-site1.anytempurl.com/api/Hospital');
    const data = await response.json();
    if (data && data.data) {
      setHospitals(data.data);
    }
  } catch (error) {
    console.error('Error fetching hospitals:', error);
  }
};

const handleHospitalChange = (index, value) => {
  setTimeSlots((prevSlots) =>
    prevSlots.map((slot, i) =>
      i === index ? { ...slot, hospital: value } : slot // Update only the selected row
    )
  );
};

const fetchWeekdays = async () => {
  try {
    const response = await fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Weekday');
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      setWeekdays(result.data);
    }
  } catch (error) {
    console.error('Error fetching weekdays:', error);
  }
};

const addNewRow = () => {
  setTimeSlots([...timeSlots, { day: '', hospital: '', duration: '', fromTime: null, toTime: null }]);
};

const handleChange = (index, field, value) => {
  const updatedSlots = [...timeSlots];
  updatedSlots[index][field] = value;
  setTimeSlots(updatedSlots);
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
  const [addressTypes, setAddressTypes] = useState([]);
  

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
  
  

  
 

  
  // Handle input change for form data
  const handleSingleInputChange = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  
 
  
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
  

  

 
  
  

 
 
  const [isPopupVisible, setPopupVisible] = useState(false);


  
  
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  

    
  
 

  
  

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleComplete = () => {
    console.log('Form completed!');
    setPopupVisible(true);
  };

 

 

 
 
  

  

 
  
  
  
 


 
const checkboxes = [
  "Blood Test",
  "X Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "ECG (Electrocardiogram)",
  "Liver Function Test (LFT)",
  "Diabetes Test (Blood Sugar Test)",
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




  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

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

  // Initialize all preferences as false
  const [preferences, setPreferences] = useState({
    
    BloodTest:false,
    XRay:false,
    MRIScan:false,
    CTScan:false,
    Ultrasound:false,
    ECG:false,
    LiverFunctionTest:false,
    DiabetesTest:false,
  });

  
  
  
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


const [createdLaboratoryID, setCreatedLaboratoryID] = useState(null); // Store the created lab ID

// ✅ CREATE LAB (POST)
const handleCreateLab = async (e) => {
  e.preventDefault(); // Prevent page refresh

  console.log("Creating Lab...");

  // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }

  const labFacilitiesString = selectedFacilities
    .map((facility) => facility.laboratoryID)
    .join(",");

  const payload = {
    createdBy: userID, // ✅ Dynamically set from sessionStorage
    tenantID: formData.tenant,
    hospitalID: formData.hospitalType,
    labName: labName,
    labCode: labCode,
    labType: selectedLabType,
    labFacilities: labFacilitiesString,
  };

  try {
    const response = await axios.post(
      "https://predart003-001-site1.anytempurl.com/api/Laboratory",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Lab Created Successfully:", response.data);

    if (response.data && response.data.laboratoryID) {
      console.log("Generated Laboratory ID:", response.data.laboratoryID); // ✅ Log Lab ID in Console
      setCreatedLaboratoryID(response.data.laboratoryID); // ✅ Store the Lab ID for updates
    } else {
      console.error("No Laboratory ID returned from API!");
    }

    alert("Lab Created Successfully!");
  } catch (error) {
    console.error("Error creating lab:", error);
    alert("Failed to create lab. Please try again.");
  }
};



 



  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User not logged in. Please log in again.");
      return;
    }
  
    const payload = {
      laboratoryID: labID,
      tenantID: labDetails?.tenantID || "",
      hospitalID: labDetails?.hospitalID || "",
      labName: labDetails?.labName || "",
      labCode: labDetails?.labCode || "",
      labType: labDetails?.labType || "",
      labFacilities: selectedFacilities.map((f) => f.id).join(","), // Convert array to comma-separated string
      createdBy: userID,
    };
  
    try {
      await axios.put(
        "https://predart003-001-site1.anytempurl.com/api/Laboratory/Facilities",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
  
      alert("Lab Facilities Updated Successfully!");
    } catch (error) {
      console.error("Error updating lab facilities:", error);
      alert("Failed to update lab facilities. Please try again.");
    }
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
      <form className="space-y-4" onSubmit={handleCreateLab}>

      <h2 className="text-lg font-bold text-black-700 text-left">
  Basic Informations
  </h2>
  <div className="grid grid-cols-3 gap-4">
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
                            {tenant.tenantName}{' '}
                            {/* Display the tenant's name */}
                          </option>
                        ))}
                      </select>

                     
                    </div>

                    {/* Hospital */}
                    <div>
                      <select
                        value={formData.hospitalType}
                        onChange={(e) =>
                          handleSingleInputChange(
                            'hospitalType',
                            e.target.value,
                          )
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
                    <div>
    {/* Lab Name Input */}
    <input
      type="text"
      placeholder="Enter Lab Name"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      value={labName}
      onChange={(e) => setLabName(e.target.value)}
    />
  </div>
                  </div>

                  
<div className="grid grid-cols-3 gap-4 mt-4">
  
 
  <div>
    {/* Code Input */}
    <input
      type="text"
      placeholder="Enter Code"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10  
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      value={labCode}
      onChange={(e) => setLabCode(e.target.value)}
    />
  
  </div>
  

                 
                    <div>
                  <select
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
  value={selectedLabType} // Ensure you have a state for this
  onChange={(e) => setSelectedLabType(e.target.value)}
>
  <option value="">Select Lab Type</option>
  {labTypes.map((type) => (
    <option key={type.appLOVID} value={type.name}>
      {type.name}
    </option>
  ))}
</select>
</div>
<div>
{/* Facilities Input */}
<select
  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
  value={selectedFacilitiesType} // Ensure you have a state for this
  onChange={(e) => setSelectedFacilitiesType(e.target.value)}
>
  <option value="">Select Facilities Type</option>
  {facilitiesTypes.map((type) => (
    <option key={type.appLOVID} value={type.name}>
      {type.name}
    </option>
  ))}
</select>

</div>

</div>
<div className="mt-9">
<button
 type="submit"
  
  className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
    hover:from-[#007BFF] hover:to-[#004A99]
    text-white transition duration-150 
    ease-out hover:ease-in py-2 px-5 rounded-lg"
>
 Save Basic details
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
    <button onClick={handleAddressSubmit} 
      type="button"
      className="bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white py-2 px-6 rounded-lg hover:from-[#007BFF] hover:to-[#004A99]"
     
    >
      Save Address
    </button>

    
  </div>
  </form>
</FormWizard.TabContent>


            

            {/* Step 3: patient prefrences */}
          
            <FormWizard.TabContent
              title="Facilities"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                <i className="fa fa-cogs text-lg"></i>
                </div>
              }
            >
              <form className="space-y-4" onSubmit={handleSave}>
              <h2 className="text-lg font-bold text-black-700 text-left">Facilities</h2>

  {/* Available Facilities */}
  <div className="flex items-center justify-center space-x-4">
      {/* Available Lab Facilities Box */}
      <div className="w-64 h-80 p-4 bg-white border border-blue-200 rounded-lg shadow-lg overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Available Lab Facilities
        </h3>
        <ul className="space-y-2">4
          {facilities.length > 0 ? (
            facilities.map((facility) => (
              <li key={facility.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked.has(facility.id)}
                  onChange={() => handleCheckboxChange(facility.id)}
                  className="mr-2"
                />
                <p className="text-gray-600">{facility.name}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No lab facilities available
            </p>
          )}
        </ul>
      </div>

      
{/* Arrows in the middle */}
<div className="flex flex-col items-center space-y-4">
  {/* Right Arrow (Move to Selected) */}
  <button
    type="button"
    onClick={() => {
      moveToSelected();
      handleArrowClick("right");
    }}
    disabled={checked.size === 0}
    className={`w-14 h-14 flex items-center justify-center rounded-full text-4xl font-bold transition-all shadow-lg border-2
      ${
        checked.size === 0
          ? "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed"
          : activeArrow === "left"
          ? "bg-green-500 text-white border-green-600 scale-110"
          : "bg-gray-200 text-gray-600 border-gray-400 hover:bg-gray-400 hover:text-white hover:scale-105"
      }`}
  >
    ➡
  </button>

  {/* Left Arrow (Move to Available) */}
  <button
    type="button"
    onClick={() => {
      moveToAvailable();
      handleArrowClick("left");
    }}
    disabled={checked.size === 0}
    className={`w-14 h-14 flex items-center justify-center rounded-full text-4xl font-bold transition-all shadow-lg border-2
      ${
        checked.size === 0
          ? "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed"
          : activeArrow === "right"
          ? "bg-green-500 text-white border-green-600 scale-110"
          : "bg-gray-200 text-gray-600 border-gray-400 hover:bg-gray-400 hover:text-white hover:scale-105"
      }`}
  >
    ⬅
  </button>
</div>




      {/* Selected Facilities Box */}
      <div className="w-64 h-80 p-4 bg-white border border-blue-200 rounded-lg shadow-lg overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Selected Lab Facilities
        </h3>
        {selectedFacilities.length === 0 ? (
          <p className="text-gray-500 text-center">No selected facilities</p>
        ) : (
          <ul className="space-y-2">
            {selectedFacilities.map((facility) => (
              <li key={facility.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked.has(facility.id)}
                  onChange={() => handleCheckboxChange(facility.id)}
                  className="mr-2"
                />
                <p className="text-gray-600">{facility.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>


    <button
        type="submit"
        className="mt-4 bg-primary text-white py-2 px-4 rounded-lg"
      >
        Save Facilities
      </button>
    </form>

            </FormWizard.TabContent>

{/* Step 4: Patient slot */}
           
            <FormWizard.TabContent
              title="Time Slots"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="far fa-clock"></i>
                </div>
              }
            >
              <div className="space-y-6">
              <h2 className="text-lg font-bold text-black-700 text-left">
  Time slots
  </h2>
                
  <div className="col-span-2">
  {timeSlots.map((slot, index) => (
   <div
   key={index}
   className="flex gap-4 items-center border border-stroke rounded-lg p-4 
   bg-transparent dark:border-form-strokedark dark:bg-form-input"
 >
   {/* Day Selection */}
   <select
     value={slot.day}
     onChange={(e) => handleChange(index, "day", e.target.value)}
     className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
   >
     <option value="">Select Day</option>
     {weekdays.map((day) => (
       <option key={day.id} value={day.name}>
         {day.name}
       </option>
     ))}
   </select>
 
   {/* Hospital Selection */}
   <select
     value={slot.hospital}
     onChange={(e) => handleChange(index, "hospital", e.target.value)}
     className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
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
 
   {/* Duration Input */}
   <input
     type="text"
     placeholder="Duration (mins)"
     value={slot.duration}
     onChange={(e) => handleChange(index, "duration", e.target.value)}
     className="w-[20%] rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
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
     className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
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
     className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
     text-black outline-none focus:border-primary dark:border-form-strokedark 
     dark:bg-form-input dark:text-white dark:focus:border-primary"
   />
 </div>
 
  ))}

 


  <div className="flex items-center justify-end gap-1 mt-4">
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
                  <span className="text-sm font-medium text-black-600">
                    Add
                  </span>
                </div>
</div>


                  
                  
               <button
          type="button"
         
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]
            text-white transition duration-150 
            ease-out hover:ease-in py-2 px-5 rounded-lg mt-4"
        >
         Save Slot
        </button>

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

export default LabProfile;
