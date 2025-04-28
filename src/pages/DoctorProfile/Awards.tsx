import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { inputFieldClass } from '../../components/FormStyles';

interface Award {
  awardName: string;
  year: string;
  description: string;
}
interface AwardsProps {
  handleAwardSubmit: (e: React.FormEvent) => Promise<void>;
}
type FormErrors = { [key: string]: string };
const Awards: React.FC<AwardsProps> = ({ handleAwardSubmit }) => {
   const [doctorID,setDoctorID]=useState([]);
  const [awards, setAwards] = useState<Award[]>([{ awardName: '', year: '', description: '' }]);
  const [existingAwards, setExistingAwards] = useState<Award[]>([]); // ✅ Track existing awards
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 🚀 Fetch awards on mount
  useEffect(() => {
    const userID = sessionStorage.getItem('userID');
    const doctorID = sessionStorage.getItem('doctorID');
  
    if (!userID || !doctorID) {
      console.warn('⚠️ User ID or Doctor ID is missing in session storage.');
      return;
    }
  
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
  }, []);
  

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
              className={`${inputFieldClass} mb-4`}
              placeholder="Enter award name"
            />
            {formErrors[`award_${index}_awardName`] && (
              <p className="text-red-500 text-sm">{formErrors[`award_${index}_awardName`]}</p>
            )}

            <input
              type="text"
              value={award.year}
              onChange={(e) => updateAwardField(index, 'year', e.target.value)}
              className={`${inputFieldClass} mb-4`}
              placeholder="Enter year"
            />
            {formErrors[`award_${index}_year`] && (
              <p className="text-red-500 text-sm">{formErrors[`award_${index}_year`]}</p>
            )}
          </div>

          <textarea
            value={award.description}
            onChange={(e) => updateAwardField(index, 'description', e.target.value)}
             className={inputFieldClass}
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
      {/* <div className="flex justify-center gap-2">
        
       <button
          type="submit"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
          hover:from-[#007BFF] hover:to-[#004A99]
          text-white transition duration-150 
          ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Submit
        </button> 
      </div> */}
    </form>
  );
};

export default Awards;
