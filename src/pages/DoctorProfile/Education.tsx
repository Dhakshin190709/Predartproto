import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { inputFieldClass } from '../../components/FormStyles';

interface EducationProps {
  education: EducationEntry[];
  seteducation: React.Dispatch<React.SetStateAction<EducationEntry[]>>;
  handleEducationSubmit: (event: React.FormEvent) => void;
}
interface EducationEntry {
  educationID?: string; // <-- Add this line
  qualification: string;
  specialization: string;
  isActive: boolean;
  degreeName: string;
  university: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  isHighestEducation: boolean;
  submitted?: boolean; // ✅ Add this line
}


const Education: React.FC<EducationProps> = ({
  education,
  seteducation,
  handleEducationSubmit,
}) => {
  const [doctorID, setDoctorID] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  

  const addEducation = () => {
    const newEducationEntry = {
      educationID: '',
      qualification: '',
      specialization: '',
      isActive: true,
      degreeName: '',
      university: '',
      location: '',
      startDate: null,
      endDate: null,
      isHighestEducation: true,
    };
  
    const isDuplicate = education.some(
      (entry) =>
        entry.degreeName === newEducationEntry.degreeName &&
        entry.university === newEducationEntry.university &&
        entry.startDate?.getTime() === newEducationEntry.startDate?.getTime()
    );
  
    if (!isDuplicate) {
      seteducation((prevEducation) => [...prevEducation, newEducationEntry]);
    } else {
      alert('Duplicate education entry found. Please modify the details.');
    }
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
      const doctorID = sessionStorage.getItem('doctorID'); // ✅ Pull from session
    
      if (!doctorID) {
        console.error('Doctor ID is not found in session.');
        return;
      }
    
      try {
        const { data: response } = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorEducation?doctorId=${doctorID}`
        );
    
        console.log('Doctor Education API Response:', response.data);
    
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const mappedData: EducationEntry[] = response.data.map((item: any) => ({
            educationID: item.educationID ?? '', // ✅ Store the educationID
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
    
          seteducation(mappedData); // ✅ Update local state
          // 👉 You can now pass this data to the main page via props or shared state
        } else {
          console.warn('No education data found or response was unsuccessful.');
          seteducation([]);
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

  const handleFormInputChange = (index: number, fieldName: keyof EducationEntry, value: any) => {
    seteducation((prev) => {
      const updatedEducation = [...prev];
      updatedEducation[index] = { ...updatedEducation[index], [fieldName]: value };
      return updatedEducation;
    });

    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleEducationSubmit}>
      <h2 className="text-lg font-semibold">Education Details</h2>
      {successMessage && <div className="text-green-600">{successMessage}</div>}

      {education.map((education, index) => (
        <div key={index} className="w-full border border-stroke rounded-lg p-4">
          <div className="flex justify-end items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={education.isHighestEducation}
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
                value={education.degreeName}
                onChange={(e) => handleFormInputChange(index, 'degreeName', e.target.value)}
                className={inputFieldClass}
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
                value={education.location}
                onChange={(e) => handleFormInputChange(index, 'location', e.target.value)}
                className={inputFieldClass}
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
                value={education.university}
                onChange={(e) => handleFormInputChange(index, 'university', e.target.value)}
                className={inputFieldClass}
              />
              {formErrors.university && (
                <span className="text-red-500 text-sm mt-1">{formErrors.university}</span>
              )}
            </div>

            {/* Qualification */}
            <div className="flex flex-col">
              <select
                value={education.qualification}
                onChange={(e) => handleFormInputChange(index, 'qualification', e.target.value)}
                className={inputFieldClass}
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
                value={education.specialization}
                onChange={(e) => handleFormInputChange(index, 'specialization', e.target.value)}
                className={inputFieldClass}
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
                selected={education.startDate}
                onChange={(date) => handleFormInputChange(index, 'startDate', date)}
                placeholderText="Start Date"
                className={inputFieldClass}
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
                selected={education.endDate}
                onChange={(date) => handleFormInputChange(index, 'endDate', date)}
                placeholderText="End Date"
                className={inputFieldClass}
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
          onClick={addEducation}
        >
          +
        </div>
        {/* Non-clickable Text */}
        <div>Add</div>
      </div>
    </form>
  );
};

export default Education;
