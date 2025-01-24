import React from 'react';

const QuickAccessCards: React.FC = () => {
  return (
    <div className="container mx-auto mt-4 px-4">
      <h3 className="text-center text-2xl font-semibold mb-6">Quick Access</h3>
      <div className="flex flex-wrap gap-6">
       
  
  <div className="flex justify-between gap-6">
    {/* Book Appointment Card */}
    <div className="w-1/2">
      <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center">
        <h4 className="text-xl font-semibold mb-4">Book Appointment</h4>
       
        <a href="/appointment/booking">
          <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300 w-full">
          Book Appointment
          </button>
        </a>
      </div>
    </div>

    {/* View Reports Card */}
    <div className="w-1/2">
      <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center">
        <h4 className="text-xl font-semibold mb-4">View Reports</h4>
       
        <a href="/reports/appointmentreport">
          <button className="bg-pink-400 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-300 w-full">
            View Reports
          </button>
        </a>
      </div>
    </div>
  </div>



        {/* View Prescription Card */}
       
 
        <div className="flex justify-between gap-6">
  {/* Prescription Card */}
  <div className="w-full sm:w-1/2">
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
      <h4 className="text-xl font-semibold mb-4">Prescription Details</h4>
      <a href="/prescription">
        <button className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 w-full">
          View Prescription
        </button>
      </a>
    </div>
  </div>

  {/* Health Records Card */}
  <div className="w-full sm:w-1/2">
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
      <h4 className="text-xl font-semibold mb-4">Health Records</h4>
      <a href="/patient-record">
        <button className="bg-yellow-500 text-white py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300 w-full">
          View Records
        </button>
      </a>
    </div>
  </div>
</div>



      </div>
    </div>
  );
};

export default QuickAccessCards;
