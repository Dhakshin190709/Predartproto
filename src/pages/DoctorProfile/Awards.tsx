import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Award {
  awardName: string;
  year: string;
  description: string;
}

type FormErrors = { [key: string]: string };

const Awards: React.FC = () => {
   const [doctorID,setDoctorID]=useState([]);
  const [awards, setAwards] = useState<Award[]>([{ awardName: '', year: '', description: '' }]);
  const [existingAwards, setExistingAwards] = useState<Award[]>([]); // ✅ Track existing awards
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 🚀 Fetch awards on mount
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetDoctorAward?doctorId=${doctorID}`
        );

        const awardsData = response.data?.data;
        if (response.status === 200 && Array.isArray(awardsData)) {
          const mappedAwards = awardsData.map((award: any) => ({
            awardName: award.awardName ?? '',
            year: award.awardYear ? String(award.awardYear) : '',
            description: award.description ?? '',
          }));

          setAwards(mappedAwards.length ? mappedAwards : [{ awardName: '', year: '', description: '' }]);
          setExistingAwards(mappedAwards); // ✅ Save fetched awards
        } else {
          console.warn('⚠️ No awards found or unexpected response format.');
        }
      } catch (error: any) {
        console.error('🚨 Error fetching awards:', error?.response?.data || error.message);
      }
    };

    fetchAwards();
  }, [doctorID]);

  const updateAwardField = (index: number, field: keyof Award, value: string) => {
    setAwards((prevAwards) => {
      const updatedAwards = [...prevAwards];
      updatedAwards[index] = { ...updatedAwards[index], [field]: value };
      return updatedAwards;
    });
  };

  const addAward = () => setAwards([...awards, { awardName: '', year: '', description: '' }]);
  const removeAward = (index: number) => setAwards(awards.filter((_, i) => i !== index));

  // ✅ Check if an award already exists in the fetched awards
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

    if (!userID) {
      alert('🚨 User not logged in. Please log in again.');
      return;
    }

    let isValid = true;
    const errors: FormErrors = {};

    // 🔍 Filter out existing (duplicate) awards
    const newAwards = awards.filter((award) => !isDuplicate(award));

    if (newAwards.length === 0) {
      alert('🚫 No new awards to submit. Already submitted awards will not be saved again.');
      return;
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
        doctorID,
        awardName: award.awardName.trim(),
        awardYear: year,
        description: award.description.trim(),
      };
    });

    setFormErrors(errors);

    if (!isValid) return;

    try {
      const response = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveDoctorAward',
        apiAwardsData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200 || response.status === 201) {
        alert('✅ New awards saved successfully!');
        setExistingAwards([...existingAwards, ...newAwards]); // 🔥 Add newly saved awards to existing list
      } else {
        console.error('❌ Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('🚨 Error saving awards:', error?.response?.data || error.message);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleAwardSubmit}>
      <h2 className="text-lg font-bold text-black-700">Awards and Recognitions</h2>

      {awards.map((award, index) => (
        <div key={index} className="w-150 rounded-lg border border-stroke py-4 px-6 text-black">
          <div className="flex gap-4">
            <input
              type="text"
              value={award.awardName}
              onChange={(e) => updateAwardField(index, 'awardName', e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent
              py-4 pl-6 pr-10 text-black outline-none focus:border-primary
               dark:border-form-strokedark dark:bg-form-input dark:text-white
                dark:focus:border-primary"
              placeholder="Enter award name"
            />
            {formErrors[`award_${index}_awardName`] && (
              <p className="text-red-500 text-sm">{formErrors[`award_${index}_awardName`]}</p>
            )}

            <input
              type="text"
              value={award.year}
              onChange={(e) => updateAwardField(index, 'year', e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent
              py-4 pl-6 pr-10 text-black outline-none focus:border-primary
               dark:border-form-strokedark dark:bg-form-input dark:text-white
                dark:focus:border-primary"
              placeholder="Enter year"
            />
            {formErrors[`award_${index}_year`] && (
              <p className="text-red-500 text-sm">{formErrors[`award_${index}_year`]}</p>
            )}
          </div>

          <textarea
            value={award.description}
            onChange={(e) => updateAwardField(index, 'description', e.target.value)}
            className="w-full mt-2 rounded-lg border border-stroke bg-transparent
            py-4 pl-6 pr-10 text-black outline-none focus:border-primary
             dark:border-form-strokedark dark:bg-form-input dark:text-white
              dark:focus:border-primary"
            placeholder="Enter description"
            rows={3}
          />
          {formErrors[`award_${index}_description`] && (
            <p className="text-red-500 text-sm">{formErrors[`award_${index}_description`]}</p>
          )}
        </div>
      ))}
 <div className="flex items-center justify-end gap-1 mt-2 px-80">
                  <div
                    className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer
       bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
                    onClick={addAward}
                  >
                    +
                  </div>
                  <span className="text-sm font-medium pr-5 text-black-600">
                    Add
                  </span>
                </div>
      <div className="flex justify-center gap-2">
        
       <button
          type="submit"
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

export default Awards;
