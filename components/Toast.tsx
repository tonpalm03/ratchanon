import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from './icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast = ({ toast, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
    error: <AlertTriangleIcon className="w-6 h-6 text-red-400" />,
    info: <InfoIcon className="w-6 h-6 text-cyan-400" />,
  };
  
  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg border-l-4";
  const typeClasses = {
      success: 'border-green-500',
      error: 'border-red-500',
      info: 'border-cyan-500',
  }

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type]} fade-in`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icons[toast.type]}
      </div>
      <div className="ml-3 text-sm font-normal">{toast.message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 p-1.5 inline-flex h-8 w-8"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


interface ToastContainerProps {
  toasts: ToastMessage[];
  setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
}

const ToastContainer = ({ toasts, setToasts }: ToastContainerProps) => {
  const handleDismiss = (id: number) => {
    setToasts(toasts => toasts.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
