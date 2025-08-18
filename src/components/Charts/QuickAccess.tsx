import React, { useState } from 'react';

const QuickAccessCards: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleComingSoonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <h3 className="text-center text-2xl font-semibold mb-6">Quick Access</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Book Appointment - Working Link */}
        <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center h-full">
          <h4 className="text-xl font-semibold mb-4">Book Appointment</h4>
          <a href="/appointment/booking">
            <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
              Book Appointment
            </button>
          </a>
        </div>

        {/* View Reports - Popup */}
        <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center h-full">
          <h4 className="text-xl font-semibold mb-4">View Reports</h4>
          <button
            onClick={handleComingSoonClick}
            className="bg-pink-400 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            View Reports
          </button>
        </div>

        {/* Prescription Details - Popup */}
        <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center h-full">
          <h4 className="text-xl font-semibold mb-4">Prescription Details</h4>
          <button
            onClick={handleComingSoonClick}
            className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300"
          >
            View Prescription
          </button>
        </div>

        {/* Health Records - Popup */}
        <div className="bg-white shadow-lg rounded-lg p-7 flex flex-col items-center text-center h-full">
          <h4 className="text-xl font-semibold mb-4">Health Records</h4>
          <button
            onClick={handleComingSoonClick}
            className="bg-yellow-500 text-white py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            View Records
          </button>
        </div>
      </div>

      {/* Shared Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md text-center w-[400px] sm:w-[500px]">
            <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
            <p className="mb-4">Please wait…</p>
            <button
              onClick={handleClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccessCards;
