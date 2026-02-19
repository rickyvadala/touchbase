'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', duration: 0.3, bounce: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export function Modal({
  open,
  onClose,
  children,
  className,
  title,
  description,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-describedby={description ? 'modal-description' : undefined}
            className={cn(
              'relative z-10 mx-4 w-full max-w-lg rounded-xl border border-warm-200 bg-white p-6 shadow-xl',
              'dark:border-warm-700 dark:bg-warm-800',
              className
            )}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-50">
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-warm-500 dark:text-warm-400"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 rounded-md p-1 text-warm-400 transition-colors',
                'hover:bg-warm-100 hover:text-warm-600',
                'dark:hover:bg-warm-700 dark:hover:text-warm-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500'
              )}
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
