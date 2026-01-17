'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import faqData from '@/app/data/faqData';

type FaqCategory = keyof typeof faqData;
type Step = 'category' | 'question' | 'reset';

type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string;
  category?: FaqCategory;
  questionIndex?: number;
};

// Small helper to generate IDs
const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function HelpChatBot() {
  const [open, setOpen] = useState(false);

  // Focus management
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('category');

  const initConversation = useCallback(() => {
    const initial: Message[] = [
      { id: uid(), type: 'bot', text: 'Hi! 👋 What do you need help with?' },
    ];
    setMessages(initial);
    setCurrentStep('category');
    setSelectedCategory(null);
    try {
      localStorage.setItem('helpChatMessages', JSON.stringify(initial));
    } catch {
      /* ignore quota/SSR errors */
    }
  }, []);

  useEffect(() => {
    if (open) {
      initConversation();
      const t = requestAnimationFrame(() => dialogRef.current?.focus());
      return () => cancelAnimationFrame(t);
    } else {
      triggerRef.current?.focus();
    }
  }, [open, initConversation]);

  useEffect(() => {
    try {
      localStorage.setItem('helpChatMessages', JSON.stringify(messages));
    } catch {
      // ignore quota/SSR errors
    }
  }, [messages]);

  useLayoutEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  const handleCategorySelect = (category: FaqCategory) => {
    setMessages((m) => [
      ...m,
      { id: uid(), type: 'user', text: category },
      { id: uid(), type: 'bot', text: `Great! Here are some common questions about ${category}:` },
    ]);
    setSelectedCategory(category);
    setCurrentStep('question');
  };

  const handleQuestionClick = (question: string, answer: string, index: number) => {
    if (!selectedCategory) return;

    setMessages((m) => [
      ...m,
      { id: uid(), type: 'user', text: question, category: selectedCategory, questionIndex: index },
      { id: 'typing', type: 'bot', text: 'Typing...' },
    ]);

    window.setTimeout(() => {
      setMessages((m) => {
        const withoutTyping = m.filter((x) => x.id !== 'typing');
        return [...withoutTyping, { id: uid(), type: 'bot', text: answer }];
      });
      setCurrentStep('reset');
    }, 600);
  };

  const handleBackClick = () => {
    initConversation();
  };

  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:bottom-4 sm:right-4">
      {!open ? (
        <div className="relative group">
          <button
            ref={triggerRef}
            onClick={() => setOpen(true)}
            className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Open help"
            aria-haspopup="dialog"
          >
            <HelpCircle size={24} />
          </button>
          <div className="absolute right-26 top-6 -translate-y-1/2 translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Help Assistant
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Overlay to allow outside click to close */}
          <button
            className="fixed inset-0 bg-black/20"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-chat-header"
            tabIndex={-1}
            ref={dialogRef}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              trapFocus(e);
            }}
            className="bg-white rounded-xl shadow-xl p-4 w-[320px] sm:w-[90vw] max-w-md max-h-[70vh] flex flex-col overflow-hidden fixed bottom-6 right-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 id="help-chat-header" className="text-base font-bold text-emerald-700">
                Assistant
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded"
                aria-label="Close help"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat window */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-3 px-1 pb-2"
              aria-live="polite"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-[15px] leading-6 whitespace-pre-wrap ${
                    msg.type === 'bot'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-emerald-600 text-white self-end ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* Categories */}
              {currentStep === 'category' && (
                <ul className="space-y-2 mt-2">
                  {Object.keys(faqData).map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategorySelect(cat as FaqCategory)}
                        className="w-full text-left px-4 py-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Questions */}
              {currentStep === 'question' && selectedCategory && (
                <ul className="space-y-2 mt-2">
                  {faqData[selectedCategory].map((faq, idx) => (
                    <li key={faq.q}>
                      <button
                        onClick={() => handleQuestionClick(faq.q, faq.a, idx)}
                        className="w-full text-left px-3 py-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 text-sm transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        {faq.q}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {currentStep === 'reset' && (
                <button
                  onClick={handleBackClick}
                  className="mt-3 w-full rounded-md bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  ← Back to main menu
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
