import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import LogoDark from '../../images/logo/logo-dark.svg';
import Logo from '../../images/logo/logo.svg';
import { useForm, Controller } from 'react-hook-form';
import flatpickr from 'flatpickr';
import axiosInstance from '../../js/axiosInstance';
import MySVG from '../../components/MySvgComponent';
import CustomButton from '../../components/CustomButton';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    password:'',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const validateFields = () => {
    const newErrors = {
      name: formData.name ? '' : 'Name is required.',
      email:
        formData.email && /\S+@\S+\.\S+/.test(formData.email)
          ? ''
          : 'Valid email is required.',
      phone:
        formData.phone && /^\d{10}$/.test(formData.phone)
          ? ''
          : 'Phone number must be 10 digits.',
      gender: formData.gender ? '' : 'Gender is required.',
      age:
        formData.age && parseInt(formData.age, 10) > 0
          ? ''
          : 'Age is required.',
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSingleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: '' }); // Clear the error for the field as the user types
  };

  const handleRegister = () => {
    if (validateFields()) {
      setSuccessMessage('Registered successfully..!');
    } else {
      setSuccessMessage(''); // Clear success message if there are errors
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="container">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex flex-wrap items-start">
              <div className="hidden w-full xl:block xl:w-1/2">
                <div className="py-0 px-10 text-center">
                 
                <p className="2xl:px-20">Access your health records and appointments securely.</p>

                  <span className="mt-5 inline-block">
                   <MySVG/>
                  </span>
                </div>
              </div>

              <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
              <div className="w-full p-0 sm:p-4 xl:p-6">
                
                    
                      <h2 className="mt-0 mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
           Signup to CarePoint Pro
          </h2>
                      <form className="space-y-4">
                        {/* First Row: Name & Email */}
                        <div className="grid grid-cols-1 gap-4">
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
                              <p className="text-red-500 text-sm">
                                {errors.name}
                              </p>
                            )}
                          </div>
                          </div>
                          {/* Email */}
                          <div className="grid grid-cols-2 gap-4">
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
                              <p className="text-red-500 text-sm">
                                {errors.email}
                              </p>
                            )}
                            </div>
                            <div>
                            <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
              />
                            </div>
                          </div>
                        

                        {/* Second Row: Phone (One Column) | Age & Gender (Nested Two-Column Grid) */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Phone */}
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
                              <p className="text-red-500 text-sm">
                                {errors.phone}
                              </p>
                            )}
                          </div>

                          {/* Age & Gender (Nested Grid inside the second column) */}
                          <div className="grid grid-cols-1 gap-4">
                            {/* Age */}
                            <div>
                              <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                value={formData.age || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (!value || /^[0-9]*$/.test(value)) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      age: value,
                                    }));
                                  }
                                }}
                                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              {errors.age && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.age}
                                </p>
                              )}
                            </div>

                            
                          </div>
                         
                        </div>
                      </form>
                      <div className="mt-8">
                        <CustomButton onClick={handleRegister}>
                       Create Your Account
                        </CustomButton>
                      </div>
                      {successMessage && (
                        <p className="mt-4 text-green-500 text-lg">
                          {successMessage}
                        </p>
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
