import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user session exists (i.e., user is logged in)
    const userID = sessionStorage.getItem('userID');
    if (userID) {
      setIsAuthenticated(true);
    }
  }, []);

  // If the user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" />;
  }

  // If authenticated, render the element (protected page)
  return element;
};
export default ProtectedRoute; 