import React, { useState, useEffect } from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { isFuture, differenceInCalendarMonths,differenceInMonths, parseISO } from 'date-fns';
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
    doctorID:'',
  });
 const [errors, setErrors] = useState<AddressError[]>([]);
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
 type AddressError = {
    addressType?: string;
    address1?: string;
    city?: string;
    zipCode?: string;
    type?: string;
  };

   const [addresses, setAddresses] = useState([
      {
        addressType: 'Work',
        type: 'Doctor',
        address1: '', // Required
        address2: '',
        city: '', // Required
        district: '',
        state: '',
  
        zipCode: '', // FIXED: Renamed from 'pincode'
        isActive: true,
       
      },
    ]);
  

    const [education, seteducation] = useState<EducationEntry[]>([
      {
        specialization: '',
        qualification: '',
        isActive: true,
        degreeName: '',
        university: '',
        location: '',
        startDate: null,
        endDate: null,
        isHighestEducation: true,
      },
    ]);

   

    const [existingAwards, setExistingAwards] = useState<Award[]>([]);
     const [awards, setAwards] = useState<Award[]>([{ awardName: '', year: '', description: '' }]);
const [savedExperience, setSavedExperience] = useState<ExperienceType[]>([]);
    const [experience, setExperience] = useState<Experience[]>([
        {
          type: '',
          hospitalName: '',
          specialization: '',
          joinDate: null,
          leaveDate: null,
        },
      ]);

       const [experienceErrors, setExperienceErrors] = useState<
          Record<number, Partial<Experience>>
        >({});
 const [forms, setForms] = useState<any[]>([
    { id: Date.now(), language: '', abilities: { read: false, write: false, speak: false }, isNew: true }
  ]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
   console.log('Form data before submit:', formData);
    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return { isValid: false, errors: { userID: 'User not logged in.' } };
    }
  
    // Ensure doctorID is retrieved from sessionStorage
    const doctorIDFromSession = sessionStorage.getItem('doctorID');
    if (doctorIDFromSession) {
      // Update formData with doctorID from sessionStorage
      setFormData(prev => ({
        ...prev,
        doctorID: doctorIDFromSession,
      }));
    }
  
    // Now, doctorID should be available in formData
    const doctorID = formData.doctorID || doctorIDFromSession;
  
    console.log('🚀 Submit button clicked!');
    console.log('🧾 Current formData:', JSON.stringify(formData, null, 2)); // Log formData before submitting
    console.log('Doctor ID:', doctorID); // Ensure doctorID is available
  
    if (!doctorID) {
      console.error('Doctor ID is missing!');
      return { isValid: false, errors: { doctorID: 'Doctor ID is required.' } };
    }
  
    // Prepare requestData for submission
    const requestData = {
      createdBy: userID,
      tenantID: formData.tenant,
      hospitalID: formData.hospital,
      doctorName: formData.name.trim(),
      doctorDateOfBirth: formData.DateOfBirth
        ? `${formData.DateOfBirth}T00:00:00`
        : null,
      doctorEmail: formData.email.trim(),
      doctorPhoneNumber: formData.phone.trim(),
      doctorGender: formData.gender,
      qualificationID: formData.qualification,
      specializationID: formData.specialization,
      genderID: formData.gender,
      aadhaarNumber: formData.aadhaar.trim(),
      panNumber: formData.pan.trim(),
      userID: userID,
      doctorID: doctorID, // Ensure doctorID is passed here
    };
  
    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctor',
        requestData,
        { headers: { 'Content-Type': 'application/json' } },
      );
  
      console.log('🚀 API Response:', response);
  
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('✅ Doctor registered successfully!');
        const returnedDoctorID = response.data?.doctorID;
        if (returnedDoctorID) {
          console.log(`🎉 Received Doctor ID: ${returnedDoctorID}`);
          sessionStorage.setItem('doctorID', returnedDoctorID);
          setFormData(prev => ({
            ...prev,
            doctorID: returnedDoctorID,
          }));
          fetchDoctorDetails(returnedDoctorID);
        } else {
          console.warn('⚠️ No doctorID received in API response!');
        }
  
        // Reset form after successful submission
        setFormData({
          name: '',
          age: '',
          gender: '',
          phone: '',
          email: '',
          aadhaar: '',
          pan: '',
          qualification: '',
          specialization: '',
          tenant: '',
          hospital: '',
          DateOfBirth: '',
          date: null,
          doctorID: '',
        });
  
        return { isValid: true, errors: {} };
      } else {
        console.error('❌ Unexpected response status:', response.status);
        return {
          isValid: false,
          errors: { response: 'Unexpected response from the server.' },
        };
      }
    } catch (error) {
      console.error('🚨 Error submitting form:', error);
      return {
        isValid: false,
        errors: { submit: 'Error occurred while registering the doctor.' },
      };
    }
  };
  
  
  
  const hasChanged = (a: EducationEntry, b: EducationEntry) => {
    return (
      a.degreeName.trim().toLowerCase() !== b.degreeName.trim().toLowerCase() ||
      a.university.trim().toLowerCase() !== b.university.trim().toLowerCase() ||
      a.startDate?.toString() !== b.startDate?.toString() ||
      a.endDate?.toString() !== b.endDate?.toString() ||
      a.location.trim().toLowerCase() !== b.location.trim().toLowerCase() ||
      a.specialization !== b.specialization ||
      a.qualification !== b.qualification ||
      a.isHighestEducation !== b.isHighestEducation
    );
  };
  
  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit Button Clicked!");
  
    const userID = sessionStorage.getItem("userID");
    const doctorID = sessionStorage.getItem("doctorID");
  
    if (!userID || !doctorID) {
      console.error("User ID or Doctor ID is missing");
      return { isValid: false, errors: { userID: "User or Doctor not logged in" } };
    }
  
    if (!education || education.length === 0) {
      return { isValid: false, errors: { education: "No education data provided" } };
    }
  
    const allErrors = education.map(validateEducationForm);
    const hasErrors = allErrors.some((error) => Object.keys(error).length > 0);
    if (hasErrors) {
      const combinedErrors = Object.assign({}, ...allErrors);
      setFormErrors(combinedErrors);
      return { isValid: false, errors: combinedErrors };
    }
  
    const educationData = education
      .filter((edu) => {
        if (!edu.submitted) return true;
  
        const original: EducationEntry = {
          educationID: edu.educationID || '', 
          degreeName: edu.degreeName,
          university: edu.university,
          startDate: edu.startDate,
          endDate: edu.endDate,
          location: edu.location,
          specialization: edu.specialization,
          qualification: edu.qualification,
          isHighestEducation: edu.isHighestEducation,
          submitted: true
        };
  
        return hasChanged(edu, original);
      })
      .map((edu) => {
        const parsedStartDate =
          typeof edu.startDate === "string" ? parseISO(edu.startDate) : edu.startDate;
        const parsedEndDate =
          typeof edu.endDate === "string" ? parseISO(edu.endDate) : edu.endDate;
  
        return {
          createdBy: userID,
          tenantID: "4e6e4cd1-5f6f-43f9-d5b1-08dd31472972",
          doctorID: doctorID,
          specializationID: edu.specialization,
          graduateID: edu.qualification,
          degreeName: edu.degreeName.trim(),
          location: edu.location.trim(),
          universityName: edu.university.trim(),
          startDate: parsedStartDate instanceof Date ? parsedStartDate.toISOString().split("T")[0] : "",
          endDate: parsedEndDate instanceof Date ? parsedEndDate.toISOString().split("T")[0] : "",
          isHighestEducation: edu.isHighestEducation
        };
      });
  
    console.log("Payload to Submit:", educationData);
  
    if (educationData.length === 0) {
      console.log("No modified or new entries to submit.");
      return { isValid: true, errors: {} };
    }
  
    try {
      const response = await axios.post(
        "https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation",
        educationData,
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 || response.status === 201) {
        seteducation((prev) =>
          prev.map((edu) => ({ ...edu, submitted: true }))
        );
        setSuccessMessage("Doctor education details saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
  
        return { isValid: true, errors: {} };
      } else {
        return { isValid: false, errors: { api: "Unexpected API response" } };
      }
    } catch (error) {
      console.error("API Error:", error);
      setSuccessMessage("Error saving education details.");
      return { isValid: false, errors: { api: "Error saving education details." } };
    }
  };
  
  

  
  const validateEducationForm = () => {
    const errors: Record<string, string> = {};
  
    education.forEach((entry, index) => {
      if (!entry.degreeName) errors[`degreeName-${index}`] = 'Degree Name is required.';
      if (!entry.location) errors[`location-${index}`] = 'Location is required.';
      if (!entry.university) errors[`university-${index}`] = 'University is required.';
      if (!entry.qualification) errors[`qualification-${index}`] = 'Qualification is required.';
      if (!entry.specialization) errors[`specialization-${index}`] = 'Specialization is required.';
      if (!entry.startDate) errors[`startDate-${index}`] = 'Start Date is required.';
      if (!entry.endDate) errors[`endDate-${index}`] = 'End Date is required.';
  
      if (entry.startDate && isFuture(entry.startDate)) {
        errors[`startDate-${index}`] = 'Start date cannot be in the future.';
      }
  
      if (entry.endDate && isFuture(entry.endDate)) {
        errors[`endDate-${index}`] = 'End date cannot be in the future.';
      }
  
      if (entry.startDate && entry.endDate) {
        const diff = differenceInMonths(entry.endDate, entry.startDate);
        if (diff < 6) {
          errors[`endDate-${index}`] = 'Minimum duration should be 6 months.';
        }
      }
    });
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');
  
    if (!doctorID) {
      alert('⚠️ Doctor ID not found in session. Cannot submit.');
      return {
        isValid: false,
        errors: { doctorID: 'Doctor ID not found in session.' },
      };
    }
  
    if (!userID) {
      alert('⚠️ User not logged in. Please log in again.');
      return {
        isValid: false,
        errors: { userID: 'User not logged in.' },
      };
    }
  
    // Validate forms data
    const errors: any = {};
    let hasErrors = false;
  
    forms.forEach((form, index) => {
      if (!form.language) {
        errors[`language_${index}`] = 'Language is required.';
        hasErrors = true;
      }
  
      if (!form.abilities.read && !form.abilities.write && !form.abilities.speak) {
        errors[`abilities_${index}`] = 'At least one ability (read/write/speak) is required.';
        hasErrors = true;
      }
    });
  
    if (hasErrors) {
      console.warn('Validation failed:', errors);
      return {
        isValid: false,
        errors,
      };
    }
  
    const payload = forms.map((form) => ({
      createdBy: userID,
      id: doctorID,
      type: 'doctor',
      languageMasterID: form.language,
      ...form.abilities,
    }));
  
    console.log('🚀 Submitting Payload:', payload);
  
    try {
      const { status } = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveLanguage',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if ([200, 201].includes(status)) {
        alert('✅ Languages saved successfully!');
        return {
          isValid: true,
          errors: {},
        };
      } else {
        return {
          isValid: false,
          errors: { api: 'Unexpected API response status.' },
        };
      }
    } catch (err) {
      console.error('❌ Error saving languages:', err);
      alert('❌ Failed to save languages.');
      return {
        isValid: false,
        errors: { api: 'Failed to save languages.' },
      };
    }
  };
  
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');
  
    if (!userID || !doctorID) {
      alert('⚠️ User or Doctor ID not found. Please log in again.');
      return {
        isValid: false,
        errors: { session: 'User or Doctor ID not found.' },
      };
    }
  
    // Validate form fields
    const newErrors = experience.map((exp) => {
      const fieldErrors: ExperienceErrors = {};
      if (!exp.hospitalName?.trim()) fieldErrors.hospitalName = 'Hospital name is required.';
      if (!exp.joinDate) fieldErrors.joinDate = 'Join date is required.';
      if (!exp.leaveDate) fieldErrors.leaveDate = 'Leave date is required.';
  
      // Optional: Validate future dates and date range
      const today = new Date();
      const join = new Date(exp.joinDate);
      const leave = new Date(exp.leaveDate);
  
      if (join > today) fieldErrors.joinDate = 'Join date cannot be in the future.';
      if (leave > today) fieldErrors.leaveDate = 'Leave date cannot be in the future.';
      const monthDiff = (leave.getFullYear() - join.getFullYear()) * 12 + (leave.getMonth() - join.getMonth());
      if (monthDiff < 6) fieldErrors.leaveDate = 'Experience must be at least 6 months.';
  
      return fieldErrors;
    });
  
    setExperienceErrors(newErrors);
    const hasErrors = newErrors.some((errors) => Object.values(errors).some((msg) => msg));
    if (hasErrors) {
      return {
        isValid: false,
        errors: newErrors,
      };
    }
  
    // Avoid re-submitting existing experience
    const savedExperienceSet = new Set(
      savedExperience.map(
        (exp) =>
          `${exp.hospitalName.trim()}_${new Date(exp.joinDate).toISOString()}_${new Date(exp.leaveDate).toISOString()}`
      )
    );
  
    const newExperienceDataArray = experience
      .filter((exp) => {
        const expKey = `${exp.hospitalName.trim()}_${new Date(exp.joinDate).toISOString()}_${new Date(exp.leaveDate).toISOString()}`;
        return !savedExperienceSet.has(expKey);
      })
      .map((exp) => ({
        createdBy: userID,
        doctorID: doctorID,
        isActive: true,
        employmentType: exp.type,
        specializationID: exp.specialization,
        hospitalName: exp.hospitalName.trim(),
        joinDate: new Date(exp.joinDate).toISOString(),
        leaveDate: new Date(exp.leaveDate).toISOString(),
      }));
  
    if (newExperienceDataArray.length === 0) {
      alert('✅ No new experience to save.');
      return {
        isValid: true,
        errors: {},
      };
    }
  
    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorExprience',
        newExperienceDataArray,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
  
      if ([200, 201].includes(response.status)) {
        alert('✅ Experience saved successfully!');
        setExperienceErrors([]);
        setSavedExperience([...savedExperience, ...newExperienceDataArray]);
        return {
          isValid: true,
          errors: {},
        };
      } else {
        console.error('Unexpected response:', response.status);
        alert('❌ Failed to save experience. Please try again.');
        return {
          isValid: false,
          errors: { api: 'Unexpected API response.' },
        };
      }
    } catch (error: any) {
      console.error('🚨 API error:', error.response?.data || error.message);
      alert('API error: Unable to save experience.');
      return {
        isValid: false,
        errors: { api: error.response?.data || error.message },
      };
    }
  };
  


  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');
  
    if (!userID || !doctorID) {
      alert('⚠️ User or Doctor not logged in. Please log in again.');
      return {
        isValid: false,
        errors: { session: 'User or Doctor ID not found.' },
      };
    }
  
    // Validate skill fields
    const newErrors = skills.map((skill) => {
      const error: any = {};
      if (!skill.skill) error.skill = 'Skill is required.';
      if (!skill.yearsOfExperience && skill.yearsOfExperience !== 0) {
        error.yearsOfExperience = 'Years of experience is required.';
      }
      if (!skill.monthsOfExperience && skill.monthsOfExperience !== 0) {
        error.monthsOfExperience = 'Months of experience is required.';
      }
      return error;
    });
  
    const hasErrors = newErrors.some((err) => Object.keys(err).length > 0);
    if (hasErrors) {
      setSkillErrors(newErrors);
      return {
        isValid: false,
        errors: newErrors,
      };
    }
  
    // Filter out already existing skills
    const newSkills = skills.filter(
      (skill) => !existingSkills.includes(skill.skill)
    );
  
    if (newSkills.length === 0) {
      alert('✅ No new skills to submit.');
      return {
        isValid: true,
        errors: {},
      };
    }
  
    const apiSkillsData = newSkills.map((skill) => ({
      createdBy: userID,
      doctorID: doctorID,
      skillMasterID: skill.skill,
      yearOfExperience: skill.yearsOfExperience,
      monthOfExperience: skill.monthsOfExperience,
      description: skill.description.trim(),
    }));
  
    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorSkill',
        apiSkillsData,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if ([200, 201].includes(response.status)) {
        alert('✅ New skills added successfully!');
        setSkillErrors([]);
        setExistingSkills((prev) => [
          ...prev,
          ...newSkills.map((s) => s.skill),
        ]);
        return {
          isValid: true,
          errors: {},
        };
      } else {
        console.error('❌ Unexpected response status:', response.status);
        return {
          isValid: false,
          errors: { api: 'Unexpected response from server.' },
        };
      }
    } catch (error: any) {
      console.error(
        '🚨 Error submitting skill details:',
        error?.response?.data || error.message
      );
      return {
        isValid: false,
        errors: { api: error?.response?.data || error.message },
      };
    }
  };
  
      
      const isDuplicate = (newAward: Award) =>
        existingAwards.some(
          (existing) =>
            existing.awardName.trim().toLowerCase() === newAward.awardName.trim().toLowerCase() &&
            existing.year.trim() === newAward.year.trim() &&
            existing.description.trim().toLowerCase() === newAward.description.trim().toLowerCase()
        );
        const handleAwardSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
        
          const userID = sessionStorage.getItem('userID');
          const doctorID = sessionStorage.getItem('doctorID');
        
          let isValid = true;
          const errors: FormErrors = {};
        
          const newAwards = awards.filter((award) => !isDuplicate(award));
        
          if (!userID || !doctorID) {
            alert('🚨 User not logged in. Please log in again.');
            return { isValid: false, errors };
          }
        
          if (newAwards.length === 0) {
            alert('🚫 No new awards to submit. Already submitted awards will not be saved again.');
            return { isValid: false, errors };
          }
        
          const apiAwardsData = newAwards.map((award, index) => {
            const fieldPrefix = `award_${index}`;
            const year = award.year ? String(award.year).trim() : '';
        
            if (!award.awardName.trim()) {
              errors[`${fieldPrefix}_awardName`] = 'Award name is required.';
              isValid = false;
            }
        
            if (!year || !/^\d{4}$/.test(year)) {
              errors[`${fieldPrefix}_year`] = 'Enter a valid 4-digit year.';
              isValid = false;
            }
        
            if (!award.description.trim() || award.description.trim().length < 10) {
              errors[`${fieldPrefix}_description`] = 'Description must be at least 10 characters long.';
              isValid = false;
            }
        
            return {
              createdBy: userID,
              doctorID: doctorID,
              awardName: award.awardName.trim(),
              awardYear: year,
              description: award.description.trim(),
            };
          });
        
          setFormErrors(errors);
        
          if (!isValid) {
            return { isValid: false, errors };
          }
        
          try {
            const response = await axios.post(
              'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorAward',
              apiAwardsData,
              { headers: { 'Content-Type': 'application/json' } }
            );
        
            if (response.status === 200 || response.status === 201) {
              alert('✅ New awards saved successfully!');
              setExistingAwards([...existingAwards, ...newAwards]);
            } else {
              console.error('❌ Unexpected response status:', response.status);
            }
        
            return { isValid: true, errors: {} };
          } catch (error: any) {
            console.error('🚨 Error saving awards:', error?.response?.data || error.message);
            return { isValid: false, errors };
          }
        };
        


  const handleStepSubmit = async (
    e: React.FormEvent,
    handleNext: () => void,
    skipValidation = false, // 🚀 Default value for skipping validation
  ) => {
    e.preventDefault();

    let validationResult: { isValid: boolean; errors: Record<string, string> } =
      {
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
          const formResult = await handleSubmit(e);

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
        console.warn('⚠️ Missing or invalid fields:', validationResult.errors);
        setFormErrors(validationResult.errors);

        if (skipValidation) {
          handleNext(); // 🚀 Move on even if errors exist
          setCurrentStep((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('🚨 Error saving data:', error);
    }
  };

  // ✅ Next button template
  const nextButtonTemplate = (handleNext: () => void) => (
  <div>
      {/* 🚀 Next button with validation */}
      <button type="button" className="base-button"
       onClick={(e) => handleStepSubmit(e, handleNext)}
       >
        Next
      </button>

      {/* 🛡️ Skip & Next button without validation */}
      <button
        type="button"
        className="base-button skip-button"
        onClick={(e) => handleStepSubmit(e, handleNext, true)}
        style={{ marginLeft: '10px' }}
      >
        Skip & Next
      </button>
      </div>
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
  </div>;

  const backTemplate = (handlePrevious: () => void) => {
    return (
      <button className="base-button" onClick={handlePrevious}>
        back
      </button>
    );
  };
  

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


    const handleAddressSubmit = async (): Promise<{
      isValid: boolean;
      errors: AddressError[];
    }> => {
      event.preventDefault(); // Prevent page refresh
    
      const userID = sessionStorage.getItem('userID');
      const doctorID = sessionStorage.getItem('doctorID'); // assuming this is stored
    
      if (!userID || !doctorID) {
        alert('User not logged in. Please log in again.');
        return { isValid: false, errors: [] };
      }
    
      if (!addresses || addresses.length === 0) {
        alert('No addresses to submit.');
        return { isValid: false, errors: [] };
      }
    
      const address = addresses[0]; // Assuming we're submitting the first address
    
      const newError: AddressError = {
        addressType: !address.addressType ? 'Address type is required.' : '',
        address1: !address.address1 ? 'Address Line 1 is required.' : '',
        city: !address.city ? 'City is required.' : '',
        zipCode: !address.zipCode
          ? 'ZIP Code is required.'
          : !/^\d{6}$/.test(address.zipCode)
            ? 'ZIP Code must be exactly 6 digits.'
            : '',
      };
    
      setErrors([newError]);
    
      const isValid = Object.values(newError).every((msg) => !msg);
      if (!isValid) {
        console.warn('⚠️ Validation errors:', newError);
        return { isValid: false, errors: [newError] };
      }
    
      const payload = {
        createdBy: userID,
        updatedBy: userID,
        isActive: true,
        id: doctorID,
        type: "Doctor",
        addressType: address.addressType,
        address1: address.address1,
        address2: address.address2 || '',
        city: address.city,
        district: address.district || '',
        state: address.state || '',
        zipCode: address.zipCode,
      };
    
      try {
        const response = await axios.post(
          'https://predart003-001-site1.anytempurl.com/api/Address',
          payload
        );
    
        console.log('✅ Address saved:', response.data);
        alert('Address saved successfully!');
        return { isValid: true, errors: [] };
      } catch (error) {
        console.error('🚨 API Error:', error);
        alert('Failed to save address.');
        return { isValid: false, errors: [] };
      }
    };
    



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
              <BasicDetails handleRegister={handleRegister} setFormData={setFormData} formData={formData}/>
              <Address
        addresses={addresses}
        setAddresses={setAddresses}
        handleAddressSubmit={handleAddressSubmit}
      />
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
              <Education handleEducationSubmit={handleEducationSubmit} seteducation={seteducation} education={education}/>
              <Language forms={forms} setForms={setForms} handleSubmit={handleSubmit} />
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
              <Experience handleExperienceSubmit={handleExperienceSubmit}/>
              <Skills handleSkillSubmit={handleSkillSubmit}/>
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
              <Awards handleAwardSubmit={handleAwardSubmit} />
              {/* Pass the function as a prop */}
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

  //  .base-button {
  //         background-color: ${isFormValid ? '#4CAF50' : '#ccc'};
  //         color: white;
  //         padding: 10px 20px;
  //         border-radius: 5px;
  //         cursor: ${isFormValid ? 'pointer' : 'not-allowed'};
  //         border: none;
  //       }

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
          .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
          .base-button:active {
          transform: translateY(2px);
          }

           .base-button {
  background: linear-gradient(to bottom, #004A99, #007BFF);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  transition: background 0.15s ease-out;
  cursor: pointer;
}

.base-button:hover {
  background: linear-gradient(to bottom, #007BFF, #004A99);
  transition: background 0.15s ease-in;
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
function fetchDoctorDetails(doctorID: any) {
  throw new Error('Function not implemented.');
}

function setSuccessMessage(arg0: string) {
  throw new Error('Function not implemented.');
}

function validateEducationFields(value: { addressType: string; type: string; address1: string; address2: string; city: string; district: string; state: string; zipCode: string; isActive: boolean; degreeName: string; university: string; location: string; startDate: null; endDate: null; isHighestEducation: boolean; }, index: number, array: { addressType: string; type: string; address1: string; address2: string; city: string; district: string; state: string; zipCode: string; isActive: boolean; degreeName: string; university: string; location: string; startDate: null; endDate: null; isHighestEducation: boolean; }[]): unknown {
  throw new Error('Function not implemented.');
}

