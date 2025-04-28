import React, { useState, useEffect } from 'react';

import 'react-form-wizard-component/dist/style.css';

import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { inputFieldClass } from '../../components/FormStyles';

interface BasicDetailsProps {
  handleRegister: (
    e: React.FormEvent<HTMLFormElement>,
  
    fetchDoctorDetails: () => void,
    setSuccessMessage: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  formData: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
}


const BasicDetails: React.FC<BasicDetailsProps> = ({ handleRegister,setFormData,formData }) => {
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
  // const [formData, setFormData] = useState({
  //   tenant: "",
  //   hospital: "",
  //   name: "",
  //   email: "",
  //   phone: "",
  //   aadhaar: "",
  //   qualification: "",
  //   specialization: "",
  //   pan: "",
  //   DateOfBirth: "",
  //   gender: "",
  //   doctorID: ""
  // });
  
  
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
    gender: ''
  });
  
 
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [validationSummary, setValidationSummary] = useState<string[]>([]);
  const [doctorId,setDoctorId]=useState([]);
  // const doctorId = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
  const userId = localStorage.getItem('userId');

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
      const userID = sessionStorage.getItem('userID'); // ✔️ Get userID
      if (!userID) {
        alert('User not logged in.');
        return;
      }
  
      try {
        const response = await fetch(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorsByUserID?userId=${userID}`
        );
        if (!response.ok) throw new Error('Failed to fetch doctor details.');
  
        const { data } = await response.json();
  
        // ✅ Store doctorID in sessionStorage
        sessionStorage.setItem('doctorID', data.doctorID);
  
        // ✅ Log to console
        console.log('Doctor ID:', data.doctorID);
        console.log('Fetched Doctor Data:', data);
        // ✅ Set form data
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
          DateOfBirth: data.doctorDateOfBirth
            ? data.doctorDateOfBirth.split('T')[0]
            : '',
          gender: data.genderID || '',
          doctorID: data.doctorID,
       });
       
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      }
    };
  
    fetchDoctorDetails(); // 👈 Call the function
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log('Updated formData:', { ...formData, [name]: value });
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };
  

  function fetchDoctorDetails(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <form className="space-y-4"  onSubmit={(e) => handleRegister(e, formData, setFormData, fetchDoctorDetails, setSuccessMessage)}
    >
      {/* User Info */}

      {/* Tenant */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenant */}
        <div>
          <select
            name="tenant"
            value={formData.tenant}
            onChange={handleInputChange}
            className={inputFieldClass}
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
            className={inputFieldClass}
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
           className={inputFieldClass}
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
            className={inputFieldClass}
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
            className={inputFieldClass}
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
            className={inputFieldClass}
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
             className={inputFieldClass}
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
             className={inputFieldClass}
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
             className={inputFieldClass}
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
         className={inputFieldClass}
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
          className={inputFieldClass}
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
      
{/* 
        <CustomButton> Submit</CustomButton> */}
      </div>
    </form>
  );
};

export default BasicDetails;
