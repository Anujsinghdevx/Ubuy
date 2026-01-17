'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  title = 'Filters',
  children,
}: FilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap on open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close Filters"
          />

          {/* Sliding Panel */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            className="relative bg-white rounded-t-2xl w-full p-4 max-h-[80vh] overflow-y-auto space-y-4 shadow-lg"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Close Filters Drawer"
                className="text-gray-700 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Children Content */}
            <div className="space-y-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
