'use client';

import { type ReactNode, createElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  ToastContext,
  useToastState,
  type ToastVariant,
} from '@/hooks/use-toast';

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  info: 'border-warm-200 bg-white text-warm-800 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-200',
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: createElement(
    'svg',
    {
      className: 'h-5 w-5 text-green-500 dark:text-green-400',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    createElement('path', {
      fillRule: 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
      clipRule: 'evenodd',
    })
  ),
  error: createElement(
    'svg',
    {
      className: 'h-5 w-5 text-red-500 dark:text-red-400',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    createElement('path', {
      fillRule: 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z',
      clipRule: 'evenodd',
    })
  ),
  info: createElement(
    'svg',
    {
      className: 'h-5 w-5 text-warm-500 dark:text-warm-400',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    createElement('path', {
      fillRule: 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
      clipRule: 'evenodd',
    })
  ),
};

function ToastItem({
  message,
  variant,
  onClose,
}: {
  message: string;
  variant: ToastVariant;
  onClose: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
        variantStyles[variant]
      )}
      role="alert"
    >
      <span className="shrink-0">{variantIcons[variant]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className={cn(
          'shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500'
        )}
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </motion.div>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToastState();

  // We need to use the context's toasts, not a local state
  // This component is rendered inside the provider, so we'll get them from context
  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const state = useToastState();

  return createElement(
    ToastContext.Provider,
    { value: state },
    children,
    typeof document !== 'undefined'
      ? createPortal(
          createElement(
            'div',
            {
              className:
                'fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm',
              'aria-live': 'polite',
              'aria-label': 'Notifications',
            },
            createElement(
              AnimatePresence,
              { mode: 'popLayout' as const },
              state.toasts.map((toast) =>
                createElement(ToastItem, {
                  key: toast.id,
                  message: toast.message,
                  variant: toast.variant,
                  onClose: () => state.removeToast(toast.id),
                })
              )
            )
          ),
          document.body
        )
      : null
  );
}

export { useToast } from '@/hooks/use-toast';
