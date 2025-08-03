import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};