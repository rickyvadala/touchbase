'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-x-0 top-0 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 bg-warm-700 px-4 py-2 text-warm-50 dark:bg-warm-900">
            <WifiOff className="h-3.5 w-3.5" />
            <p className="text-xs font-medium">
              You&apos;re offline &mdash; showing cached data
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
