import React from 'react';

const SearchMedicals: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Medicals</h1>

      <form className="flex flex-wrap items-center gap-4">
  {/* Enter Location */}
  <div className="flex-1 min-w-[200px]">
    <input
      type="text"
      id="location"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter Location"
    />
  </div>

  {/* Medical Name */}
  <div className="flex-1 min-w-[200px]">
    <input
      type="text"
      id="medicalName"
      className="w-full rounded-lg border border-stroke bg-transparent py-4 px-6
        text-black outline-none focus:border-primary dark:border-form-strokedark
        dark:bg-form-input dark:text-white dark:focus:border-primary"
      placeholder="Enter Medical Name"
    />
  </div>

  {/* Status */}
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
  <div className="flex items-center space-x-4">
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="rounded border border-stroke bg-transparent text-primary focus:ring-primary"
      />
      <span className="ml-2 text-sm text-gray-700">Open</span>
    </label>
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="rounded border border-stroke bg-transparent text-primary focus:ring-primary"
      />
      <span className="ml-2 text-sm text-gray-700">Close</span>
    </label>
  </div>
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

export default SearchMedicals;
