import React, { useEffect, useState } from 'react';
import api from '../../api/request';
import { toast } from 'react-toastify';

const FindDoctor = () => {
  const [specializations, setSpecializations] = useState<
    { id: string; name: string }[]
  >([]);
  const [genders, setGenders] = useState<{ id: string; name: string }[]>([]);
  const [qualifications, setQualifications] = useState<
    { id: string; name: string }[]
  >([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  const [form, setForm] = useState({
    selectedSpecializationID: '',
    doctorID: '',
  });

  // Fetch LOVs (Specialization, Gender, Qualification)
  const fetchLOV = async (type: string) => {
    const res = await api.get(`/AppLOV?type=${type}`);
    return (res.data?.data || [])
      .filter((item: any) => item.isActive)
      .map((item: any) => ({ id: item.appLOVID, name: item.name }));
  };

  useEffect(() => {
    const fetchLOVs = async () => {
      try {
        const [specs, gens, quals] = await Promise.all([
          fetchLOV('Specializations'),
          fetchLOV('Gender'),
          fetchLOV('Qualification'),
        ]);
        setSpecializations(specs);
        setGenders(gens);
        setQualifications(quals);
      } catch (err) {
        console.error('LOV fetch error:', err);
      }
    };
    fetchLOVs();
  }, []);

  // Fetch doctors for selected specialization
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!form.selectedSpecializationID) {
        setFilteredDoctors([]);
        return;
      }

      try {
        const response = await api.get('/Doctor', {
          params: {
            SpecializationId: form.selectedSpecializationID,
          },
        });

        if (response.data?.data && Array.isArray(response.data.data)) {
          setFilteredDoctors(response.data.data);
        } else {
          setFilteredDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setFilteredDoctors([]);
      }
    };

    fetchDoctors();
  }, [form.selectedSpecializationID]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getNameByID = (list: { id: string; name: string }[], id: string) =>
    list.find((item) => item.id === id)?.name || 'N/A';

  const handleSearch = async () => {
    const { selectedSpecializationID, doctorID } = form;

    if (!selectedSpecializationID || !doctorID) {
      toast.warning('Please select both specialization and doctor');
      return;
    }

    const selectedDoc = filteredDoctors.find(
      (doc) => doc.doctorID === doctorID,
    );
    if (!selectedDoc) {
      toast.warning('Doctor not found in list');
      return;
    }

    try {
      const res = await api.get('/Doctor', {
        params: {
          SpecializationId: selectedSpecializationID,
          DoctorName: selectedDoc.doctorName, // ✅ Correct doctorName passed
        },
      });

      if (res.data?.data?.length > 0) {
        setSelectedDoctor(res.data.data[0]);
      } else {
        toast.info('No doctor data found');
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch doctor details');
    }
  };

  return (
    <div
      id="FindDoctor"
      className="w-full min-h-[70vh] bg-cover bg-center bg-no-repeat flex items-center justify-center mt-70"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/532963888/photo/medical-or-science-with-soft-light-background.jpg?s=612x612&w=0&k=20&c=0hNtjAuZO_3IdxF0yLQ5zkF7YxluQA8g3smV5o5SNls=')",
      }}
    >
      <div className="max-w-6xl w-full px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="md:w-1/2 w-full">
            <img
              src="https://cdndailyexcelsior.b-cdn.net/wp-content/uploads/2024/03/page6-1-2.jpg"
              alt="Doctor with patient"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>

          <div className="md:w-1/2 w-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-black mb-6">Find Doctors</h2>

            <div className="flex flex-col gap-6">
              {/* Specialization Dropdown */}
              <div>
                <label className="block font-medium mb-1">Specialization</label>
                <select
                  name="selectedSpecializationID"
                  value={form.selectedSpecializationID}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Dropdown */}
              <div>
                <label className="block font-medium mb-1">Doctor</label>
                <select
                  name="doctorID"
                  value={form.doctorID}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-stroke bg-white py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
                >
                  <option value="">Select Doctor</option>

                  {form.selectedSpecializationID &&
                    filteredDoctors.length === 0 && (
                      <option disabled>No doctor found</option>
                    )}

                  {filteredDoctors.map((doc) => (
                    <option key={doc.doctorID} value={doc.doctorID}>
                      {doc.doctorName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white font-medium px-6 py-2 rounded-lg transition duration-200"
                >
                  Search
                </button>
              </div>

              {/* Doctor Details Card */}
              {selectedDoctor && (
                <div className="flex gap-4 items-center border border-gray-300 rounded-xl p-4 bg-white shadow-md mt-4">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png"
                    alt="Doctor Avatar"
                    className="w-24 h-24 rounded-full object-cover border border-gray-400"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      {selectedDoctor.doctorName}
                    </h3>
                    <p>
                      <span className="font-semibold">Gender:</span>{' '}
                      {getNameByID(genders, selectedDoctor.genderID)}
                    </p>
                    <p>
                      <span className="font-semibold">Qualification:</span>{' '}
                      {getNameByID(
                        qualifications,
                        selectedDoctor.qualificationID,
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">Specialization:</span>{' '}
                      {getNameByID(
                        specializations,
                        selectedDoctor.specializationID,
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;


