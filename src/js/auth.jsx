import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom'; 
import DropdownUser from '../components/Header/DropdownUser';

const Auth = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/LoginPage');
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <DropdownUser />
        </>
      ) : (
        <>
          <button className="bg-gradient-to-b from-[#004A99] to-[#007BFF] hover:from-[#007BFF] hover:to-[#004A99] text-white transition duration-150 ease-out hover:ease-in py-2 px-4 rounded-lg" onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
};

export default Auth;