import React, { useState, useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';

import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import BasicDetails from './BasicDetails';
import Education from './Education';
import Skills from './Skills';

import DocumentUpload from './DocumentUpload';

import Awards from './Awards';

import Timeslot from './Timeslot';
import Address from './Address';
import Experience from './Experience';
import Language from './Language';

const MainDoctor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1); // Track the active step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
   const [steps, setSteps] = useState<{ label: string }[]>([]);
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
    awardName: '',
  });

const handleStepSubmit = async (
    e: React.FormEvent,
    handleNext: () => void,
    skipValidation = false // 🚀 Default value for skipping validation
  ) => {
    e.preventDefault();
  
    let validationResult: { isValid: boolean; errors: Record<string, string> } = {
      isValid: false,
      errors: {},
    };
  
    try {
      if (!skipValidation) {
        if (currentStep === 1) {
          // ✅ Step 1: Address & Registration
          const addressResult = await handleAddressSubmit();
          const registerResult = await handleRegister(e);
  
          validationResult = {
            isValid: addressResult.isValid && registerResult.isValid,
            errors: { ...addressResult.errors, ...registerResult.errors },
          };
  
        } else if (currentStep === 2) {
          // ✅ Step 2: Education & Language
          const educationResult = await handleEducationSubmit(e);
          const formResult = await handleFormSubmit(e);
  
          validationResult = {
            isValid: educationResult.isValid && formResult.isValid,
            errors: { ...educationResult.errors, ...formResult.errors },
          };
  
        } else if (currentStep === 3) {
          // ✅ Step 3: Experience & Skills
          const experienceResult = await handleExperienceSubmit(e);
          const skillResult = await handleSkillSubmit(e);
  
          validationResult = {
            isValid: experienceResult.isValid && skillResult.isValid,
            errors: { ...experienceResult.errors, ...skillResult.errors },
          };
        } else if (currentStep === 4) {
          // ✅ Step 4: Awards (Newly Added)
          const awardResult = await handleAwardSubmit(e);
  
          validationResult = {
            isValid: awardResult.isValid,
            errors: { ...awardResult.errors },
          };
        }
      } else {
        validationResult.isValid = true; // 🚀 Skip validation if requested
      }
  
      if (validationResult.isValid) {
        handleNext(); // ✅ Move to next step
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      } else {
        console.warn("⚠️ Missing or invalid fields:", validationResult.errors);
        setFormErrors(validationResult.errors);
  
        if (skipValidation) {
          handleNext(); // 🚀 Move on even if errors exist
          setCurrentStep((prev) => prev + 1);
        }
      }
  
    } catch (error) {
      console.error("🚨 Error saving data:", error);
    }
  };


   // ✅ Next button template
   const nextButtonTemplate = (handleNext: () => void) => (
    <form onSubmit={(e) => handleStepSubmit(e, handleNext)}>
      {/* 🚀 Next button with validation */}
      <button type="submit" className="base-button">
        Next
      </button>
  
      {/* 🛡️ Skip & Next button without validation */}
      <button
        type="button"
        className="base-button skip-button"
        onClick={(e) => handleStepSubmit(e, handleNext, true)}
        style={{ marginLeft: "10px" }}
      >
        Skip & Next
      </button>
    </form>
  );
  
  
  // ✅ Finish button template
  const finishButtonTemplate = (handleComplete: () => void) => (
    <button className="finish-button" onClick={handleComplete}>
      Finish
    </button>
  );


  <div className="step-navigation">
  {steps.map((step, index) => (
    <div
      key={index}
      className={`tab ${completedSteps.includes(index + 1) ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
      onClick={() => setCurrentStep(index + 1)} // Optional: allows clicking tabs to navigate
    >
      {step.label}
    </div>
  ))}
</div>

const backTemplate = (handlePrevious: () => void) => {
  return (
    <button className="base-button" onClick={handlePrevious}>
      back
    </button>
  );
};
   // Function for when the user clicks on the 'Add Award' button
   const handleAddAwardClick = () => {
    console.log("Add Award button clicked!");
    // You can add your logic to handle award addition here
  };

  // ✅ Finish button template

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleComplete = () => {
    console.log('Form completed!');
    setPopupVisible(true);
  };

  const isFormValid =
    Object.values(formErrors).every((error) => error === '') &&
    Object.values(formData).every((value) => value !== '');
  return (
    <div className="bg-white min-h-screen">
      <div className="container">
        <>
         <FormWizard
          shape="circle"
          color="#2196f3"
          stepSize="sm"
          onComplete={handleComplete}
          backButtonTemplate={backTemplate}
          nextButtonTemplate={nextButtonTemplate}
          finishButtonTemplate={finishButtonTemplate}
       >
            {/* Step 1: Basic Details*/}
            <FormWizard.TabContent
              title="Basic Details"
              icon={
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full 
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
                >
                  <i className="ti-user"></i>
                </div>
              }
            >
              <BasicDetails />
              <Address />
            </FormWizard.TabContent>

            {/* Step 2: Doctor Education */}

            <FormWizard.TabContent
              title="Education"
              icon={
                <div
                  className="flex justify-center items-center h-10 w-10 text-white rounded-full 
              cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]"
                >
                  <i className="fa fa-graduation-cap"></i>
                </div>
              }
            >
              <Education />
              <Language />
            </FormWizard.TabContent>

            {/* Step 3: Doctor Experience */}

            <FormWizard.TabContent
              title="Exprience"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-layers"></i>
                </div>
              }
            >
      <Experience/>
              <Skills />
            </FormWizard.TabContent>

            {/* Step 4: Doctor Awards */}

            <FormWizard.TabContent
              title="Awards"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-crown"></i>
                </div>
              }
            >
              <Awards onAddAwardClick={handleAddAwardClick} /> {/* Pass the function as a prop */}
            </FormWizard.TabContent>

            {/* Step 5: Doctor slot */}

            <FormWizard.TabContent
              title="Time Slots"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="far fa-clock"></i>
                </div>
              }
            >
              <Timeslot />
            </FormWizard.TabContent>

            {/* Step 6: Doctor Documents */}
            <FormWizard.TabContent
              title="Documents"
              icon={
                <div className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF]">
                  <i className="ti-file"></i>
                </div>
              }
            >
              <DocumentUpload />
            </FormWizard.TabContent>
          </FormWizard>

          {/* Popup */}
          {isPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
                <h3 className="text-xl font-bold">
                  Profile Completed Successfully
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Inline styles */}
          <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");

        .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
         .validation-summary {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.validation-summary h4 {
  color: #856404;
  margin-bottom: 8px;
}
.tab {
  padding: 10px 20px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.tab.active {
  background-color: #007bff;
  color: white;
}
.tab.completed {
  background-color: #28a745; /* ✅ Green for completed steps */
  color: white;
}

.validation-summary ul {
  padding-left: 20px;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}
.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 16px;
}


        .title {
          margin-top: 40px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
        }
           /* Responsive styles */
  @media (max-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .w-[500px] {
      width: 100%;
    }

    .text-lg {
      font-size: 1rem;
    }

    .space-y-4 > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    .h-10 {
      height: 2.5rem;
    }
  }

   .base-button {
          background-color: ${isFormValid ? "#4CAF50" : "#ccc"};
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: ${isFormValid ? "pointer" : "not-allowed"};
          border: none;
        }

.wizard .nav-tabs > li.completed > a {
  background-color: green !important;
  color: white !important;
}

  @media (min-width: 768px) {
    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
    
      
        .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .base-button {
          background-color: blue;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          }
          
          .base-button:hover {
          background-color: navy;
          }
          
          .base-button:focus {
          outline: none;
          }
          
          .base-button:active {
          transform: translateY(2px);
          }

        .finish-button{
          background-color: green;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
        }
        .finish-button:hover {
          background-color: darkgreen;
          }
        
        .finish-button:focus {
          outline: none;
         }
          
        .finish-button:active {
          transform: translateY(2px);
         }
      


      `}</style>
        </>
      </div>
    </div>
  );
};

export default MainDoctor;
