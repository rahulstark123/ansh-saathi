'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  disabled = false, 
  placeholder = 'Select option',
  icon 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Click Outside Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 cursor-default" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 pl-3 pr-10 text-xs text-white text-left flex items-center justify-between transition-all duration-300 relative z-40 cursor-pointer ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.06] hover:border-glass-border-hover'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-text-muted shrink-0">{icon}</span>}
          <span className={value ? 'text-white font-medium' : 'text-text-muted'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-300 shrink-0 absolute right-3 ${isOpen ? 'rotate-180 text-primary-bright' : ''}`} />
      </button>

      {/* Dropdown Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-bg-accent/95 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl py-1.5 max-h-60 overflow-y-auto scrollbar-thin"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <li
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer transition-colors duration-200 ${
                    isSelected 
                      ? 'bg-primary/20 text-white font-medium border-l-2 border-primary' 
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-bright shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
