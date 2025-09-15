import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md bg-gray-800 border border-amber-500/30 rounded-xl shadow-lg card-glow">
        <div className="p-8">
          <header className="mb-4">
            <h2 className="text-2xl font-bold text-amber-400">{title}</h2>
          </header>
          <p className="text-gray-300 mb-8">{message}</p>
          <div className="flex gap-4 mt-8">
            <button
              onClick={onCancel}
              className="w-full px-5 py-3 text-lg font-bold text-white bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="w-full px-5 py-3 text-lg font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-300"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
