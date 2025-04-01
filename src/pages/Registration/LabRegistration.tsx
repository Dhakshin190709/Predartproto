import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
const LabRegistration: React.FC = () => {
    const [formData, setFormData] = useState({
        
        tenant: '',
        hospitalType: '',
        
      });
   const [hospitals, setHospitals] = useState([]);
    const [tenants, setTenants] = useState([]); 
  const [address, setAddress] = useState<string>('');
 
 const [patientID, setPatientID] = useState(null);
  
 const [labTypes, setLabTypes] = useState([]);

 const [selectedLabType, setSelectedLabType] = useState("");
const [labName, setLabName] = useState("");
const [labCode, setLabCode] = useState("");
const [labFacilities, setLabFacilities] = useState("");
const [selectedFacilitiesType, setSelectedFacilitiesType] = useState("");

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle the form submission
    
  };

  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
   
  };
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
const [addressTypes, setAddressTypes] = useState([]);
   const [selectedAddress, setSelectedAddress] = useState(null);

   const handleSelectAddress = (addressIndex) => {
    setSelectedAddress(addresses[addressIndex]);
    console.log("Selected Address:", addresses[addressIndex]); // Use addressIndex instead of index
  };
  
  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  };

  const handleAddressSubmit = () => {

    // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }
    // Add patientID and createdBy to each address dynamically
    const addressData = addresses.map((address) => ({
      ...address,
      id: patientID,
      createdBy: userID,
  
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


  const handleLabSubmit = async () => {
   

    // Retrieve userID from sessionStorage
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    console.error("User ID not found in session storage.");
    alert("User not logged in. Please log in again.");
    return;
  }

    // Find the corresponding ID for the selected labType
    // const selectedLab = labTypes.find((type) => type.name === selectedLabType);

    const payload = {
      createdBy: userID, // Replace with actual logged-in user ID
      tenantID: formData.tenant, // Ensure this is an ID
      hospitalID: formData.hospitalType, // Ensure this is an ID
      labName: labName,
      labCode: labCode,
      // labType: selectedLab ? selectedLab.appLOVID : null, // Convert name to ID
      labType: selectedLabType,
      labFacilities: selectedFacilitiesType,
    };

    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Laboratory",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Lab Created Successfully:", response.data);
      alert("Lab Created Successfully!");
      
      // Reset Form
      setLabName("");
      setLabCode("");
      setSelectedLabType("");
      setLabFacilities("");
    } catch (error) {
      console.error("Error creating lab:", error);
      
    } 
  };
  return (
    <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    {/* Right Section */}
    <div className="w-full border-stroke dark:border-strokedark">
      <div className="w-full p-0 sm:p-4 xl:p-6">
        {' '}
        {/* Reduced padding */}
        <h2 className="mt-0 mb-3 text-2xl font-semibold text-black dark:text-white sm:text-title-xl2">
         Lab Registration
        </h2>
    
      
      <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  
<div className="grid grid-cols-2 gap-4 mt-4">
  
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
  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
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



                  {addresses.map((address, index) => (
                  <div key={index} onClick={() => handleSelectAddress(index)}

        className="w-full mt-4 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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



<div className="mt-9">



<CustomButton onClick={() => {
    handleAddressSubmit();
    handleLabSubmit(); 
  }}>
      Login
    </CustomButton>
                </div>

      </form>
    
    </div>
    </div>
    
  
    
    </div>

  );
};

export default LabRegistration;
