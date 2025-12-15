
import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-end md:justify-end md:items-stretch bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* 
         Modal Content Container 
         - Mobile: Bottom Sheet (rounded-t-2xl, slide-up)
         - Desktop: Right Side Sheet (rounded-l-2xl, full height, slide-left)
      */}
      <div 
        className={`
          bg-card text-card-foreground 
          w-full 
          
          /* Mobile Styles */
          rounded-t-2xl 
          max-h-[85vh] 
          
          /* Desktop Styles (Side Sheet) */
          md:w-[500px] md:max-w-[90vw]
          md:h-full md:max-h-full 
          md:rounded-none md:rounded-l-2xl 
          
          shadow-2xl 
          flex flex-col 
          
          transform transition-transform duration-300 ease-out
          animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:slide-in-from-right
          ${className || ''}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Handle Bar (Visual indicator for drawer) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 bg-muted rounded-full"></div>
        </div>

        {/* Content Wrapper with scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain p-1">
           {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
