import React, { useState } from 'react';
import MySVG from '../../components/MySvgComponent';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordStrengthColor, setPasswordStrengthColor] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [instructionsVisible, setInstructionsVisible] = useState(true); // Track if password instructions are visible
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false); // Track if confirm password is focused
  const [passwordFieldInteracted, setPasswordFieldInteracted] = useState(false); // Track if password field was interacted with

  // Function to evaluate password strength
  const evaluatePasswordStrength = (password: string) => {
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (lengthCriteria && numberCriteria && uppercaseCriteria && lowercaseCriteria && specialCharCriteria) {
      setPasswordStrength('Strong');
      setPasswordStrengthColor('text-green-500');
    } else if (lengthCriteria && (numberCriteria || uppercaseCriteria || lowercaseCriteria)) {
      setPasswordStrength('Medium');
      setPasswordStrengthColor('text-orange-500');
    } else {
      setPasswordStrength('Weak');
      setPasswordStrengthColor('text-red-500');
    }
  };

  // Handle changes to password field
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
    setInstructionsVisible(true); // Show instructions if password is still being typed
    setPasswordFieldInteracted(true); // Mark that the password field was interacted with
    evaluatePasswordStrength(password);
  };

  // Handle changes to confirm password field
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Check if the password is strong enough to enable the confirm password field
  const isPasswordStrongEnough = () => {
    return (
      password.length >= 8 &&
      /[0-9]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  // Check if the confirm password field should be enabled
  const isConfirmPasswordEnabled = () => {
    return password && (passwordStrength === 'Strong' || passwordStrength === 'Medium');
  };

  // Handle password reset (validation check)
  const handlePasswordReset = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password should be at least 8 characters.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password should contain at least one number.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password should contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password should contain at least one lowercase letter.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError('Password should contain at least one special character.');
      return;
    }

    setPasswordError('');
    setIsPasswordReset(true); // Set success flag to true
  };


  return (
    <>
      <div className="bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="container">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex flex-wrap items-center">
              <div className="hidden w-full xl:block xl:w-1/2">
                <div className="py-0 px-26 text-center">
                <p className="2xl:px-20">Access your health records and appointments securely.</p>

                  <span className="mt-5 inline-block">
                   <MySVG/>
                  </span>
                </div>
              </div>

              <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
              <div className="w-full p-0 sm:p-4 xl:p-6">
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Reset Password
          </h2>

          {/* Password Field */}
          <div className="mb-6">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Password
            </label>
            <div className="relative">
              <input
                onChange={handlePasswordChange}
                type="password"
                placeholder="Enter New Password"
                maxLength={20}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

           {/* Tooltip for Password Strength */}
{instructionsVisible && password && !confirmPasswordFocus && (
  <div className="absolute -mt-4 right-2 bg-white border border-gray-300 text-gray-800 text-xs rounded-lg p-2 shadow-lg w-50 z-10">
    <ul>
      {/* Check if password length is at least 8 characters */}
      <li className={`flex items-center ${password.length >= 8 ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
        At least 8 characters
      </li>
      
      {/* Check if password contains at least one number */}
      <li className={`flex items-center ${/\d/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`fas ${/\d/.test(password) ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
        At least one number
      </li>

      {/* Check if password contains at least one special character */}
      <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`fas ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
        At least one special character
      </li>

      {/* Check if password contains at least one uppercase letter */}
      <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
        At least one uppercase letter
      </li>

      {/* Check if password contains at least one lowercase letter */}
      <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`fas ${/[a-z]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
        At least one lowercase letter
      </li>
    </ul>
  </div>
)}


            {/* Password Strength Indicator */}
            {password && passwordStrength && !confirmPasswordFocus && (
              <div className={`text-sm mr-2 ${passwordStrengthColor}`}>
                <strong>{passwordStrength}</strong>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Confirm Password
            </label>
            <div className="relative">
              <input
                onChange={handleConfirmPasswordChange}
                type="password"
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                style={{
                  cursor: isConfirmPasswordEnabled() ? 'pointer' : 'not-allowed', // Disable cursor style
                  backgroundColor: isConfirmPasswordEnabled() ? 'white' : '#f3f4f6', // Change background to indicate it's disabled
                }}
                disabled={!isConfirmPasswordEnabled()} // Disable the field if password is not valid
                onFocus={() => setConfirmPasswordFocus(true)} // Track focus to hide strength message
                onBlur={() => setConfirmPasswordFocus(false)} // Track blur to show strength message
              />
            </div>
            {confirmPasswordError && (
              <span className="text-red-500 text-sm mt-2">{confirmPasswordError}</span>
            )}
          </div>

          {/* Success Message */}
          {isPasswordReset && (
            <div className="text-green-500 text-sm mb-4">
              <strong>Password Reset Successfully!</strong>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-left w-full">
              <button
                onClick={handlePasswordReset}
                className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
      hover:from-[#007BFF] hover:to-[#004A99]
      text-white transition duration-150 
      ease-out hover:ease-in py-2 px-5 rounded-lg"
                disabled={!isPasswordStrongEnough() || password !== confirmPassword}
                style={{
                  cursor: isPasswordStrongEnough() && password === confirmPassword ? 'pointer' : 'not-allowed',
                  opacity: (!isPasswordStrongEnough() || password !== confirmPassword) ? 0.5 : 1,
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
    </div>
    </div>
    </div>
    </>
  );
};

export default ResetPassword;
