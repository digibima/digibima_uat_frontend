// utils/toaster.js
import { toast } from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-center',
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
  });
};
