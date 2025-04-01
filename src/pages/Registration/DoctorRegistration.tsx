import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MySVG from '../../components/MySvgComponent';
const DoctorRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    gender: '',
    tenant: '',
    hospitalType: '',
    DateOfBirth: '',
    aadhaar: '',
    pan: '',
   
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    hospitalType: '',
    qualification: '',
    specialization: '',
    DateOfBirth:'',
    aadhaar:'',
gender:'',
    pan:'',
    tenant:'',
  });
  const [hospitals, setHospitals] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
 
  const [genders, setGenders] = useState([]);
  const [hospitalTypes, setHospitalTypes] = useState([]);

  const validateFields = () => {
    console.log('Form Data Before Validation:', formData);
  
    const newErrors = {
      name: formData.name ? '' : 'Name is required.',
      email:
        formData.email && /^[^@.]+@[^@.]+\.[^@.]+$/.test(formData.email)
          ? ''
          : 'Valid email is required (only one "@" and one "." allowed).',
      phone:
        formData.phone && /^\d{10}$/.test(formData.phone)
          ? ''
          : 'Phone number must be 10 digits.',
      qualification: formData.qualification ? '' : 'Qualification is required.',
      specialization: formData.specialization ? '' : 'Specialization is required.',
      tenant: formData.tenant ? '' : 'Tenant is required.',
      hospitalType: formData.hospitalType ? '' : 'Hospital is required.',
      gender: formData.gender ? '' : 'Gender is required.',
      aadhaar:
        formData.aadhaar && /^\d{12}$/.test(formData.aadhaar)
          ? ''
          : 'Aadhar number must be 12 digits.',
          pan: !formData.pan || !formData.pan.trim()
          ? "PAN number is required"
          : /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)
            ? ""
            : "Invalid PAN format (e.g., ABCDE1234F)",
        



      DateOfBirth: (() => {
        if (!formData.DateOfBirth) {
          return 'Date of Birth is required.';
        }
        const dob = new Date(formData.DateOfBirth);
        const today = new Date();
  
        // Check if the date is in the future
        if (dob > today) {
          return 'Date of Birth cannot be in the future.';
        }
  
        // Calculate age
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age < 18 ? 'Minimum age is 18.' : '';
      })()
    };
  
    console.log('Validation Errors:', newErrors);
    setErrors(newErrors);
    // Return true if all fields are valid (i.e. no error messages exist)
    return Object.values(newErrors).every((error) => error === '');
  };
  
  

  const handleRegister = async () => {
  const userID = sessionStorage.getItem("userID");
  if (!userID) {
    alert("User not logged in. Please log in again.");
    return { isValid: false, errors: { userID: "User not logged in." } };
  }
  console.log("Submit button clicked!");

  if (!validateFields()) {
    console.log("Validation failed!");
    setSuccessMessage("");
    return;
  }

  console.log("Validation passed. Sending data...");

  const requestData = {
    createdBy: userID, // Replace with actual logged-in user ID
    tenantID: formData.tenant, // Ensure this is an ID
    hospitalID: formData.hospitalType, // Ensure this is an ID
    doctorName: formData.name,
    doctorDateOfBirth: formData.DateOfBirth,
    doctorEmail: formData.email,
    doctorPhoneNumber: formData.phone,
    doctorGender: genders.find((g) => g.appLOVID === formData.gender)?.name, // Convert ID to string value
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

    console.log("API Response:", response);

    if (response.status === 200 || response.status === 201) {
      // Extract the doctorID from the response and store it in sessionStorage
      const doctorID = response.data.data;
      sessionStorage.setItem("doctorID", doctorID);
      console.log("Stored doctorID:", doctorID);

      setSuccessMessage("Doctor registered successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        specialization: "",
        gender: "",
        tenant: "",
        hospitalType: "",
        DateOfBirth: "",
        aadhaar: "",
        pan: "",
      });
    } else {
      setSuccessMessage("Something went wrong. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    setSuccessMessage("Error occurred while registering the doctor.");
  }
};


  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: '' }); // Clear the error for the field as the user types
  };

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // Filter and set state
          setQualifications(
            data.data.filter((item) => item.type === 'Qualification'),
          );
          setSpecializations(
            data.data.filter((item) => item.type === 'Specializations'),
          );
          setGenders(data.data.filter((item) => item.type === 'Gender'));
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

 
  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        console.log('API Response:', data); // This will show the array of hospital objects
        if (Array.isArray(data)) {
          setHospitals(data); // Directly set the hospitals since data is an array
        } else {
          console.warn('Unexpected response format:', data);
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
  

  return (
    
    <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    {/* Right Section */}
    <div className="w-full border-stroke dark:border-strokedark">
      <div className="w-full p-0 sm:p-4 xl:p-6">
        {' '}
        {/* Reduced padding */}
        <h2 className="mt-0 mb-3 text-2xl font-semibold text-black dark:text-white sm:text-title-xl2">
         Doctor Registration
        </h2>
                <form className="space-y-4">
                  {/* Tenant */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                     {/* Conditionally render the tenant dropdown only for SuperAdmin */}
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



                      {errors.tenant && (
                        <p className="text-red-500 text-sm">{errors.tenant}</p>
                      )}
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

                      {errors.hospitalType && (
                        <p className="text-red-500 text-sm">
                          {errors.hospitalType}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Name */}
                  <div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                        text-black outline-none focus:border-primary dark:border-form-strokedark 
                        dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={formData.name}
                      maxLength={20}
                      onChange={(e) =>
                        handleSingleInputChange('name', e.target.value)
                      }
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
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
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone & DOB */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
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
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                text-black outline-none focus:border-primary dark:border-form-strokedark 
                dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={formData.DateOfBirth}
                        onChange={(e) =>
                          handleSingleInputChange('DateOfBirth', e.target.value)
                        }
                        placeholder="DOB"
                      />
                       {errors.DateOfBirth && (
                        <p className="text-red-500 text-sm">{errors.DateOfBirth}</p>
                      )}
                    </div>
                  </div>
                  {/* Qualification */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Qualification */}
                    <div>
                      <select
                        value={formData.qualification}
                        onChange={(e) =>
                          handleSingleInputChange(
                            'qualification',
                            e.target.value,
                          )
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

                      {errors.qualification && (
                        <p className="text-red-500 text-sm">
                          {errors.qualification}
                        </p>
                      )}
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

                      {errors.specialization && (
                        <p className="text-red-500 text-sm">
                          {errors.specialization}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

{errors.aadhaar && (
                        <p className="text-red-500 text-sm">{errors.aadhaar}</p>
                      )}
                       
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
                      {errors.pan && (
                        <p className="text-red-500 text-sm">{errors.pan}</p>
                      )}
                       
                    </div>
                  </div>
                  {/* Gender */}
                  <div className="grid grid-cols-2 gap-4">
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
                        {genders.length > 0 ? (
                          genders.map((item) => (
                            <option key={item.appLOVID} value={item.appLOVID}>
                              {item.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No Genders Available</option>
                        )}
                      </select>

                      {errors.gender && (
                        <p className="text-red-500 text-sm">{errors.gender}</p>
                      )}
                    </div>
                  </div>
                </form>

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
              </div>
            </div>
            </div>
          
  );
};

export default DoctorRegistration;
