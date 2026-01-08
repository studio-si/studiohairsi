
import React from 'react';

interface ModalWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalWidget: React.FC<ModalWidgetProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-serif text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-2xl font-light">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalWidget;
