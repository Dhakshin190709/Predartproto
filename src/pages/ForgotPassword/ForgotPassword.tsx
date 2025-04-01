import React, { useState, useEffect } from 'react';     
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import MySVG from '../../components/MySvgComponent';

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

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;

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

  const validateEmailOrPhone = (input: string): "email" | "phone" | "" => {
    if (emailRegex.test(input)) {
      setEmailOrPhoneError('');
      return 'email';
    } else if (phoneRegex.test(input)) {
      setEmailOrPhoneError('');
      return 'phone';
    } else {
      setEmailOrPhoneError('Please enter a valid email or phone number.');
      return '';
    }
  };

  const handleSendLink = () => { 
    const validType = validateEmailOrPhone(emailOrPhone);
    if (!validType) {
      return; // Don't send link if input is invalid
    }
    setMessage('Reset link sent! Check your email or phone.');
  };

  const handleSendOtp = () => { 
    const validType = validateEmailOrPhone(emailOrPhone);
    if (!validType) {
      return; // Prevent sending OTP if input is invalid
    }
    setIsOtpSent(true); 
    setTimer(30); // Reset timer 
    setMessage('OTP sent! Check your email or phone.');
    setIsOtpButtonVisible(false); // Hide OTP button after sending OTP
    setIsCheckboxVisible(false); // Hide the checkbox
  };

  const handleResendOtp = () => { 
    if (timer === 0) {
      setTimer(30); // Reset the timer for resend 
      setOtpError(''); // Reset OTP error message
      setOtp(''); // Clear OTP field
      setMessage('Resending OTP...');
      setIsOtpSent(true);
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
    navigate('/ResetPassword');  
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');  // Remove non-numeric characters
    setOtp(numericValue);
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
                  <MySVG />
                  </span>
                </div>
              </div>

             <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
             <div className="w-full p-0 sm:p-4 xl:p-6">
          <h2 className="mt-0 mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Forgot Password
          </h2>

          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                onChange={(e) => setEmailOrPhone(e.target.value)}
                type="text"
                placeholder="Enter your email or Phone"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
            {emailOrPhoneError && (
              <p className="text-sm text-red-500 mr-2">{emailOrPhoneError}</p>
            )}
          </div>

          <div className="mb-4">
            {message && (
              <p className="text-sm text-green-500 mt-2">{message}</p> 
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
            <div className="mb-4">
              <div className="flex justify-left w-full">
              <CustomButton onClick={isOtpOptionChecked ? handleSendOtp : handleSendLink}>
      {isOtpOptionChecked ? "Send OTP" : "Send Link"}
    </CustomButton>
              </div>
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
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
