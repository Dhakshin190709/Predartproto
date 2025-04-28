// DoctorExperienceForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { inputFieldClass } from '../../components/FormStyles';
interface ExperienceProps {
  handleExperienceSubmit: (e: React.FormEvent) => Promise<void>; // Adjusted type
}
interface Experience {
  type: string;
  hospitalName: string;
  specialization: string;
  joinDate: Date | null;
  leaveDate: Date | null;
}

interface WorkType {
  appLOVID: string;
  name: string;
}

interface Specialization {
  appLOVID: string;
  name: string;
}

const Experience = ({ handleExperienceSubmit }: ExperienceProps) => {
  const [experience, setExperience] = useState<Experience[]>([
    {
      type: '',
      hospitalName: '',
      specialization: '',
      joinDate: null,
      leaveDate: null,
    },
  ]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [experienceErrors, setExperienceErrors] = useState<
    Record<number, Partial<Experience>>
  >({});
  const [doctorID,setDoctorID]=useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const [employmentTypes, setEmploymentTypes] = useState<WorkType[]>([]);

  useEffect(() => {
    // Fetch Employment Types
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Worktype',
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('📌 Employment Type API Response:', data);
        if (data?.data) {
          setEmploymentTypes(data.data); // ✅ Store as employmentTypes
        }
      })
      .catch((err) =>
        console.error('❌ Error fetching Employment Types:', err),
      );

    // Fetch Specializations
    fetch(
      'https://predart003-001-site1.anytempurl.com/api/AppLOV?type=Specializations',
    )
      .then((res) => res.json())
      .then((data) => {
        console.log('📌 Specialization API Response:', data);
        if (data?.data) {
          setSpecializations(data.data);
        }
      })
      .catch((err) => console.error('❌ Error fetching Specializations:', err));
  }, []);

  const [savedExperience, setSavedExperience] = useState<ExperienceType[]>([]);
  useEffect(() => {
    const doctorID = sessionStorage.getItem('doctorID');
    const userID = sessionStorage.getItem('userID');
  
    if (!doctorID) {
      console.warn('⚠️ doctorID not found in session.');
      return;
    }
  
    if (!userID) {
      console.warn('⚠️ userID not found in session.');
      return;
    }
  
    if (specializations.length > 0 && employmentTypes.length > 0) {
      axios
        .get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorExprience?doctorId=${doctorID}`
        )
        .then((res) => {
          console.log('📌 Experience API Response:', res.data);
  
          if (res.data?.data?.length > 0) {
            const experienceData = res.data.data.map((exp) => ({
              ...exp,
              specialization:
                specializations.find((s) => s.appLOVID === exp.specializationID)
                  ?.appLOVID || '',
              type:
                employmentTypes.find((w) => w.appLOVID === exp.employmentType)
                  ?.appLOVID || '',
            }));
  
            console.log('📌 Mapped Experience Data:', experienceData);
            setExperience(experienceData);
            setSavedExperience(experienceData); // Store fetched experience separately
          }
        })
        .catch((err) => console.error('❌ Error fetching experience:', err));
    }
  }, [specializations, employmentTypes]);
  

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: any,
  ) => {
    setExperience((prevExperience) => {
      const updatedExperience = [...prevExperience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };
      return updatedExperience;
    });

    setExperienceErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (!updatedErrors[index]) updatedErrors[index] = {};

      if (field === 'type' && !value) {
        updatedErrors[index][field] = 'Work type is required.';
      } else {
        delete updatedErrors[index]?.[field];
      }
      return updatedErrors;
    });
  };

  const validateField = (
    index: number,
    field: keyof Experience,
    value: any,
    joinDate: Date | null,
    leaveDate: Date | null,
  ) => {
    const errors = { ...experienceErrors };
    const fieldName =
      field === 'hospitalName'
        ? 'Hospital name'
        : field === 'joinDate'
          ? 'Join date'
          : 'Leave date';

    if (['hospitalName', 'joinDate', 'leaveDate'].includes(field) && !value) {
      errors[index] = { ...errors[index], [field]: `${fieldName} is required` };
    } else if (
      field === 'joinDate' &&
      leaveDate &&
      value &&
      new Date(value) > new Date(leaveDate)
    ) {
      errors[index] = {
        ...errors[index],
        joinDate: 'Join date must be before leave date',
      };
    } else if (
      field === 'leaveDate' &&
      joinDate &&
      value &&
      new Date(value) < new Date(joinDate)
    ) {
      errors[index] = {
        ...errors[index],
        leaveDate: 'Leave date must be after join date',
      };
    } else if (joinDate && leaveDate) {
      const diffMonths =
        (leaveDate.getFullYear() - joinDate.getFullYear()) * 12 +
        (leaveDate.getMonth() - joinDate.getMonth());
      if (diffMonths < 6) {
        errors[index] = {
          ...errors[index],
          leaveDate: 'Experience must be at least 6 months',
        };
      } else {
        if (errors[index]?.leaveDate) delete errors[index].leaveDate;
      }
    } else {
      if (errors[index]?.[field]) delete errors[index][field];
    }

    if (errors[index] && Object.keys(errors[index]).length === 0)
      delete errors[index];
    setExperienceErrors(errors);
  };

  
  
  
  

  return (
    <form className="space-y-6" onSubmit={handleExperienceSubmit}>
      {/* Doctor Experience Section */}
      <h2 className="text-lg font-bold text-black-700 text-left">
        Doctor Experience
      </h2>
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div
            key={index}
            className="w-full border border-stroke rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <select
                className="w-[200px] rounded-lg border border-stroke bg-transparent p-2 pl-4 
  text-black outline-none focus:border-primary dark:border-form-strokedark 
  dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={exp.type} // ✅ Bind to the correct field
                onChange={(e) =>
                  handleExperienceChange(index, 'type', e.target.value)
                }
              >
                <option value="">Select Employment Type</option>
                {employmentTypes.length > 0 ? (
                  employmentTypes.map((item) => (
                    <option key={item.appLOVID} value={item.appLOVID}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
            </div>

            {experienceErrors[index]?.type && (
              <span className="text-red-500 text-sm">
                {experienceErrors[index]?.type}
              </span>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <input
                type="text"
                placeholder="Hospital Name"
                value={exp.hospitalName}
                onChange={(e) =>
                  handleExperienceChange(index, 'hospitalName', e.target.value)
                }
                className={inputFieldClass}
              />
              {experienceErrors[index]?.hospitalName && (
                <span className="text-red-500 text-sm">
                  {experienceErrors[index]?.hospitalName}
                </span>
              )}

              <select
               className={inputFieldClass}
                value={exp.specialization} // ✅ Bind to experience array
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    'specialization',
                    e.target.value,
                  )
                }
              >
                <option value="">Select Specialization</option>
                {specializations.length > 0 ? (
                  specializations.map((item) => (
                    <option key={item.appLOVID} value={item.appLOVID}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
              {experienceErrors[index]?.specialization && (
                <span className="text-red-500 text-sm">
                  {experienceErrors[index]?.specialization}
                </span>
              )}
            </div>
            <div className="grid mt-2 grid-cols-2 gap-4 w-full">
              {/* Column 1: Join Date & Leave Date (Side by Side) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Join Date */}
                <div className="relative">
                  <DatePicker
                    selected={exp.joinDate}
                    onChange={(date) =>
                      handleExperienceChange(index, 'joinDate', date)
                    }
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Join Date"
                    className={inputFieldClass}
                  />
                  {experienceErrors[index]?.joinDate && (
                    <span className="text-red-500 text-sm">
                      {experienceErrors[index]?.joinDate}
                    </span>
                  )}
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>
                </div>

                {/* Leave Date */}
                <div className="relative">
                  <DatePicker
                    selected={exp.leaveDate}
                    onChange={(date) =>
                      handleExperienceChange(index, 'leaveDate', date)
                    }
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Leave Date"
                    className={inputFieldClass}
                  />
                  {experienceErrors[index]?.leaveDate && (
                    <span className="text-red-500 text-sm">
                      {experienceErrors[index]?.leaveDate}
                    </span>
                  )}
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    style={{ color: '#c2c3c4' }}
                  >
                    <i className="fas fa-calendar-alt"></i>
                  </span>
                </div>
              </div>

              {/* Column 2: Empty */}
              <div></div>
            </div>

         
          </div>
        ))}
        <div className="flex items-center justify-end gap-1 ">
          {/* Clickable Icon */}
          <div
            className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
            onClick={() =>
              setExperience([
                ...experience,
                {
                  type: '',
                  hospitalName: '',
                  specialization: '',
                  joinDate: null,
                  leaveDate: null,
                },
              ])
            }
          >
            +
          </div>

          {/* Non-clickable Text */}
          <span className="text-sm font-medium text-black-600">Add</span>
        </div>
        {/* <div className="flex items-center justify-between">
          <button
            type="button"
       
            className="bg-gradient-to-b from-blue-700 to-blue-500 hover:from-blue-500 hover:to-blue-700 text-white py-2 px-6 rounded-2xl"
          >
            Submit
          </button>
        </div> */}
      </div>
    </form>
  );
};

export default Experience;
