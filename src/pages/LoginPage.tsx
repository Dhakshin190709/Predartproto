import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import MySVG from '../components/MySvgComponent';
import CustomButton from '../components/CustomButton';

const BASE_URL = 'https://predart003-001-site1.anytempurl.com';

const Login: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [emailOrMobileError, setEmailOrMobileError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtp, setIsOtp] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [sendOtpMessage, setSendOtpMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error
  const [resendMessage, setResendMessage] = useState('');
  const [resendMessageType, setResendMessageType] = useState(''); // success or error
const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState('');

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isMobile, setIisMobile] = useState(false);

  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const isError = loginMessage?.toLowerCase().includes('failed');
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isResendEnabled, setIsResendEnabled] = useState(true);

  const navigate = useNavigate();

  const handleEmailOrMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value.trim();
    setEmailOrMobile(input);
    setSendOtpMessage('');
  
    const mobilePattern = /^(?!([0-9])\1{9})[6-9][0-9]{9}$/;

    
    const emailFormatPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;


  
    if (!input) {
      setEmailOrMobileError('Email or mobile cannot be empty.');
      return;
    }
  
    // Mobile valid
    if (mobilePattern.test(input)) {
      setEmailOrMobileError('');
      return;
    }
  
    // Email format valid
    if (emailFormatPattern.test(input)) {
      const domain = input.split('@')[1].toLowerCase(); // e.g., gmail.in
      const [domainName, ...domainParts] = domain.split('.'); // ['gmail', 'in']
  
      // If domain name is gmail/yahoo/outlook and TLD is not 'com' → invalid
      if (
        ['gmail', 'yahoo', 'outlook'].includes(domainName) &&
        (domainParts.length !== 1 || domainParts[0] !== 'com')
      ) {
        setEmailOrMobileError(`Only ${domainName}.com is allowed.`);
        return;
      }
  
      // All good
      setEmailOrMobileError('');
      return;
    }
  
    // Invalid format
    setEmailOrMobileError('Enter a valid 10-digit mobile or valid email address.');
  };
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow clearing the input field
    if (value === '') {
      setPassword(value);
      setPasswordError('');
      return;
    }

    // Regex to prevent emojis
    const emojiRegex = /[\p{Extended_Pictographic}]/u;
    if (emojiRegex.test(value)) {
      setPasswordError('Emojis are not allowed.');
      return;
    }

    // Validation: Ensure max length is 10
    if (value.length > 20) {
      setPasswordError('Password cannot exceed 10 characters.');
      return;
    }

    // Custom password validation (update this as needed)
    if (!/^[A-Za-z0-9!@#$%^&*]+$/.test(value)) {
      setPasswordError(
        'Only letters, numbers, and special characters (!@#$%^&*) are allowed.',
      );
      return;
    }

    setPassword(value);
    setPasswordError(''); // Clear error if valid
  };

  const handleOtpCheckboxChange = () => {
    setIsOtp(!isOtp);
    setIsOtpSent(false);
    setOtp(Array(6).fill(''));
  };

  const handleSendOtp = async () => {
    console.log('Send OTP initiated.');

    const trimmedInput = emailOrMobile.trim();

    // Clear any previous messages or errors
    setSendOtpMessage('');
    setMessageType(''); // Clear the previous message type

    if (!trimmedInput) {
      setSendOtpMessage('Please enter your email or mobile number.');
      setMessageType('error'); // Set the message type to error
      return;
    }

    // Updated regex to avoid multiple consecutive dots in the domain part
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    const mobilePattern = /^[0-9]{10}$/;

    const isEmail = emailPattern.test(trimmedInput);
    const isMobile = mobilePattern.test(trimmedInput);

    if (!isEmail && !isMobile) {
      setSendOtpMessage('Enter a valid email or 10-digit mobile number.');
      setMessageType('error'); // Set the message type to error
      return;
    }

    const method = isEmail ? 'Email' : 'Mobile';
    const payload = isEmail
      ? { method, email: trimmedInput }
      : { method, mobile: trimmedInput };

    setIisMobile(isMobile);
    console.log(`Identified as ${method}. Sending OTP...`);

    try {
      // Make the API request to send OTP
      const response = await fetch(`${BASE_URL}/api/login/SendOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // OTP sent successfully
        setSendOtpMessage(
          `OTP has been sent to your ${method.toLowerCase()}..!`,
        );
        setMessageType('success'); // Set the message type to success
        setIsOtpSent(true); // Set OTP sent flag to true
        setCooldown(30);
        setIsResendEnabled(false);
      } else {
        // Error in sending OTP
        setSendOtpMessage(
          result.message || 'Failed to send OTP. Please try again.',
        );
        setMessageType('error'); // Set the message type to error
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSendOtpMessage(
        'An error occurred while sending OTP. Please try again.',
      );
      setMessageType('error'); // Set the message type to error
    }
  };

  // Disable the button if input is invalid
  const isSendOtpDisabled =
    !emailOrMobile ||
    (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(emailOrMobile.trim()) &&
      !/^[0-9]{10}$/.test(emailOrMobile.trim()));

      const handleLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
      
        if (rememberMe) {
          alert('Your login info will be saved securely by the browser.');
        }
      
        if (!emailOrMobile) {
          setLoginMessage('Please enter your email or mobile number.');
          return;
        }
      
        if (isOtp && (!otp || otp.some((digit) => digit === ''))) {
          setLoginMessage('Please enter the complete OTP.');
          return;
        }
      
        if (!isOtp && !password) {
          setLoginMessage('Please enter your password.');
          return;
        }
      
        const isMobileNumber = /^\d{10}$/.test(emailOrMobile);
        const loginType = isMobileNumber ? 'Mobile' : 'Email';
      
        const payload = isOtp
          ? {
              method: loginType,
              [loginType.toLowerCase()]: emailOrMobile,
              otp: otp.join(''),
              loginType,
            }
          : {
              username: emailOrMobile,
              password,
              loginType,
            };
      
        const endpoint = isOtp
          ? `${BASE_URL}/api/login/ValidateOTP`
          : `${BASE_URL}/api/login`;
      
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      
          const responseBody = await response.json();
      
          const keysToStore = [
            'userPlan',
            'tenantID',
            'unitID',
            'unitType',
            'userID',
            'username',
          ];
      
          if (
            (isOtp || (response.ok && responseBody.status !== 'OTP Invalid')) &&
            responseBody.data
          ) {
            keysToStore.forEach((key) => {
              const value = responseBody.data?.[key] || '';
              sessionStorage.setItem(key, value);
              console.log(`${key}:`, value); // Log stored value
            });
            navigate('/dashboard');
          } else {
            setLoginMessage(
              responseBody.message || 'Login failed. Please try again.'
            );
          }
        } catch (error) {
          console.error('Login Error:', error);
          setLoginMessage('An error occurred while processing your request.');
        }
      };
      

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value; // Update the specific box
      setOtp(newOtp);

      // Move to the next box
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const previousInput = document.getElementById(`otp-${index - 1}`);
        previousInput?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);

      // Focus the last box after pasting
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();
    }
    e.preventDefault();
  };

  const handleResendOtp = async () => {
    const trimmedInput = emailOrMobile.trim();

    if (!trimmedInput) {
      setResendMessage('Please enter your email or mobile number.');
      setResendMessageType('error'); // Set the message type to error
      return;
    }

    // Updated regex to avoid multiple consecutive dots in the domain part
    const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    const mobilePattern = /^[0-9]{10}$/;

    const isEmail = emailPattern.test(trimmedInput);
    const isMobile = mobilePattern.test(trimmedInput);

    if (!isEmail && !isMobile) {
      setResendMessage('Enter a valid email or 10-digit mobile number.');
      setResendMessageType('error'); // Set the message type to error
      return;
    }

    setResendMessage(''); // Clear error message on valid input
    const method = isEmail ? 'Email' : 'Mobile';
    const payload = isEmail
      ? { method, email: trimmedInput }
      : { method, mobile: trimmedInput };

    setIisMobile(isMobile);
    console.log(`Identified as ${method}. Resending OTP...`);

    try {
      const response = await fetch(`${BASE_URL}/api/login/SendOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('OTP resent successfully.');
        setResendMessage(
          `OTP has been resent to your ${method.toLowerCase()}..!`,
        );
        setResendMessageType('success'); // Set the message type to success
        setCooldown(30);
        setIsResendEnabled(false);
      } else {
        setResendMessage(
          result.message || 'Failed to resend OTP. Please try again.',
        );
        setResendMessageType('error'); // Set the message type to error
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setResendMessage(
        'An error occurred while resending OTP. Please try again.',
      );
      setResendMessageType('error'); // Set the message type to error
    }

    // Focus on the first OTP input field after resending
    const firstInput = document.getElementById('otp-0');
    firstInput?.focus();

    setTimeout(() => setResendMessage(''), 3000); // Clear resend message after 3 seconds
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
    if (cooldown === 0) {
      setResendMessage(''); // Clear the success message when the timer ends
    }
  }, [cooldown]);
  return (
    <>
     <div>
        <div className="container">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex flex-wrap items-center">
              <div className="hidden w-full xl:block xl:w-1/2">
              <div className="flex flex-col justify-center items-center h-full text-center px-6 py-4">
            <p className="mb-6 text-md font-sm text-black dark:text-white">
              Access your health records and appointments securely.
            </p>
            <div className="flex justify-center items-center">
              <MySVG className="w-62 h-72" />
            </div>
          </div>
              </div>

              <div className="w-full xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark">
  <div className="w-full p-2 sm:p-4 xl:p-4 xl:pl-20">
    <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
     Login to Carepoint Pro
    </h2>
        

        

              <form method="post" autoComplete="on" onSubmit={handleLogin}>
              <div className="form-group relative mb-4">
                <label
                  htmlFor="emailOrMobile"
                  
                  className="block text-gray-700 font-medium mb-1"
                >
                  Email/Mobile
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    style={{ color: '#d1d5db' }}
                  />
                  <input
                    type="text"
                    id="emailOrMobile"
                    name="username" 
                    value={emailOrMobile}
                    onChange={handleEmailOrMobileChange} // Corrected placement
                    maxLength={40}
                    placeholder="Enter your email or mobile"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                {emailOrMobileError && (
                  <p className="text-red-500 text-sm mt-1">
                    {emailOrMobileError}
                  </p>
                )}
              </div>
              {/* password     */}
              {!isOtpSent ? (
                <div className="form-group mb-6">
                  {isOtp ? (
                    <div>
                      {/* Send OTP Button */}
                      <button
                        onClick={handleSendOtp}
                        disabled={isSendOtpDisabled}
                        className={`send-otp-btn font-bold ${
                          isSendOtpDisabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary'
                        }`}
                      >
                        Send OTP
                      </button>

                      {/* Success/Error Message */}
                      {sendOtpMessage && (
                        <p
                          className={`text-sm mt-2 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {sendOtpMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="form-group relative mt-4 mb-6">
                      <label
                        htmlFor="password"
                        className="block text-gray-700 font-medium mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEye : faEyeSlash}
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          style={{ color: '#d1d5db' }}
                        />
                        <input
                          type={passwordVisible ? 'text' : 'password'}
                          id="password"
                          value={password}
                            name="password"
                          onChange={handlePasswordChange}
                          maxLength={30}
                          placeholder="Enter your password"
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-group mb-6">
                  {/* OTP Input */}
                  <label htmlFor="otp">OTP</label>
                  <div className="flex space-x-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-12 h-12 text-center rounded-lg border border-stroke bg-transparent text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-red-500 text-sm">{otpError}</p>
                  )}

                  {/* Resend Button with Timer */}
                  <div className="flex justify-between mt-4">
                    <button
                      disabled={cooldown > 0}
                      onClick={handleResendOtp}
                      className={`text-sm ${cooldown === 0 ? 'text-primary font-bold' : 'text-gray-400'}`}
                    >
                      Resend OTP{' '}
                      {cooldown > 0 && (
                        <span className="font-bold">({cooldown}s)</span>
                      )}
                    </button>
                  </div>

                  {/* Resend Message */}
                  {resendMessage && (
                    <p
                      className={`text-sm mt-2 ${resendMessageType === 'success' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}

              <div className="form-group mt-4 mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isOtp"
                  checked={isOtp}
                  onChange={handleOtpCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="isOtp">Login with OTP</label>
              </div>

              <div className="flex items-center justify-between mb-2">
  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
    <input
      type="checkbox"
      name="remember"
      className="accent-blue-600"
    />
    Remember me
  </label>

  <Link to="/ForgotPassword" className="text-primary text-sm">
    Forgot password?
  </Link>
</div>

              {/* <div className="mt-9 flex justify-center"> */}
              <div className="mt-4 flex items-center justify-between">
              <CustomButton type="submit">Login</CustomButton>

                <p>
                  Don’t have an account?{' '}
                  <Link to="/signup" className="text-primary">
                    Sign Up
                  </Link>
                </p>
              </div>
              {loginMessage && (
                <p
                  className={`text-sm mt-2 ${loginMessage.includes('failed') ? 'text-green-500' : 'text-red-500'}`}
                >
                  {loginMessage}
                </p>
              )}
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </>
  );
};

export default Login;
