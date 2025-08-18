// utils/validators.ts

export const isValidName = (value: string) =>
  /^[a-zA-Z0-9@._-]+$/.test(value.trim()) && !/[\u{1F600}-\u{1F6FF}]/u.test(value);  // No emojis allowed

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && !/\s/.test(value);  // No spaces allowed in email

export const isValidPhone = (value: string) =>
  /^\d{10}$/.test(value.trim()) && !/\s/.test(value.trim());  // No alphabet or spaces allowed for phone number

export const isValidAadhaar = (value: string) =>
  /^\d{12}$/.test(value.trim()) && !/\s/.test(value.trim());  // Only 12 digits, no spaces or alphabets allowed

export const isValidPAN = (value: string) =>
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim()) && !/\s/.test(value.trim());  // Only uppercase letters and numbers, no spaces allowed

export const isNotEmpty = (value: string) => value.trim() !== '';

export const isValidDob = (value: string) => {
  const dob = new Date(value.trim());
  const today = new Date();
  return dob <= today;  // Date cannot be in the future
};
