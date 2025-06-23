import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MySVG from '../../components/MySvgComponent';
import CustomButton from '../../components/CustomButton';
import { inputFieldClass } from '../../components/FormStyles';
import { CheckCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUsernameAvailability,
} from '../Utils/validationUtils';
import api from '../../api/request';
import { useLocation } from 'react-router-dom';
const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    password: '',
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState<{
    patientName: string;
    patientEmail: string;
    patientPhoneNumber: string;
    patientDateOfBirth: string;
    patientGender: string;
  }>({
    patientName: '',
    patientEmail: '',
    patientPhoneNumber: '',
    patientDateOfBirth: '',
    patientGender: '',
  });
  const [successMessdateOfBirth, setSuccessMessdateOfBirth] = useState('');
  const [patientID, setPatientID] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const location = useLocation();
  const unitID = location.state?.unitID;
  console.log('Received unitID:', unitID);
  const [validations, setValidations] = useState({
    nameAvailable: false,
    phoneAvailable: false,
    emailAvailable: false,
  });

  const handleFormInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value), // Ensure validateField is properly defined
    }));
  };

  const validateField = async () => {
    const namePattern = /^(?![0-9_])[A-Za-z0-9_]{3,50}(?<!_)$/;

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;
    const mobilePattern = /^(?!([0-9])\1{9})[6-9][0-9]{9}$/;

    let newErrors = {
      name: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
    };

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Please enter name.';
    } else if (!namePattern.test(formData.name) || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long and valid.';
    } else {
      try {
        const res = await api.get(
          `/Login/CheckUserNameExist?UserName=${formData.name}`,
        );
        const result = res.data;
        if (result.success === true) newErrors.name = 'Name already exists.';
      } catch (err) {
        console.error('Error checking name duplicate:', err);
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter email.';
    } else if (/\s/.test(formData.email)) {
      // Check for any spaces anywhere in the email
      newErrors.email = 'Email address should not contain spaces.';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    } else {
      try {
        const res = await api.get(
          `/Login/CheckEmailExist?Email=${formData.email.trim()}`,
        );
        const result = res.data;
        if (result.success === true) newErrors.email = 'Email already exists.';
      } catch (err) {
        console.error('Error checking email duplicate:', err);
      }
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Please enter phone number.';
    } else if (!mobilePattern.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    } else {
      try {
        const res = await api.get(
          `/Login/CheckMobileExist?Mobile=${formData.phone}`,
        );
        const result = res.data;
        if (result.success === true)
          newErrors.phone = 'Mobile number already exists.';
      } catch (err) {
        console.error('Error checking phone duplicate:', err);
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'please select gender.';
    }

    // Date of Birth validation
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Please enter or select Date of Birth';
    } else if (isNaN(dob.getTime())) {
      newErrors.dateOfBirth = 'Please enter a valid date of birth.';
    } else if (dob > today) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
    } else {
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      const d = today.getDate() - dob.getDate();
      if (m < 0 || (m === 0 && d < 0)) age--;

      if (age < 1 || age > 99) {
        newErrors.dateOfBirth = 'Age must be between 1 and 99.';
      }
    }

    // Final errors set
    setErrors(newErrors);

    // Return true if all errors are empty
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: '' }); // Clear the error for the field as the user types
  };

  const validateForm = () => {
    const newErrors = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key as keyof typeof formData] = validateField(
          key,
          formData[key as keyof typeof formData],
        );
        return acc;
      },
      {} as typeof formErrors,
    );

    setFormErrors(newErrors); // Fixed the function name
    return Object.values(newErrors).every((error) => !error); // True if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form fields (your validation logic here)
    const isValid = await validateField();
    if (!isValid) return;

    const now = new Date().toISOString();
    const userId = 'eb50fd87-2ef9-4d12-fb2e-08dd175f4646';

    const payload = {
      createdBy: userId,
      createdOn: now,
      updatedBy: userId,
      updatedOn: now,
      isActive: true,
      patientName: formData.name,
      patientDateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      patientGender: formData.gender,
      patientPhoneNumber: formData.phone,
      patientEmail: formData.email,
      // userId: userId,
      uhid: '0',
      hospitalID: unitID || null, // Pass unitID here if it's available, otherwise null
    };

    try {
      const response = await api.post('/Patient/SavePatient', payload); // Using the API instance for the request
      const { data } = response;

      if (response.status === 200) {
        if (data.success === true) {
          toast.success(data.message || 'User created successfully!');
          setFormData({
            name: '',
            dateOfBirth: '',
            gender: '',
            phone: '',
            email: '',
          });
          setErrors({});
          setValidations({
            nameAvailable: false,
            phoneAvailable: false,
            emailAvailable: false,
          });
        } else {
          toast.error(
            data.message || 'Something went wrong while creating user.',
          );
        }
      } else {
        toast.error('Something went wrong with the response.');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error('Failed to save patient details.');
    }
  };

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
    <>
      <div>
        <div className="container">
          <div className="max-w-screen-xl mx-auto h-full">
            <div className="flex flex-wrap items-center h-full">
              {/* Left side - show only on xl and up */}
              <div className="hidden w-full xl:block xl:w-1/2 h-full">
                <div className="flex flex-col justify-center items-center h-full text-center px-6 py-4">
                  <p className="mb-6 text-md font-sm text-black dark:text-white">
                    Access your health records and appointments securely.
                  </p>
                  <div className="flex justify-center items-center">
                    <MySVG className="w-62 h-72" />
                  </div>
                </div>
              </div>

              {/* Right Side (Form Section) */}

              <div className="w-full xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark">
                <div className="w-full p-2 sm:p-4 xl:p-4 xl:pl-20">
                  <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
                    Signup to PreCare
                  </h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* First Row: Name & Email */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Name */}

                      <div className="relative">
                        <input
                          type="text"
                          className="w-full rounded-lg border text-[15px] border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          value={formData.name}
                          maxLength={50}
                          onChange={(e) =>
                            handleSingleInputChange('name', e.target.value)
                          }
                          onBlur={handleUsernameBlur}
                          placeholder="Enter your name"
                        />

                        {formData.name && !errors.name && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                          </span>
                        )}

                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <input
                          type="email"
                          maxLength={50}
                          className="w-full rounded-lg border text-[15px] border-stroke bg-transparent py-4 pl-6 pr-10 
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
                        {emailAvailable === true &&
                          formData.email &&
                          !errors.email && (
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                          )}

                        {/* ❌ Show error only if exists (no icon in that case) */}
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Second Row: Phone (One Column) | dateOfBirth & Gender (Nested Two-Column Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Phone Field */}
                      <div className="flex flex-col h-full">
                        <div className="relative flex items-center">
                          <input
                            type="tel"
                            maxLength={10}
                            className="w-full rounded-lg border text-[15px] border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
                            value={formData.phone}
                            onChange={(e) =>
                              handleSingleInputChange('phone', e.target.value)
                            }
                            onBlur={(e) => handlePhoneBlur(e.target.value)}
                            placeholder="Enter your number"
                          />

                          {phoneAvailable &&
                            formData.phone &&
                            !errors.phone && (
                              <span className="absolute right-4 inset-y-0 flex items-center justify-center text-green-500 pointer-events-none">
                                <CheckCircle className="w-5 h-5" />
                              </span>
                            )}
                        </div>
                        {/* Error Message */}
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* DOB Field */}
                      <div className="flex flex-col h-full">
                        <div className="relative flex-1">
                          <input
                            type={formData.dateOfBirth ? 'date' : 'text'}
                            name="dateOfBirth"
                            placeholder="Date of Birth"
                            value={formData.dateOfBirth || ''}
                            max={new Date().toISOString().split('T')[0]}
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.type = 'text';
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                dateOfBirth: value,
                              }));

                              if (new Date(value) > new Date()) {
                                setErrors((prev) => ({
                                  ...prev,
                                  dateOfBirth: 'Date cannot be in the future',
                                }));
                              } else {
                                setErrors((prev) => ({
                                  ...prev,
                                  dateOfBirth: '',
                                }));
                              }
                            }}
                            className={inputFieldClass}
                          />
                        </div>

                        {/* Error Message */}
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.dateOfBirth}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <select
                          className={inputFieldClass}
                          value={formData.gender}
                          onChange={(e) =>
                            handleSingleInputChange('gender', e.target.value)
                          }
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.gender}
                          </p>
                        )}
                      </div>
                      <div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <CustomButton type="submit">
                          Create Account
                        </CustomButton>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigate('/LoginPage')}
                          className="bg-gradient-to-b from-[#004A99]/80 to-[#007BFF]/80 
                 hover:from-[#007BFF]/90 hover:to-[#004A99]/90 
                 text-white transition duration-150 ease-out hover:ease-in 
                 py-2 px-5 rounded-lg shadow-sm opacity-60 hover:opacity-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                  <ToastContainer position="top-right" autoClose={3000} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
