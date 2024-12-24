import React from 'react';

const SearchLab: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Lab</h1>

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

        {/* Lab Name */}
        <div>
         
          <input
            type="text"
            id="labName"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Lab Name"
          />
        </div>

        {/* Test Type */}
        <div>
         
          <input
            type="text"
            id="testType"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Test Type"
          />
        </div>

        {/* Parameter */}
        <div>
        
          <input
            type="text"
            id="parameter"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Parameter"
          />
        </div>

        {/* Category */}
        <div>
        
          <input
            type="text"
            id="category"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
              text-black outline-none focus:border-primary dark:border-form-strokedark
              dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Category"
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

export default SearchLab;
