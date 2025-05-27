// utils/validationUtils.ts

import api from '../../api/request';



export const checkUsernameAvailability = async (username: string): Promise<{ success: boolean; message: string }> => {
  const trimmedName = username.trim();
  if (!trimmedName) return { success: false, message: 'Username is required' };

  try {
    const response = await api.get(`/Login/CheckUserNameExist`, {
      params: { UserName: trimmedName },
    });

    const result = response.data;

    return result.success
      ? { success: false, message: 'Name already exists' }
      : { success: true, message: '' };
  } catch (error) {
    console.error('Error checking username:', error);
    return { success: false, message: 'Error checking username' };
  }
};



export const checkEmailAvailability = async (email: string): Promise<{ success: boolean; message: string }> => {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail) return { success: false, message: 'Email is required' };
  if (!emailRegex.test(trimmedEmail)) return { success: false, message: 'Invalid email format' };

  try {
    const response = await api.get(`/Login/CheckEmailExist`, {
      params: { Email: trimmedEmail },
    });

    const result = response.data;

    return result.success
      ? { success: false, message: 'Email already exists' }
      : { success: true, message: '' };
  } catch (error) {
    console.error('Error checking email:', error);
    return { success: false, message: 'Error checking email' };
  }
};



export const checkPhoneAvailability = async (
  phone: string
): Promise<{ success: boolean; message: string }> => {
  const trimmedPhone = phone.trim();
  const phoneRegex = /^[0-9]{10}$/;

  if (!trimmedPhone) {
    return { success: false, message: 'Phone number is required' };
  }

  if (!phoneRegex.test(trimmedPhone)) {
    return { success: false, message: 'Enter a valid 10-digit number' };
  }

  try {
    const response = await api.get('/Login/CheckMobileExist', {
      params: { Mobile: trimmedPhone },
    });

    const result = response.data;

    return result.success
      ? { success: false, message: 'Mobile number already exists' }
      : { success: true, message: '' };
  } catch (error) {
    console.error('Error checking mobile:', error);
    return { success: false, message: 'Error checking mobile number' };
  }
};
