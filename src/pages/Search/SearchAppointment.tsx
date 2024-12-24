import React from 'react';

const SearchAppointment: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Search Appointment</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Appointment Number */}
        <div>
          
          <input
            type="text"
            id="appointmentNumber"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Appointment Number"
          />
        </div>

        {/* Patient Name */}
        <div>
         
          <input
            type="text"
            id="patientName"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Patient Name"
          />
        </div>

        {/* Patient Mobile Number */}
        <div>
         
          <input
            type="text"
            id="patientMobile"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
            text-black outline-none focus:border-primary dark:border-form-strokedark
            dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Enter Mobile Number"
          />
        </div>

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

        {/* From Date */}
        <div>
  <input
    type="text"
    id="fromDate"
    onFocus={(e) => (e.target.type = "date")}
    onBlur={(e) => (e.target.type = "text")}
    placeholder="From Date"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
  />
</div>

{/* To Date */}
<div>
  <input
    type="text"
    id="toDate"
    onFocus={(e) => (e.target.type = "date")}
    onBlur={(e) => (e.target.type = "text")}
    placeholder="To Date"
    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10
      text-black outline-none focus:border-primary dark:border-form-strokedark
      dark:bg-form-input dark:text-white dark:focus:border-primary"
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

export default SearchAppointment;
