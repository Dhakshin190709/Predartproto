import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail } from 'lucide-react';
import PhoneIcon from '../images/icon/Phone volume solid (3).svg';
import MailIcon from '../images/icon/Email.svg';
import api from '../api/request';
interface UserData {
  email: string;
  mobile: string;
}

const UserContact: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchUserData = async () => {
    const userID = sessionStorage.getItem('userID');

    if (!userID) {
      alert('User not logged in. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/User/${userID}`);
      console.log("Fetched data:", res.data);

      if (res.data.success && res.data.data) {
        setUserData({
          email: res.data.data.email,
          mobile: res.data.data.mobile,
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500 text-lg">
        Loading contact info...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white border border-blue-100">
      <h2 className="text-2xl font-semibold mb-4 text-center text-blue-400">User Contact Info</h2>

      <div className="flex items-center mb-4">
   
      <img src={MailIcon} alt="Email Icon" className="w-5 h-5 mr-2" />
     
      
        <span className="ml-2 text-gray-600">{userData?.email || 'N/A'}</span>
      </div>

      <div className="flex items-center">
  <img src={PhoneIcon} alt="Phone Icon" className="w-5 h-5 mr-2" />
 
  <span className="ml-2 text-gray-600">{userData?.mobile || 'N/A'}</span>
</div>

    </div>
  );
};

export default UserContact;
