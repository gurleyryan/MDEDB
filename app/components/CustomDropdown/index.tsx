'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
  bgColor?: string;
  emoji?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  colorCoded?: boolean;
}

export function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  className = "",
  colorCoded = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const calculateDropdownHeight = () => {
    const optionHeight = 48;
    const maxVisibleOptions = 5;
    const borderHeight = 2;

    const visibleOptions = Math.min(options.length, maxVisibleOptions);
    return (visibleOptions * optionHeight) + borderHeight;
  };

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setHoveredIndex(null);
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative ${className}`}
      style={{ 
        position: 'relative',
        zIndex: isOpen ? 50000 : 'auto', // Very high z-index when open
        isolation: isOpen ? 'isolate' : 'auto'
      }}
    >
      {/* Dropdown Button - no animations */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-glass cursor-pointer w-full px-3 py-2 text-white text-sm font-body focus:outline-none transition-all duration-50 flex items-center justify-between ${
          isOpen ? 'ring-1 ring-blue-500/50' : ''
        }`}
        style={{
          position: 'relative',
          zIndex: isOpen ? 50001 : 'auto',
          ...(colorCoded && selectedOption?.color && {
            color: selectedOption.color,
            borderColor: selectedOption.color + '50'
          })
        }}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.emoji && (
            <span>{selectedOption.emoji}</span>
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        
        <span
          className={`w-4 h-4 text-gray-400 transition-transform duration-100 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          ▼
        </span>
      </button>
      
      {/* Dropdown Options - Force highest z-index */}
      {isOpen && className.includes('status-dropdown') && buttonRect ? (
        createPortal(
          <div
            className="dropdown-glass fixed rounded-lg overflow-hidden"
            style={{
              position: 'fixed',
              top: buttonRect.bottom + 4,
              left: buttonRect.left,
              width: buttonRect.width,
              zIndex: 99998,
              height: `${calculateDropdownHeight()}px`
            }}
          >
            <div className="overflow-y-auto custom-scrollbar h-full">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`w-full text-left px-3 py-3 text-sm font-body transition-all duration-75 flex items-center gap-3 border-b border-gray-700/50 last:border-b-0 focus:outline-none relative overflow-hidden ${
                    option.value === value ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  style={{
                    height: '48px',
                    ...(colorCoded && option.bgColor && option.color && {
                      background: hoveredIndex === index 
                        ? `linear-gradient(135deg, ${option.bgColor}ee, ${option.bgColor}cc)`
                        : `linear-gradient(135deg, ${option.bgColor}cc, ${option.bgColor}aa)`,
                      color: option.color,
                      fontWeight: option.value === value ? '600' : '500'
                    }),
                    ...(!colorCoded && {
                      backgroundColor: hoveredIndex === index ? '#374151' : 'transparent'
                    })
                  }}
                >
                  <div className="relative flex items-center gap-3 w-full">
                    {option.emoji && (
                      <span className="text-lg flex-shrink-0">
                        {option.emoji}
                      </span>
                    )}
                    <span className="flex-1">{option.label}</span>
                    {option.value === value && (
                      <span className="text-blue-400 text-xs">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      ) : isOpen ? (
        <div
          className="dropdown-glass absolute top-full left-0 right-0 rounded-lg overflow-hidden mt-1"
          style={{
            position: 'absolute',
            zIndex: 50002, // Highest possible z-index
            height: `${calculateDropdownHeight()}px`
          }}
        >
          <div className="overflow-y-auto custom-scrollbar h-full">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`w-full text-left px-3 py-3 text-sm font-body transition-all duration-75 flex items-center gap-3 border-b border-gray-700/50 last:border-b-0 focus:outline-none relative overflow-hidden ${
                  option.value === value ? 'border-l-4 border-l-blue-500' : ''
                }`}
                style={{
                  height: '48px',
                  ...(colorCoded && option.bgColor && option.color && {
                    background: hoveredIndex === index 
                      ? `linear-gradient(135deg, ${option.bgColor}ee, ${option.bgColor}cc)`
                      : `linear-gradient(135deg, ${option.bgColor}cc, ${option.bgColor}aa)`,
                    color: option.color,
                    fontWeight: option.value === value ? '600' : '500'
                  }),
                  ...(!colorCoded && {
                    backgroundColor: hoveredIndex === index ? '#374151' : 'transparent'
                  })
                }}
              >
                <div className="relative flex items-center gap-3 w-full">
                  {option.emoji && (
                    <span className="text-lg flex-shrink-0">
                      {option.emoji}
                    </span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <span className="text-blue-400 text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}