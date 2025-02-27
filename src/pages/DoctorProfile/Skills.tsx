import React, { useState, useEffect } from 'react';
import axios from 'axios';
type SkillForm = {
  skill: string;
  yearsOfExperience: string;
  monthsOfExperience: string;
  description: string;
};

const Skills: React.FC = () => {
  const doctorID = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';

  const [specializations, setSpecializations] = useState<
    { appLOVID: string; name: string }[]
  >([]);

  const [existingSkills, setExistingSkills] = useState<string[]>([]);

  const [skills, setSkills] = useState([
    {
      skill: '',
      yearsOfExperience: '',
      monthsOfExperience: '',
      description: '',
    },
  ]);
  const [skillErrors, setSkillErrors] = useState([
    {
      skill: '',
      yearsOfExperience: '',
      monthsOfExperience: '',
      description: '',
    },
  ]);

  // ✅ Fetch specializations
  useEffect(() => {
    fetch('https://predart003-001-site1.anytempurl.com/api/AppLOV')
      .then((res) => res.json())
      .then((data) => {
        const specializationTypes = data?.data?.filter(
          (item: { type: string }) =>
            item.type?.toLowerCase() === 'specializations',
        );
        setSpecializations(specializationTypes || []);
      })
      .catch((err) => console.error('❌ Error fetching specializations:', err));
  }, []);

  // ✅ Fetch doctor skills

  useEffect(() => {
    axios
      .get(
        `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorSkill?doctorId=${doctorID}`,
      )
      .then((res) => {
        const fetchedSkills: SkillForm[] =
          res.data?.data?.map((skill: any) => ({
            skill: skill?.skillMasterID ?? '',
            yearsOfExperience: skill?.yearOfExperience?.toString() ?? '',
            monthsOfExperience: skill?.monthOfExperience?.toString() ?? '',
            description: skill?.description ?? '',
          })) ?? [];

        const skillsToSet = fetchedSkills.length
          ? fetchedSkills
          : [
              {
                skill: '',
                yearsOfExperience: '',
                monthsOfExperience: '',
                description: '',
              },
            ];

        setSkills(skillsToSet);

        // Ensure skillErrors has the same length
        setSkillErrors(
          skillsToSet.map(() => ({
            skill: '',
            yearsOfExperience: '',
            monthsOfExperience: '',
            description: '',
          })),
        );

        setExistingSkills(
          res.data?.data?.map((skill: any) => skill?.skillMasterID ?? '') ?? [],
        );
      })
      .catch((err) => console.error('Error fetching doctor skills:', err));
  }, [doctorID]);

  const handleSkillInputChange = (
    index: number,
    field: keyof SkillForm,
    value: string,
  ) => {
    if (index >= skills.length) return; // Prevent out-of-bounds access

    if (
      field === 'skill' &&
      (existingSkills.includes(value) ||
        skills.some((s, i) => s.skill === value && i !== index))
    ) {
      alert('Skill already added.');
      return;
    }

    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkills(updatedSkills);

    // Clear the corresponding error when user types
    const updatedErrors = [...skillErrors];
    updatedErrors[index][field] = '';
    setSkillErrors(updatedErrors);
  };

  const handleAddSkill = () => {
    setSkills((prev) => [
      ...prev,
      {
        skill: '',
        yearsOfExperience: '',
        monthsOfExperience: '',
        description: '',
      },
    ]);
    setSkillErrors((prev) => [
      ...prev,
      {
        skill: '',
        yearsOfExperience: '',
        monthsOfExperience: '',
        description: '',
      },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
    setSkillErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateSkills = () => {
    const updatedErrors = skills.map((skill) => ({
      skill: skill?.skill ? '' : 'Specialization is required',
      yearsOfExperience: skill?.yearsOfExperience
        ? ''
        : 'Years of experience is required',
      monthsOfExperience: skill?.monthsOfExperience
        ? ''
        : 'Months of experience is required',
      description: skill?.description ? '' : 'Description is required',
    }));

    setSkillErrors(updatedErrors);
    return updatedErrors.every(
      (err) =>
        !err.skill &&
        !err.yearsOfExperience &&
        !err.monthsOfExperience &&
        !err.description,
    );
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSkills()) {
      console.error('🚨 Validation failed.');
      return;
    }

    const userID = sessionStorage.getItem('userID');
    if (!userID) {
      alert('User not logged in. Please log in again.');
      return;
    }

    // Filter out already existing skills
    const newSkills = skills.filter(
      (skill) => !existingSkills.includes(skill.skill),
    );

    if (newSkills.length === 0) {
      alert('No new skills to submit.');
      return;
    }

    const apiSkillsData = newSkills.map((skill) => ({
      createdBy: userID,
      doctorID,
      skillMasterID: skill.skill,
      yearOfExperience: skill.yearsOfExperience,
      monthOfExperience: skill.monthsOfExperience,
      description: skill.description.trim(),
    }));

    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorSkill',
        apiSkillsData,
        { headers: { 'Content-Type': 'application/json' } },
      );

      if ([200, 201].includes(response.status)) {
        console.log('✅ Skill Data Saved Successfully:', response.data);
        alert('✅ New skills added successfully!');

        // Update existingSkills with newly submitted skills
        setExistingSkills((prev) => [
          ...prev,
          ...newSkills.map((s) => s.skill),
        ]);
      } else {
        console.error('❌ Unexpected response status:', response.status);
      }
    } catch (error: any) {
      console.error(
        '🚨 Error submitting skill details:',
        error?.response?.data || error.message,
      );
    }
  };

  return (
    <form className="space-y-6">
      <h2 className="text-lg font-bold text-black-700 text-left">Skills</h2>

      {skills.map((skill, index) => (
        <div key={index} className="border border-stroke p-4 mt-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Specialization Dropdown */}
            <div>
              <select
                value={skill?.skill ?? ''}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) =>
                  handleSkillInputChange(index, 'skill', e.target.value)
                }
              >
                <option value="">Select Specialization</option>
                {specializations.map((item) => (
                  <option key={item.appLOVID} value={item.appLOVID}>
                    {item.name}
                  </option>
                ))}
              </select>
              {skillErrors[index]?.skill && (
                <p className="text-red-500 text-sm">
                  {skillErrors[index].skill}
                </p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <input
                type="number"
                min="0"
                max="20"
                value={skill?.yearsOfExperience ?? ''}
                onChange={(e) =>
                  handleSkillInputChange(
                    index,
                    'yearsOfExperience',
                    e.target.value,
                  )
                }
                placeholder="-- Years of Experience --"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {skillErrors[index]?.yearsOfExperience && (
                <p className="text-red-500 text-sm">
                  {skillErrors[index].yearsOfExperience}
                </p>
              )}
            </div>

            {/* Months of Experience */}
            <div>
              <input
                type="number"
                min="0"
                max="11"
                value={skill?.monthsOfExperience ?? ''}
                onChange={(e) =>
                  handleSkillInputChange(
                    index,
                    'monthsOfExperience',
                    e.target.value,
                  )
                }
                placeholder="-- Months of Experience --"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
          text-black outline-none focus:border-primary dark:border-form-strokedark
          dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {skillErrors[index]?.monthsOfExperience && (
                <p className="text-red-500 text-sm">
                  {skillErrors[index].monthsOfExperience}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <textarea
            value={skill?.description ?? ''}
            onChange={(e) =>
              handleSkillInputChange(index, 'description', e.target.value)
            }
            placeholder="Description"
            className="w-full mt-2 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {skillErrors[index]?.description && (
            <p className="text-red-500 text-sm">
              {skillErrors[index].description}
            </p>
          )}

          {/* Remove Skill Button */}
          {/* {index > 0 && (
      <button
        type="button"
        onClick={() => handleRemoveSkill(index)}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
      >
        Remove Skill
      </button>
    )} */}
        </div>
      ))}

      <div className="flex items-center justify-end gap-1 mt-2 px-80">
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer
       bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={handleAddSkill}
        >
          +
        </div>
        <span className="text-sm font-medium pr-5 text-black-600">Add</span>
      </div>
      {/* ✅ Add and Submit Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={handleSkillSubmit}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
          hover:from-[#007BFF] hover:to-[#004A99]
          text-white transition duration-150 
          ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default Skills;
