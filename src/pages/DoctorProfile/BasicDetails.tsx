import React, { useState, useEffect } from 'react';

import 'react-form-wizard-component/dist/style.css';

import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const BasicDetails: React.FC = () => {
  const [hospitals, setHospitals] = useState([]);
  const [genders, setGenders] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [genderOptions, setGenderOptions] = useState<any[]>([]);
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
  });
 
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [validationSummary, setValidationSummary] = useState<string[]>([]);
  const [doctorId,setDoctorId]=useState([]);
  // const doctorId = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
  
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
            genderOptions: data.data.filter(
              (item) => item.type?.toLowerCase() === 'gender',
            ),
            hospitalTypes: data.data.filter(
              (item) => item.type?.toLowerCase() === 'hospital',
            ),
            qualificationTypes: data.data.filter(
              (item) => item.type?.toLowerCase() === 'qualification',
            ),
            specializationTypes: data.data.filter(
              (item) => item.type?.toLowerCase() === 'specializations',
            ),
           
            // Add LanguageMaster filter
          };

          // Log filtered results for debugging
          console.log('Filtered Data:', filteredData);

          // Set state with the filtered data

          setGenderOptions(filteredData.genderOptions);
          setHospitalTypes(filteredData.hospitalTypes);
          setQualifications(filteredData.qualificationTypes);
          setSpecializations(filteredData.specializationTypes);
         
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';

      case 'email':
        if (!value.trim()) return 'Email is required';
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value)
          ? ''
          : "Invalid email format: must contain exactly one '@' and one '.' after '@'";

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        return /^\d{10}$/.test(value)
          ? ''
          : 'Phone number must be exactly 10 digits';

      case 'aadhaar':
        if (!value.trim()) return 'Aadhaar number is required';
        return /^\d{12}$/.test(value)
          ? ''
          : 'Aadhaar must be exactly 12 digits';

      case 'pan':
        if (!value.trim()) return 'PAN number is required';
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
          ? ''
          : 'Invalid PAN format (e.g., ABCDE1234F)';

      case 'tenant':
        return value ? '' : 'Tenant is required';

      case 'hospital':
        return value ? '' : 'Hospital is required';

      case 'qualification':
        return value ? '' : 'Qualification is required';

      case 'specialization':
        return value ? '' : 'Specialization is required';

      case 'DateOfBirth':
        if (!value) return 'Date of Birth is required';

        const selectedDate = new Date(value);
        const today = new Date();

        // Check if DOB is in the future
        if (selectedDate > today)
          return 'Date of Birth cannot be in the future';

        // Calculate age
        const age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();
        const dayDiff = today.getDate() - selectedDate.getDate();

        // Adjust age if the current date hasn't reached the birth date this year
        const isBirthdayPassed =
          monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
        const actualAge = isBirthdayPassed ? age : age - 1;

        if (actualAge < 18) return 'Age must be at least 18 years';

        return ''; // Valid DOB

      case 'gender':
        return value ? '' : 'Gender is required';

      default:
        return '';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return { isValid: false, errors: { userID: 'User not logged in.' } };
    }

    console.log('🚀 Submit button clicked!');

    const requestData = {
      createdBy: userID,
      tenantID: formData.tenant,
      hospitalID: formData.hospital,
      doctorName: formData.name.trim(),
      doctorDateOfBirth: formData.DateOfBirth
        ? `${formData.DateOfBirth}T00:00:00`
        : null,
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
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor',
        requestData,
        { headers: { 'Content-Type': 'application/json' } },
      );

      console.log('🚀 API Response:', response);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('✅ Doctor registered successfully!');

        const doctorID = response.data?.doctorID;
        if (doctorID) {
          console.log(`🎉 Received Doctor ID: ${doctorID}`);
          sessionStorage.setItem('doctorID', doctorID);
          fetchDoctorDetails(doctorID);
        } else {
          console.warn('⚠️ No doctorID received in API response!');
        }

        // Reset form after successful submission
        setFormData({
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
          DateOfBirth: '',
          date: null,
        });

        return { isValid: true, errors: {} }; // ✅ Return success
      } else {
        console.error('❌ Unexpected response status:', response.status);
        return {
          isValid: false,
          errors: { response: 'Unexpected response from the server.' },
        }; // ⚠️ Return failure
      }
    } catch (error) {
      console.error('🚨 Error submitting form:', error);
      return {
        isValid: false,
        errors: { submit: 'Error occurred while registering the doctor.' },
      }; // 🛑 Return error
    }
  };

  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/Hospital')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // ✅ Should show the array of hospitals
        if (Array.isArray(data)) {
          setHospitals(data); // Set hospitals directly
        } else {
          console.warn('Unexpected data structure:', data);
          setHospitals([]); // Fallback for safety
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


  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Doctor/${doctorId}`);
        if (!response.ok) throw new Error('Failed to fetch doctor details.');
  
        const { data } = await response.json();
  
        setFormData({
          tenant: data.tenantID || '',
          hospital: data.hospitalID || '',
          name: data.doctorName || '',
          email: data.doctorEmail || '',
          phone: data.doctorPhoneNumber || '',
          aadhaar: data.aadhaarNumber || '',
          qualification: data.qualificationID || '',
          specialization: data.specializationID || '',
          pan: data.panNumber || '',
          DateOfBirth: data.doctorDateOfBirth ? data.doctorDateOfBirth.split('T')[0] : '',
          gender: data.genderID || '',
        });
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      }
    };
  
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);
  

 // 🔄 Handle input change
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  setFormErrors((prevErrors) => ({
    ...prevErrors,
    [name]: validateField(name, value),  // Call field-specific validation
  }));
};

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      {/* User Info */}

      {/* Tenant */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenant */}
        <div>
          <select
            name="tenant"
            value={formData.tenant || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-2 pr-6 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              Select Tenant
            </option>
            {tenants.map((tenant) => (
              <option key={tenant.tenantID} value={tenant.tenantID}>
                {tenant.tenantName}
              </option>
            ))}
          </select>
          {formErrors.tenant && (
            <p className="text-red-500 text-sm">{formErrors.tenant}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <select
            name="hospital"
            value={formData.hospital}
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

          {formErrors.hospital && (
            <p className="text-red-500 text-sm">{formErrors.hospital}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-stroke bg-transparent 
            py-4 pl-6 pr-10 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input
              dark:text-white dark:focus:border-primary"
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm">{formErrors.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-stroke bg-transparent
       py-4 pl-6 pr-10 text-black outline-none focus:border-primary
        dark:border-form-strokedark dark:bg-form-input dark:text-white
         dark:focus:border-primary"
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm">{formErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your number"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {formErrors.phone && (
            <p className="text-red-500 text-sm">{formErrors.phone}</p>
          )}
        </div>

        {/* Aadhaar */}
        <div>
          <input
            type="text"
            name="aadhaar"
            value={formData.aadhaar}
            onChange={handleInputChange}
            placeholder="Enter your Aadhaar"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {formErrors.aadhaar && (
            <p className="text-red-500 text-sm">{formErrors.aadhaar}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Qualification */}
        <div>
          <select
            name="qualification"
            value={formData.qualification}
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
          {formErrors.qualification && (
            <p className="text-red-500 text-sm">{formErrors.qualification}</p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <select
            name="specialization"
            value={formData.specialization}
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
          {formErrors.specialization && (
            <p className="text-red-500 text-sm">{formErrors.specialization}</p>
          )}
        </div>

        {/* PAN */}
        <div>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleInputChange}
            placeholder="Enter your PAN"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {formErrors.pan && (
            <p className="text-red-500 text-sm">{formErrors.pan}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {/* Date of Birth */}
        <div>
          <input
            type="date"
            name="DateOfBirth"
            value={formData.DateOfBirth}
            onChange={handleInputChange}
            placeholder="Enter your date of birth"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {formErrors.DateOfBirth && (
            <p className="text-red-500 text-sm">{formErrors.DateOfBirth}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <select
            name="gender"
            value={formData.gender}
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
          {formErrors.gender && (
            <p className="text-red-500 text-sm">{formErrors.gender}</p>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-2">
        
        <button
          type="submit"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
          hover:from-[#007BFF] hover:to-[#004A99]
          text-white transition duration-150 
          ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default BasicDetails;
