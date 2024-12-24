import React from 'react';

const SearchDoctors: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Doctor</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Doctor Name */}
        <div>
        
          <input
            type="text"
            id="doctorName"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Doctor Name"
          />
        </div>

        {/* Doctor ID */}
        <div>
        
          <input
            type="text"
            id="doctorId"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Doctor ID"
          />
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

        {/* Location */}
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

export default SearchDoctors;
