import React, { useState } from "react";

const MultiSteps: React.FC = () => {
  return <Multi />;
  
};

function Multi() {
  // State to track the current step
  const [step, setStep] = useState(1);
  const [isPopupVisible, setPopupVisible] = useState(false);
  // Function to go to the next step
  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  // Function to go to the previous step
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClosePopup = () => {
    setPopupVisible(false); // Close popup when user clicks on close
  };

  // Content for each step with relevant form fields
  const getContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              <h3 className="mb-4">Doctor Basic Details</h3>
            </div>
            <form className="space-y-4">
              <div>
                <input
                  id="doctorName"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Doctor's Name"
                />
              </div>
              <div>
                <input
                  id="specialization"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Specialization"
                />
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              <h3 className="mb-4">Doctor Education</h3>
            </div>
            <form className="space-y-4">
              <div>
                <input
                  id="degree"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Degree"
                />
              </div>
              <div>
                <input
                  id="university"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter University Name"
                />
              </div>
            </form>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              <h3 className="mb-4">Doctor Experience</h3>
            </div>
            <form className="space-y-4">
              <div>
                <input
                  id="yearsExperience"
                  type="number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Years of Experience"
                />
              </div>
              <div>
                <input
                  id="previousHospital"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Previous Hospital Name"
                />
              </div>
            </form>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              <h3 className="mb-4">Doctor Skills</h3>
            </div>
            <form className="space-y-4">
              <div>
                <textarea
                  id="skills"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary placeholder-gray-300"
                  placeholder="Enter Skills"
                  rows={3}
                />
              </div>
            </form>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800">
              <h3 className="mb-4">Doctor Awards</h3>
            </div>
            <form className="space-y-4">
              <div>
                <input
                  id="award"
                  type="text"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Awards"
                />
              </div>
              <div>
                <input
                  id="awardYear"
                  type="number"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
                    text-black outline-none focus:border-primary dark:border-form-strokedark 
                    dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter Year"
                />
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-[550px] bg-white p-4 rounded-lg shadow-md">
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative w-full mb-6">
          <div
            className="absolute top-1/2 left-0 h-1 w-full bg-blue-200 -translate-y-1/2 z-0"
            style={{
              borderStyle: step === 1 ? "dotted" : "solid",
            }}
          ></div>
          <div
            className={`absolute top-1/2 left-0 h-1 ${step > 1 ? "bg-blue-600" : "bg-dotted-line"} -translate-y-1/2 z-0`}
            style={{ width: `${(step - 1) * 25}%` }}
          ></div>

          {/* Circles */}
          {[1, 2, 3, 4, 5].map((circleStep) => (
            <div
              key={circleStep}
              className={`relative z-10 flex items-center justify-center w-8 h-8 border-2 rounded-full cursor-pointer ${
                step >= circleStep
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-600 bg-white text-gray-800"
              }`}
              onClick={() => setStep(circleStep)}
            >
              {circleStep}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">{getContent()}</div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            className={`px-4 py-2 rounded-lg text-white transition duration-150 ease-out hover:ease-in 
              ${
                step > 1
                  ? "bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                  : "bg-gradient-to-b from-[#004A99] to-[#007BFF] cursor-not-allowed opacity-50"
              }`}
            onClick={handlePrev}
            disabled={step === 1}
          >
            Prev
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white transition duration-150 ease-out hover:ease-in 
              ${
                step < 5
                  ? "bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                  : "bg-gradient-to-b from-[#004A99] to-[#007BFF] cursor-not-allowed opacity-50"
              }`}
            onClick={handleNext}
            disabled={step === 5}
          >
            Next
          </button>
        </div>
      </div>
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
            <h3 className="text-xl font-bold">Profile Completed Successfully</h3>
            <button
              onClick={handleClosePopup}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
}

export default MultiSteps;
