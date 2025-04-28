import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Define the types for the props
interface LanguageProps {
  handleSubmit: (e: React.FormEvent) => void; 
  forms: { 
    id: number; 
    language: string; 
    abilities: { read: boolean; write: boolean; speak: boolean }; 
    isNew: boolean; 
  }[]; 
  setForms: React.Dispatch<React.SetStateAction<{ 
    id: number; 
    language: string; 
    abilities: { read: boolean; write: boolean; speak: boolean }; 
    isNew: boolean; 
  }[]>>; 
}

const Language: React.FC<LanguageProps> = ({ handleSubmit, forms, setForms }) => {
  const [doctorID, setDoctorID] = useState("");
  const [languageOptions, setLanguageOptions] = useState<{ appLOVID: string; name: string }[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch language options when component loads (without waiting for doctorID)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data } = await axios.get('https://predart003-001-site1.anytempurl.com/api/AppLOV');
        const filtered = data?.data?.filter((item: any) => item.type?.toLowerCase() === 'languagemaster');
        setLanguageOptions(filtered);
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };

    fetchLanguages();
  }, []);

  // ✅ First: Read doctorID from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem("doctorID");
    console.log("Fetched from sessionStorage:", id);
    if (id) {
      setDoctorID(id);
    }
  }, []);
  useEffect(() => {
    if (!doctorID) {
      console.log("doctorID is not available yet.");
      return;
    }

    const fetchDoctorLanguages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `https://predart003-001-site1.anytempurl.com/api/Doctor/GetLanguage?doctorId=${doctorID}`
        );

        console.log("API Response:", data);

        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          const existingForms = data.data.map((lang: any) => ({
            id: lang.languageID,
            language: lang.languageMasterID,
            abilities: {
              read: lang.read,
              write: lang.write,
              speak: lang.speak,
            },
            isNew: false,
          }));
          setForms(existingForms);
        }
      } catch (err) {
        console.error("Error fetching doctor languages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorLanguages();
  }, [doctorID]);
  
  
  const selectedLanguages = forms.map((form) => form.language);

  const addForm = () => {
    if (selectedLanguages.length >= languageOptions.length) {
      alert('⚠️ All languages are already selected.');
      return;
    }
    setForms([...forms, { id: Date.now(), language: '', abilities: { read: false, write: false, speak: false }, isNew: true }]);
  };

  const handleFormInputChange = (index: number, field: string, value: string) => {
    const updated = [...forms];
    updated[index][field] = value;
    setForms(updated);
  };

  const handleCheckboxChange = (index: number, ability: 'read' | 'write' | 'speak') => {
    const updated = [...forms];
    updated[index].abilities[ability] = !updated[index].abilities[ability];
    setForms(updated);
  };

  
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-black-700 mt-8 text-left">Language Known</h2>

     
      {/* Language selection UI (Always visible) */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {forms.map((form, index) => (
            <div key={form.id} className="rounded-lg border border-stroke py-4 px-6">
              <div className="flex items-center gap-6">
                <select
                  value={form.language}
                  onChange={(e) => handleFormInputChange(index, 'language', e.target.value)}
                  className="w-70 rounded-lg border border-stroke py-4 pl-4 pr-8"
                >
                  <option value="">-- Select a Language --</option>
                  {languageOptions.map(({ appLOVID, name }) => (
                    <option
                      key={appLOVID}
                      value={appLOVID}
                      disabled={selectedLanguages.includes(appLOVID) && form.language !== appLOVID}
                    >
                      {name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-4">
                  {['read', 'write', 'speak'].map((ability) => (
                    <label key={ability} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.abilities[ability]}
                        onChange={() => handleCheckboxChange(index, ability as any)}
                        className="mr-1"
                      />
                      {ability.charAt(0).toUpperCase() + ability.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-1">
            <div
              className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer 
                        bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
              onClick={addForm}
            >
              +
            </div>
            <span className="text-sm font-medium text-black-600">Add</span>
          </div>

          <div className="flex justify-center gap-2">
            {/* <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
              Save
            </button> */}
          </div>
        </>
      )}
    </form>
  );
};

export default Language;
