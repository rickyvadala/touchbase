'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'touchbase-install-prompt-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      // Re-show after 7 days
      if (Date.now() - dismissedAt < sevenDays) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
    setDeferredPrompt(null);
  }, []);

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="flex items-center gap-3 rounded-xl border border-warm-200 bg-white p-4 shadow-lg dark:border-warm-700 dark:bg-warm-800">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-50">
                Install TouchBase
              </p>
              <p className="mt-0.5 text-xs text-warm-500 dark:text-warm-400">
                Add to your home screen for quick access
              </p>
            </div>

            <button
              onClick={handleInstall}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-coral-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-600 active:bg-coral-700"
            >
              <Download className="h-4 w-4" />
              Install
            </button>

            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600 dark:hover:bg-warm-700 dark:hover:text-warm-300"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
