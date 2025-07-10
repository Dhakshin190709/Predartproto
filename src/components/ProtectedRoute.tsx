import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('authToken');
  const userID = sessionStorage.getItem('userID');

  if (!token || !userID) {
    return <Navigate to="/LoginPage" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
