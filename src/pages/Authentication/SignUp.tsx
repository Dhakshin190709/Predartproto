import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MySVG from '../../components/MySvgComponent';
import CustomButton from '../../components/CustomButton';
import { inputFieldClass } from '../../components/FormStyles';


const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    password: '',
  });

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

  const handleFormInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value), // Ensure validateField is properly defined
    }));
  };

  const validateField = () => {
    const name = /^[A-Za-z0-9_. ]{2,50}$/;


    const emailFormatPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;
    const mobilePattern = /^(?!([0-9])\1{9})[6-9][0-9]{9}$/;
  
    const newErrors = {
      name:
      formData.name && name.test(formData.name)
        ? ''
        : 'Username can only contain letters, numbers, underscores, spaces, or dots (2–50 characters).',
       
          
      
      email:
        formData.email && emailFormatPattern.test(formData.email)
          ? ''
          : 'Enter a valid email address (e.g. example@domain.com).',
      phone:
        formData.phone && mobilePattern.test(formData.phone)
          ? ''
          : 'Enter a valid 10-digit mobile number starting with 6–9.',
      gender: formData.gender ? '' : 'Gender is required.',
      dateOfBirth: (() => {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
  
        if (!formData.dateOfBirth || isNaN(dob.getTime())) {
          return 'Please enter a valid date of birth.';
        }
  
        if (dob > today) {
          return 'Date of birth cannot be in the future.';
        }
  
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const d = today.getDate() - dob.getDate();
        if (m < 0 || (m === 0 && d < 0)) {
          age--;
        }
  
        return age < 1 || age > 99 ? 'Age must be between 1 and 99.' : '';
      })(),
    };
  
    setErrors(newErrors);
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
  
    if (!validateField()) return;
  
    const now = new Date().toISOString();
    const userId = "eb50fd87-2ef9-4d12-fb2e-08dd175f4646";
  
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
    
    };
  
    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Patient/SavePatient',
        payload
      );
  
      if (response.data) {
        console.log('API Response:', response.data);
        alert('Patient details saved successfully!');
  
        // Reset form
        setFormData({
          name: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          email: '',
        });
  
        setErrors({});
      } else {
        alert('Something went wrong with the response.');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Failed to save patient details.');
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
    Signup to CarePoint Pro
    </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* First Row: Name & Email */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Name */}
                  <div>
                    <input
                      type="text"
                     className={inputFieldClass}
                      value={formData.name}
                      maxLength={30}
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
                      className={inputFieldClass}
                      value={formData.email}
                      maxLength={30}
                      onChange={(e) =>
                        handleSingleInputChange('email', e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Second Row: Phone (One Column) | dateOfBirth & Gender (Nested Two-Column Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <input
                      type="tel"
                      className={inputFieldClass}
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

                  {/* dateOfBirth & Gender (Nested Grid inside the second column) */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* dateOfBirth */}
                    <div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        placeholder="Date of Birth"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            dateOfBirth: value,
                          }));

                          // Optional validation example: DOB shouldn't be in the future
                          if (new Date(value) > new Date()) {
                            setErrors((prev) => ({
                              ...prev,
                              dateOfBirth: 'Date cannot be in the future',
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                          }
                        }}
                        className={inputFieldClass}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Gender */}
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
                      <p className="text-red-500 text-sm">{errors.gender}</p>
                    )}
                  </div>
                 
                </div>
                <div className="mt-8">
                  <CustomButton type="submit">
  Create Account
</CustomButton>

              </div>
              </form>
             
              {successMessdateOfBirth && (
                <p className="mt-4 text-green-500 text-lg">{successMessdateOfBirth}</p>
              )}
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
