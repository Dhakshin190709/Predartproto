import React from 'react';
import React, { useState, useEffect } from 'react';
const SearchHospital: React.FC = () => {
  const [hospitalTypes, setHospitalTypes] = useState([]);
  const [formData, setFormData] = useState<RowData>({
   
   
    hospitalType:'',
   
    });


  useEffect(() => {
      fetch("https://predart003-001-site1.anytempurl.com/api/AppLOV")
        .then((response) => response.json())
        .then((data) => {
          // Filter for "Hospital" type
          const filteredTypes = data.data.filter((item) => item.type === "Hospital");
          setHospitalTypes(filteredTypes); // Set filtered options
        })
        .catch((error) => console.error("Error fetching data:", error));
    }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Hospital</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Enter Location */}
        <div>
         
          <input
            type="text"
            id="location"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Location"
          />
        </div>

        {/* Hospital Name */}
        <div>
         
          <input
            type="text"
            id="hospitalName"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Hospital Name"
          />
        </div>

        {/* Hospital Type */}
        <div>
          
        <select
    id="hospitalType"
    name="hospitalType"
    value={formData.hospitalType}
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 
      text-black outline-none focus:border-primary dark:border-form-strokedark 
      dark:bg-form-input dark:text-white dark:focus:border-primary"
    onChange={(e) =>
      setFormData({ ...formData, hospitalType: e.target.value })
    }
    required
  >
    <option value="">Hospital Type</option>
    {hospitalTypes.length > 0 ? (
      hospitalTypes.map((type) => (
        <option key={type.appLOVID} value={type.name}>
          {type.name} {/* Displaying the name of the hospital */}
        </option>
      ))
    ) : (
      <option value="">No Hospital Types Available</option>
    )}
  </select>
        </div>

        {/* Specialization */}
        <div>
         
          <input
            type="text"
            id="specialization"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Specialization (e.g., Cardiology)"
          />
        </div>
      </form>

      {/* Search Button */}
      <div className="mt-6">
        <button
          type="button"
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
                  hover:from-[#007BFF] hover:to-[#004A99]
                  text-white transition duration-150 
                  ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchHospital;
