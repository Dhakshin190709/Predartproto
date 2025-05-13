import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserToggle: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(true);

  const fetchUsers = async (status: boolean) => {
    try {
      await axios.get(
        `https://predart003-001-site1.anytempurl.com/api/User?isActive=${status}`
      );
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers(isActive);
  }, [isActive]);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <label className="relative inline-flex items-center cursor-pointer scale-150">
        <input
          type="checkbox"
          checked={isActive}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div
          className={`w-16 h-9 rounded-full transition-colors duration-300 ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <div className="absolute left-1 top-1 bg-white w-7 h-7 rounded-full transition-transform duration-300 transform peer-checked:translate-x-7"></div>
      </label>

      <span
        className={`mt-4 text-xl font-semibold ${
          isActive ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default UserToggle;
