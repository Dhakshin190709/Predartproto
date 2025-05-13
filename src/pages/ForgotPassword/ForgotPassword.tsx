import React, { useState, useEffect } from 'react';     
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import MySVG from '../../components/MySvgComponent';
import { inputFieldClass } from '../../components/FormStyles';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState(''); 
  const [isOtpSent, setIsOtpSent] = useState(false); 
  const [isOtpVerified, setIsOtpVerified] = useState(false); 
  const [otp, setOtp] = useState(''); 
  const [otpError, setOtpError] = useState('');  
  const [timer, setTimer] = useState(30);
  const [isOtpOptionChecked, setIsOtpOptionChecked] = useState(false);
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [message, setMessage] = useState('');
  const [isCheckboxVisible, setIsCheckboxVisible] = useState(true); // Track checkbox visibility
  const [isOtpButtonVisible, setIsOtpButtonVisible] = useState(true); // Track OTP button visibility

  const [isValidInput, setIsValidInput] = useState(false);
  
  

  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|org|in|co|net|edu|gov)$/i;

  const phoneRegex = /^[0-9]{10}$/;
  
  const validateEmailOrPhone = (input: string): string | null => {
    if (!input) {
      return "Email is required.";
    }
  
    if (phoneRegex.test(input)) {
      return null; // Valid phone number ✅
    }
  
    if (emailRegex.test(input)) {
      return null; // Valid email ✅
    }
  
    return "Enter a valid email like Gmail, Outlook, Yahoo, etc.";
  };


  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmailOrPhone(value);
  
    const validationMessage = validateEmailOrPhone(value);
    setIsValidInput(!validationMessage); // true if no error
    setMessage(''); // clear error message as they type
  };
  
  
  
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  
  useEffect(() => { 
    let interval: NodeJS.Timeout | null = null; 
    if (isOtpSent && timer > 0) { 
      interval = setInterval(() => { 
        setTimer((prevTimer) => prevTimer - 1); 
      }, 1000); 
    }
    if (timer === 0) {
      clearInterval(interval!);
    }
    return () => {
      if (interval) clearInterval(interval); 
    };
  }, [isOtpSent, timer]);

 
  const handleSendLink = () => {
    const validationMessage = validateEmailOrPhone(emailOrPhone);
  
    if (validationMessage) {
      setMessage(validationMessage); // Will stay in red if there's an error
      return;
    }
  
    setMessage('Reset link sent! Check your email.'); // Green message
  
    // Auto-hide after 1 second
    setTimeout(() => {
      navigate('/ResetPassword'); 
      setMessage('');
    }, 2000);
  };
  
  
  

  const handleSendOtp = () => { 
    const validationMessage = validateEmailOrPhone(emailOrPhone);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
  
    setIsOtpSent(true); 
    setTimer(30); 
    setMessage('OTP sent! Check your email');
    setIsOtpButtonVisible(false); 
    setIsCheckboxVisible(false); 
  
    // Hide message after 1 second
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };
  

  const handleResendOtp = () => { 
    if (timer === 0) {
      setTimer(30); // Reset the timer for resend 
      setOtpError(''); // Reset OTP error message
      setOtp(''); // Clear OTP field
      setMessage('Resending OTP...');
      setIsOtpSent(true);
      // Clear the message after 1 second
    setTimeout(() => {
      setMessage('');
    }, 2000);
    }
    
  };

  const handleVerifyOtp = () => { 
    if (!otp || otp.length !== 6) { 
      setOtpError('OTP must be 6 digits.'); 
      return; 
    } 
  
    setOtpError(''); 
    setIsOtpVerified(true); 
    setMessage('OTP Verified!');
  
    // Delay navigation by 1 second
    setTimeout(() => {
      navigate('/ResetPassword');  
    }, 4000);
  };
  

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');  // Remove non-numeric characters
    setOtp(numericValue);
  };
  

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

    {/* Right Side */}
    <div className="w-full xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark">
  <div className="w-full p-2 sm:p-4 xl:p-4 xl:pl-20">
    <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
      Forgot Password
    </h2>

        

           


          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <input
              onChange={handleInputChange}
                type="text"
                placeholder="Enter your email"
                className={`w-full ${inputFieldClass}`}
              />
              <span className="absolute right-4 top-4">
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.5">
                    <path
                      d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                      fill=""/>
                  </g>
                </svg>
              </span>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="mb-4">
          {message && (
  <p style={{ 
    color: (
      message === 'Reset link sent! Check your email.' || 
      message === 'OTP sent! Check your email' || 
      message === 'Resending OTP...' ||
      message === 'OTP Verified!'
    ) ? 'green' : 'red',
    fontSize: '0.875rem'
  }}>
    {message}
  </p>
)}




          </div>
          

          {isCheckboxVisible && (
            <div className="mb-7 flex items-center">
              <input
                type="checkbox"
                id="sendOtp"
                checked={isOtpOptionChecked}
                onChange={() => setIsOtpOptionChecked(!isOtpOptionChecked)}
                className="mr-2"
              />
              <label htmlFor="sendOtp" className="text-black dark:text-white">
                OTP
              </label>
            </div>
          )}

          {isOtpButtonVisible && (
            <div className="mb-4 flex justify-between">
            <CustomButton 
              onClick={isOtpOptionChecked ? handleSendOtp : handleSendLink}
              disabled={!isValidInput}
              style={{
                backgroundColor: isValidInput ? '#007bff' : '#ccc',
                cursor: isValidInput ? 'pointer' : 'not-allowed',
              }}
            >
              {isOtpOptionChecked ? "Send OTP" : "Send Link"}
            </CustomButton>
          
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/LoginPage')} // Navigate to the desired route
              className="bg-gradient-to-b from-[#004A99]/80 to-[#007BFF]/80 
              hover:from-[#007BFF]/90 hover:to-[#004A99]/90 
              text-white transition duration-150 ease-out hover:ease-in 
              py-2 px-5 rounded-lg shadow-sm opacity-60 hover:opacity-100"
            >
              Cancel
            </button>
          </div>
          
            
          )}

          {isOtpOptionChecked && isOtpSent && !isOtpVerified && (
            <div className="mb-4">
              <div className="input-group flex items-center space-x-2">
                <div className="flex justify-center w-full">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className={inputFieldClass}
                  />
                </div>
              </div>
              {otpError && <p className="text-sm text-red-500 mr-2">{otpError}</p>}
            </div>
          )}

          {isOtpOptionChecked && isOtpSent && !isOtpVerified && (
            <div className="mb-4">
              <div className="flex w-full">
                <p
                  onClick={handleResendOtp}
                  className={`cursor-pointer text-black ${timer === 0 ? 'text-blue-500' : ''}`}
                  style={{ pointerEvents: timer === 0 ? 'auto' : 'none' }}
                >
                  {timer > 0 ? `Resend OTP (${timer}s)` : 'Resend OTP'}
                </p>
              </div>
            </div>
          )}

          {isOtpOptionChecked && isOtpSent && !isOtpVerified && (
            <div className="mb-6">
              <div className="flex justify-left w-full">
               
                
        <CustomButton onClick={handleVerifyOtp}>
        Verify OTP
    </CustomButton>
              </div>
            </div>
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

export default ForgotPassword;
