import React from 'react';

const DevelopmentInProgress: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          🚧 Development in Progress
        </h1>
        <p className="text-gray-700">
          UI Not developing 
        </p>
      </div>
    </div>
  );
};

export default DevelopmentInProgress;
