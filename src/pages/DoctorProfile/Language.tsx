import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Language: React.FC = () => {
  const doctorID = '4f753961-3a5b-4fa3-3c8b-08dd548796a6';
  const [languageOptions, setLanguageOptions] = useState<{ appLOVID: string; name: string }[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch languages and doctor data
  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const [{ data: lovData }, { data: doctorLangData }] = await Promise.all([
        axios.get('https://predart003-001-site1.anytempurl.com/api/AppLOV'),
        axios.get(`https://predart003-001-site1.anytempurl.com/api/Doctor/GetLanguage?doctorId=${doctorID}`),
      ]);

      const filtered = lovData?.data?.filter((item: any) => item.type?.toLowerCase() === 'languagemaster');
      setLanguageOptions(filtered);

      if (doctorLangData?.success && Array.isArray(doctorLangData.data)) {
        const existingForms = doctorLangData.data.map((lang: any) => ({
          id: lang.languageID,
          language: lang.languageMasterID,
          abilities: { read: lang.read, write: lang.write, speak: lang.speak },
          isNew: false,
          isEdited: false, // Track if existing entry is edited
        }));
        setForms(existingForms);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const selectedLanguages = forms.map((form) => form.language);

  const addForm = () => {
    if (selectedLanguages.length === languageOptions.length) {
      alert('⚠️ All languages are already selected.');
      return;
    }
    setForms((prev) => [
      ...prev,
      { id: Date.now(), language: '', abilities: { read: false, write: false, speak: false }, isNew: true, isEdited: true },
    ]);
  };

  const handleFormInputChange = (index: number, field: string, value: string) => {
    const updated = [...forms];
    updated[index][field] = value;
    if (!updated[index].isNew) updated[index].isEdited = true; // Mark as edited if existing
    setForms(updated);
  };

  const handleCheckboxChange = (index: number, ability: 'read' | 'write' | 'speak') => {
    const updated = [...forms];
    updated[index].abilities[ability] = !updated[index].abilities[ability];
    if (!updated[index].isNew) updated[index].isEdited = true; // Mark as edited if existing
    setForms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formsToSubmit = forms.filter((form) => form.isNew || form.isEdited);
    if (formsToSubmit.length === 0) {
      alert('⚠️ No new or edited languages to save.');
      return;
    }

    const payload = formsToSubmit.map((form) => ({
      createdBy: sessionStorage.getItem('userID') || 'unknown',
      id: doctorID,
      type: 'doctor',
      languageMasterID: form.language,
      ...form.abilities,
    }));

    try {
      const { status } = await axios.post(
        'https://predart003-001-site1.anytempurl.com/api/Doctor/SaveLanguage',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if ([200, 201].includes(status)) {
        alert('✅ Languages saved successfully!');
        fetchLanguages(); // Refetch updated data
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Failed to save languages.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-black-700 mt-8 text-left">Language Known</h2>

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
        {/* Clickable Icon */}
        <div
          className="flex justify-center items-center h-10 w-10 text-white rounded-full cursor-pointer 
                    bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99]"
          onClick={addForm}
        >
          +
        </div>

        {/* Non-clickable Text */}
        <span className="text-sm font-medium text-black-600">Add</span>
      </div>
          <div className="flex justify-center gap-2">
            
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default Language;
