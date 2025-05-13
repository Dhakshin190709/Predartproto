import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MySVG from '../../components/MySvgComponent';
import { CheckCircle } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUsernameAvailability,
} from '../Utils/validationUtils';

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
    DateOfBirth: '',
    aadhaar: '',
    gender: '',
    pan: '',
    tenant: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [tenants, setTenants] = useState([]); // State for tenant data
  const [selectedTenant, setSelectedTenant] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [aadhaarExists, setAadhaarExists] = useState<boolean | null>(null); // null: not checked, false: does not exist, true: exists
const [panExists, setPanExists] = useState<boolean | null>(null);

  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [genders, setGenders] = useState([]);
  const [hospitalTypes, setHospitalTypes] = useState([]);

  const validateFields = async () => {
    console.log('Form Data Before Validation:', formData);

    const newErrors = {
      name: '',
      email: '',
      phone: '',
      qualification: '',
      specialization: '',
      tenant: '',
      hospitalType: '',
      gender: '',
      aadhaar: '',
      pan: '',
      DateOfBirth: '',
    };

    const nameRegex = /^[A-Za-z0-9_. ]{2,50}$/;
const emailRegex = /^[a-zA-Z][a-zA-Z0-9_.]*@[a-zA-Z]+\.(com|in|org|net|edu|gov)$/;


   const phoneRegex = /^[6-9]\d{9}$/;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const trimmedPan = formData.pan?.trim() || '';

    const aadhaarRegex = /^\d{12}$/;

    // Basic checks
    if (!formData.name || !nameRegex.test(formData.name))
      newErrors.name = 'Name is required.';
    if (!formData.email) {
  newErrors.email = 'Email is required.';
} else if (!emailRegex.test(formData.email)) {
  newErrors.email = 'Invalid email format. Please enter a valid email like example@example.com';
}

   if (!formData.phone) {
  newErrors.phone = 'Phone number is required.';
} else if (!phoneRegex.test(formData.phone)) {
  newErrors.phone = 'Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits.';
}

    if (!formData.qualification)
      newErrors.qualification = 'Qualification is required.';
    if (!formData.specialization)
      newErrors.specialization = 'Specialization is required.';
    if (!formData.tenant) newErrors.tenant = 'Tenant is required.';
    if (!formData.hospitalType)
      newErrors.hospitalType = 'Hospital is required.';
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.aadhaar) {
      newErrors.aadhaar = 'Aadhaar is required.';
    } else if (!aadhaarRegex.test(formData.aadhaar)) {
      newErrors.aadhaar = 'Aadhaar must be a 12-digit number.';
    }

    if (!trimmedPan) {
      newErrors.pan = 'PAN is required.';
    } else if (!panRegex.test(trimmedPan)) {
      newErrors.pan = 'Invalid PAN format. Expected format: ABCDE1234F';
    }

    // DOB logic
    if (!formData.DateOfBirth) {
      newErrors.DateOfBirth = 'Date of Birth is required.';
    } else {
      const dob = new Date(formData.DateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.DateOfBirth = 'Date of Birth cannot be in the future.';
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 22) newErrors.DateOfBirth = 'Minimum age is 22.';
      }
    }

    // API checks for duplicates
    try {
      if (!newErrors.name) {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Login/CheckUserNameExist?UserName=${formData.name}`,
        );
        const result = await res.json();
        if (result.success === true) newErrors.name = 'Name already exists.';
      }

      if (!newErrors.email) {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Login/CheckEmailExist?Email=${formData.email}`,
        );
        const result = await res.json();
        if (result.success === true) newErrors.email = 'Email already exists.';
      }

      if (!newErrors.phone) {
        const res = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Login/CheckMobileExist?Mobile=${formData.phone}`,
        );
        const result = await res.json();
        if (result.success === true)
          newErrors.phone = 'Mobile number already exists.';
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }

    setErrors(newErrors);

    // If any field has an error, return false
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleRegister = async () => {
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      toast.error('User not logged in. Please log in again.');
      return { isValid: false, errors: { userID: 'User not logged in.' } };
    }

    console.log('Submit button clicked!');

    const isValid = await validateFields();
    if (!isValid) {
      console.log('Validation failed!');
      toast.error('Validation failed. Please correct the errors.');
      return;
    }

    console.log('Validation passed. Sending data...');

    const requestData = {
      createdBy: userID,
      tenantID: formData.tenant,
      hospitalID: formData.hospitalType,
      doctorName: formData.name,
      doctorDateOfBirth: formData.DateOfBirth,
      doctorEmail: formData.email,
      doctorPhoneNumber: formData.phone,
      doctorGender: genders.find((g) => g.appLOVID === formData.gender)?.name,
      qualificationID: formData.qualification,
      specializationID: formData.specialization,
      genderID: formData.gender,
      aadhaarNumber: formData.aadhaar,
      panNumber: formData.pan,
    };

    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('API Response:', response);

      if (response.status === 200 || response.status === 201) {
        const doctorID = response.data.data;
        sessionStorage.setItem('doctorID', doctorID);
        console.log('Stored doctorID:', doctorID);

        toast.success('Doctor registered successfully!');
        setFormData({
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
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error occurred while registering the doctor.');
    }
  };

  const handleSingleInputChange = (field: string, value: string) => {
  // Only convert PAN to uppercase
  const inputValue = field === 'pan' ? value.toUpperCase() : value;

  setFormData({ ...formData, [field]: inputValue });
  setErrors({ ...errors, [field]: '' });

  // Aadhaar check
  if (field === 'aadhaar') {
    setAadhaarExists(null);
    if (value.length === 12) {
      checkAadhaarExists(value);
    }
  }

  // PAN check
  if (field === 'pan') {
    setPanExists(null);
    if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(inputValue)) {
      checkPanExists(inputValue);
    }
  }
};


  const checkAadhaarExists = async (uid: string) => {
    try {
      const response = await fetch(
        `https://predart003-001-site1.anytempurl.com/api/Login/CheckUIDExist?UID=${uid}`,
      );
      const data = await response.json();
      setAadhaarExists(data.success); // success: false → available; true → exists
    } catch (error) {
      console.error('Error checking Aadhaar:', error);
      setAadhaarExists(null); // fallback
    }
  };

  const checkPanExists = async (pan: string) => {
  try {
    const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Login/CheckPANExist?PanNumber=${pan}`);
    const data = await response.json();
    setPanExists(data.success); // true = exists, false = available
  } catch (error) {
    console.error("Error checking PAN:", error);
    setPanExists(null);
  }
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
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital/List')
      .then((response) => response.json())
      .then((data) => {
        console.log('API Response:', data); // This will show the array of hospital objects
        if (Array.isArray(data)) {
          // Filter hospitals to only include active ones
          const activeHospitals = data.filter((hospital) => hospital.isActive);
          setHospitals(activeHospitals); // Set only active hospitals
        } else {
          console.warn('Unexpected response format:', data);
        }
      })
      .catch((error) => console.error('Error fetching hospitals:', error));
  }, []);

  // Prefill the dropdown with hospital from session
  useEffect(() => {
    const unitID = sessionStorage.getItem('unitID'); // Get the unitID (hospitalID) from session
    if (unitID) {
      setFormData((prevData) => ({
        ...prevData,
        hospitalType: unitID, // Pre-fill the hospitalType field with the unitID
      }));
    }
  }, []);

  // Fetch and set user roles to determine if user is a SuperAdmin
  useEffect(() => {
    const userID = sessionStorage.getItem('userID');
    const tenantID = sessionStorage.getItem('tenantID');

    console.log('UserID from session:', userID);
    console.log('TenantID from session:', tenantID);
    if (!userID) {
      console.error('User ID not found in session storage.');
      return;
    }

    const fetchUserRoles = async () => {
      try {
        const roleResponse = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/UserRoles/${userID}`,
        );
        if (!roleResponse.ok) {
          throw new Error('Failed to fetch user roles.');
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
              `https://predart003-001-site1.anytempurl.com/api/Role/${roleID}`,
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
          setIsSuperAdmin(resolvedRoleNames.includes('SuperAdmin'));
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
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
            (tenant) =>
              tenant.tenantID === storedTenantID ||
              tenant.id === storedTenantID,
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

  const handleUsernameBlur = async () => {
    setTouchedFields((prev) => ({ ...prev, name: true }));
    const { success, message } = await checkUsernameAvailability(formData.name);

    if (!success) {
      setErrors((prev) => ({ ...prev, name: message }));
      setUsernameAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, name: '' }));
      setUsernameAvailable(true);
    }
  };

  const handleEmailBlur = async () => {
    const { success, message } = await checkEmailAvailability(formData.email);
    if (!success) {
      setErrors((prev) => ({ ...prev, email: message }));
      setEmailAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
      setEmailAvailable(true);
    }
  };

  const handlePhoneBlur = async () => {
    const { success, message } = await checkPhoneAvailability(formData.phone);
    if (!success) {
      setErrors((prev) => ({ ...prev, phone: message }));
      setPhoneAvailable(false);
    } else {
      setErrors((prev) => ({ ...prev, phone: '' }));
      setPhoneAvailable(true);
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
                          {tenant.tenantName || tenant.name || 'Unnamed Tenant'}
                        </option>
                      ))}
                    </select>
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
                          {tenant.tenantName || tenant.name || 'Default Tenant'}
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
                  value={formData.hospitalType} // The pre-filled hospital ID value
                  disabled
                  onChange={(e) =>
                    handleSingleInputChange('hospitalType', e.target.value)
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
                  <p className="text-red-500 text-sm">{errors.hospitalType}</p>
                )}
              </div>
            </div>
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
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
                  onBlur={handleUsernameBlur}
                  placeholder="Enter your name"
                />

                {usernameAvailable && formData.name && !errors.name && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}

                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                      text-black outline-none focus:border-primary dark:border-form-strokedark 
                      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    handleSingleInputChange('email', email);
                  }}
                  onBlur={handleEmailBlur} // ✅ Use the actual handler
                  placeholder="Enter your email"
                />

                {/* ✅ Only show green icon if available and no error */}
                {emailAvailable === true && formData.email && !errors.email && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                )}

                {/* ❌ Show error only if exists (no icon in that case) */}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone & DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="tel"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                        text-black outline-none focus:border-primary dark:border-form-strokedark 
                        dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.phone}
                  onChange={(e) =>
                    handleSingleInputChange('phone', e.target.value)
                  }
                  onBlur={(e) => handlePhoneBlur(e.target.value)} // ✅ Correct usage
                  placeholder="Enter your number"
                />

                {phoneAvailable && formData.phone && !errors.phone && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}

                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.DateOfBirth}
                  onChange={(e) => {
                    // Check if the selected date is in the future
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();

                    if (selectedDate > today) {
                      setErrors({
                        ...errors,
                        DateOfBirth: 'Date of Birth cannot be in the future',
                      });
                    } else {
                      handleSingleInputChange('DateOfBirth', e.target.value); // Only update if the date is valid
                    }
                  }}
                  placeholder="Date of Birth"
                  max={new Date().toISOString().split('T')[0]} // Restrict max date to today
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

                {errors.qualification && (
                  <p className="text-red-500 text-sm">{errors.qualification}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={(e) =>
                    handleSingleInputChange('specialization', e.target.value)
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
              <div className="relative">
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
                  maxLength={12}
                />

                {/* Green tick if available */}
                {aadhaarExists === false && (
                  <div className="absolute top-4 right-4 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}

                {/* Red warning if exists */}
                {aadhaarExists === true && (
                  <p className="text-red-500 text-sm mt-1">
                    Aadhaar already exists
                  </p>
                )}

                {errors.aadhaar && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>
                )}
              </div>

              {/* PAN */}
             <div className="relative">
  <input
    type="text"
   className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
    text-black outline-none focus:border-primary dark:border-form-strokedark 
    dark:bg-form-input dark:text-white dark:focus:border-primary"
    value={formData.pan}
    onChange={(e) => handleSingleInputChange('pan', e.target.value)}
    placeholder="Enter your PAN"
    maxLength={10}
  />

  {/* ✅ Green Tick */}
  {panExists === false && (
    <div className="absolute top-4 right-4 text-green-500">
     <CheckCircle className="w-5 h-5" />
    </div>
  )}

  {/* ❌ Already exists error */}
  {panExists === true && (
    <p className="text-red-500 text-sm mt-1">PAN already exists</p>
  )}

  {errors.pan && (
    <p className="text-red-500 text-sm mt-1">{errors.pan}</p>
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
          {/* {successMessage && (
            <p className="mt-4 text-green-500 text-lg">{successMessage}</p>
          )} */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
