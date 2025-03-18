import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { isFuture, differenceInCalendarMonths,differenceInMonths, parseISO } from 'date-fns';


interface Address {
  qualification: string;
  specialization: string;
  isActive: boolean;
  degreeName: string;
  university: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  isHighestEducation: boolean;
}

const Education: React.FC = () => {
  const doctorID = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [addresses, setAddresses] = useState<Address[]>([
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

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        specialization: '',
        qualification: '',
        isActive: true,
        degreeName: '',
        university: '',
        location: '',
        startDate: null, // Added startDate field
        endDate: null, // Added endDate field
        isHighestEducation: true,
      },
    ]);
  };

  // Fetch LOV (Qualification & Specialization) and Doctor Education Data
  useEffect(() => {
    const fetchLOV = async () => {
      try {
        const response = await fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV');
        const data = await response.json();
  
        if (data?.data) {
          const qualificationsData = data.data.filter((item: any) => item.type?.toLowerCase() === 'qualification');
          const specializationsData = data.data.filter((item: any) => item.type?.toLowerCase() === 'specializations');
          setQualifications(qualificationsData);
          setSpecializations(specializationsData);
        }
      } catch (error) {
        console.error('Error fetching LOV:', error);
      }
    };
  
   const fetchDoctorEducation = async () => {
  try {
    const { data: response } = await axios.get(
      `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation?doctorId=${doctorID}`
    );
    console.log('Doctor Education API Response:', response.data);

    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      const mappedData: Address[] = response.data.map((item: any) => ({
        specialization: item.specializationID ?? '',
        qualification: item.graduateID ?? '',
        isActive: item.isActive ?? true,
        degreeName: item.degreeName ?? '',
        university: item.universityName ?? '',
        location: item.location ?? '',
        startDate: item.startDate ? new Date(item.startDate) : null,
        endDate: item.endDate ? new Date(item.endDate) : null,
        isHighestEducation: item.isHighestEducation ?? false,
      }));

      setAddresses(mappedData);
    } else {
      console.warn('No education data found or response was unsuccessful.');
      setAddresses([]);
    }
  } catch (error) {
    console.error('Error fetching doctor education:', error);
  }
};
  
    const initializeData = async () => {
      await fetchLOV(); // Fetch LOV first
      await fetchDoctorEducation(); // Then fetch doctor's education data
    };
  
    initializeData();
  }, [doctorID]);
  


  const handleFormInputChange = (index: number, fieldName: keyof Address, value: any) => {
    setAddresses((prev) => {
      const updatedAddresses = [...prev];
      updatedAddresses[index] = { ...updatedAddresses[index], [fieldName]: value };
      return updatedAddresses;
    });
  
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  

 

  


  const validateEducationFields = (education: Address) => {
    const errors: Record<string, string> = {};
  
    if (!education.degreeName.trim()) errors.degreeName = "Degree name is required.";
    if (!education.location.trim()) errors.location = "Location is required.";
    if (!education.university.trim()) errors.university = "University name is required.";
  
    const startDate =
      typeof education.startDate === "string" ? parseISO(education.startDate) : education.startDate;
    const endDate =
      typeof education.endDate === "string" ? parseISO(education.endDate) : education.endDate;
  
    console.log("Start Date:", startDate, "End Date:", endDate);
  
    if (!startDate || isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date format.";
    } else if (isFuture(startDate)) {
      errors.startDate = "Start date cannot be in the future.";
    }
  
    if (!endDate || isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date format.";
    } else if (isFuture(endDate)) {
      errors.endDate = "End date cannot be in the future.";
    } else {
      const monthDiff = differenceInCalendarMonths(endDate, startDate);
      console.log("Month Difference:", monthDiff);
  
      // if (monthDiff < 6) {
      //   errors.endDate = "Start and end dates must have at least a 6-month gap.";
      // }
    }
  
    return errors;
  };
  

  
const handleEducationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submit Button Clicked!');

  const userID = sessionStorage.getItem('userID');
  if (!userID) {
    alert('User not logged in.');
    return;
  }

  if (!doctorID) {
    console.error('Doctor ID is missing');
    return;
  }
  if (!addresses || addresses.length === 0) {
    console.error('No education data provided');
    return;
  }

  const fetchExistingEducation = async () => {
    try {
      const { data } = await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation?doctorId=${doctorID}`
      );
      return data?.data ?? [];
    } catch (error) {
      console.error('Error fetching existing education:', error);
      return [];
    }
  };

  let existingEducation = [];
  try {
    existingEducation = await fetchExistingEducation();
    console.log('Fetched Existing Education:', existingEducation);
  } catch (error) {
    console.error('Failed to fetch existing education:', error);
  }

  const isDuplicate = (newEntry: any) =>
    existingEducation.some(
      (existing: any) =>
        existing.degreeName.trim().toLowerCase() === newEntry.degreeName.trim().toLowerCase() &&
        existing.universityName.trim().toLowerCase() === newEntry.universityName.trim().toLowerCase() &&
        existing.startDate === newEntry.startDate &&
        existing.endDate === newEntry.endDate
    );

  const allErrors = addresses.map(validateEducationFields);
  console.log('Validation Errors:', allErrors);
  const hasErrors = allErrors.some((error) => Object.keys(error).length > 0);
  if (hasErrors) {
    setFormErrors(Object.assign({}, ...allErrors));
    return;
  }

  

  const educationData = addresses.map((address) => {
    const parsedStartDate =
      typeof address.startDate === "string" ? parseISO(address.startDate) : address.startDate;
    const parsedEndDate =
      typeof address.endDate === "string" ? parseISO(address.endDate) : address.endDate;
  
    return {
      createdBy: userID,
      tenantID: "4e6e4cd1-5f6f-43f9-d5b1-08dd31472972",
      doctorID,
      specializationID: address.specialization,
      graduateID: address.qualification,
      degreeName: address.degreeName.trim(),
      location: address.location.trim(),
      universityName: address.university.trim(),
      startDate: parsedStartDate instanceof Date ? parsedStartDate.toISOString().split("T")[0] : "",
      endDate: parsedEndDate instanceof Date ? parsedEndDate.toISOString().split("T")[0] : "",
      isHighestEducation: address.isHighestEducation,
    };
  });
  
  console.log("Payload sent to API:", JSON.stringify(educationData, null, 2));
 

  console.log('Education Data Before Filtering:', educationData);
  
  const uniqueEducationData = educationData.filter((entry) => !isDuplicate(entry));
  console.log('Final Data Sent to API:', uniqueEducationData);

  if (uniqueEducationData.length === 0) {
    alert('Duplicate entries detected. No new data to submit.');
    return;
  }

  try {
    const response = await axios.post(
      'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorEducation',
      uniqueEducationData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('API Response:', response);
    
    if (response.status === 200 || response.status === 201) {
      setSuccessMessage('Doctor education details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  } catch (error) {
    console.error('API Error:', error);
    setSuccessMessage('Error saving education details.');
  }
};

  

  return (
    <form className="space-y-6" onSubmit={handleEducationSubmit}>
      <h2 className="text-lg font-semibold">Education Details</h2>
      {successMessage && <div className="text-green-600">{successMessage}</div>}

      {addresses.map((address, index) => (
        <div key={index} className="w-full border border-stroke rounded-lg p-4">
          <div className="flex justify-end items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={address.isHighestEducation}
                onChange={(e) =>
                  handleFormInputChange(index, 'isHighestEducation', e.target.checked)
                }
                className="mr-2"
              />
              Highest Education
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  {/* Degree Name */}
  <div className="flex flex-col">
    <input
      type="text"
      placeholder="Degree Name"
      value={address.degreeName}
      onChange={(e) => handleFormInputChange(index, 'degreeName', e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.degreeName && (
      <span className="text-red-500 text-sm mt-1">{formErrors.degreeName}</span>
    )}
  </div>

  {/* Location */}
  <div className="flex flex-col">
    <input
      type="text"
      placeholder="Location"
      value={address.location}
      onChange={(e) => handleFormInputChange(index, 'location', e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.location && (
      <span className="text-red-500 text-sm mt-1">{formErrors.location}</span>
    )}
  </div>

  {/* University */}
  <div className="flex flex-col">
    <input
      type="text"
      placeholder="University"
      value={address.university}
      onChange={(e) => handleFormInputChange(index, 'university', e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    {formErrors.university && (
      <span className="text-red-500 text-sm mt-1">{formErrors.university}</span>
    )}
  </div>

  {/* Qualification */}
  <div className="flex flex-col">
    <select
      value={address.qualification}
      onChange={(e) => handleFormInputChange(index, 'qualification', e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Qualification</option>
      {qualifications.map((qual: any) => (
        <option key={qual.appLOVID} value={qual.appLOVID}>
          {qual.name}
        </option>
      ))}
    </select>
    {formErrors.qualification && (
      <span className="text-red-500 text-sm mt-1">{formErrors.qualification}</span>
    )}
  </div>

  {/* Specialization */}
  <div className="flex flex-col">
    <select
      value={address.specialization}
      onChange={(e) => handleFormInputChange(index, 'specialization', e.target.value)}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    >
      <option value="">Select Specialization</option>
      {specializations.map((spec: any) => (
        <option key={spec.appLOVID} value={spec.appLOVID}>
          {spec.name}
        </option>
      ))}
    </select>
    {formErrors.specialization && (
      <span className="text-red-500 text-sm mt-1">{formErrors.specialization}</span>
    )}
  </div>

  {/* Start Date */}
  <div className="flex flex-col relative">
    <DatePicker
      selected={address.startDate}
      onChange={(date) => handleFormInputChange(index, 'startDate', date)}
      placeholderText="Start Date"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <span className="absolute right-3 top-3 text-gray-400">
      <i className="fas fa-calendar-alt"></i>
    </span>
    {formErrors.startDate && (
      <span className="text-red-500 text-sm mt-1">{formErrors.startDate}</span>
    )}
  </div>

  {/* End Date */}
  <div className="flex flex-col relative">
    <DatePicker
      selected={address.endDate}
      onChange={(date) => handleFormInputChange(index, 'endDate', date)}
      placeholderText="End Date"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
        text-black outline-none focus:border-primary dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <span className="absolute right-3 top-3 text-gray-400">
      <i className="fas fa-calendar-alt"></i>
    </span>
    {formErrors.endDate && (
      <span className="text-red-500 text-sm mt-1">{formErrors.endDate}</span>
    )}
  </div>
</div>


        </div>
      ))}
 <div className="flex items-center justify-end gap-1">
        {/* Clickable Icon */}
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer 
                    bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addAddress}
        >
          +
        </div>

        {/* Non-clickable Text */}
        <span className="text-sm font-medium text-black-600">Add</span>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
      >
        Save Education
      </button>
    </form>
  );
};

export default Education;
