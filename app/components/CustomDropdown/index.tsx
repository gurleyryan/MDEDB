'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ClimateIcons } from '../Icons';

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
  bgColor?: string;
  emoji?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  colorCoded?: boolean;
  portal?: boolean; // <-- add this
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  colorCoded = false,
  portal = true // default to true for backwards compatibility
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // For portal positioning
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number, width: number} | null>(null);

  const calculateDropdownHeight = () => {
    const optionHeight = 48;
    const maxVisibleOptions = 5;
    const borderHeight = 2;
    const visibleOptions = Math.min(options.length, maxVisibleOptions);
    return (visibleOptions * optionHeight) + borderHeight;
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Improved status dropdown detection
  const isStatusDropdown = className.includes('status-dropdown') ||
    (options.length === 3 &&
      options.some(opt => opt.value === 'pending') &&
      options.some(opt => opt.value === 'approved') &&
      options.some(opt => opt.value === 'rejected'));

  // Handle option selection - simplified and more direct
  const handleSelect = useCallback((option: DropdownOption) => {
    console.log('Selecting option:', option.value, 'Current value:', value); // Debug log

    // Close dropdown first
    setIsOpen(false);
    setHoveredIndex(null);

    // Call onChange with the new value
    onChange(option.value);
  }, [onChange, value]);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked, isStatusDropdown:', isStatusDropdown); // Debug log
    setIsOpen(prev => !prev);
  }, [isStatusDropdown]);

  const handleOptionClick = useCallback((e: React.MouseEvent, option: DropdownOption) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Option clicked:', option.value); // Debug log
    handleSelect(option);
  }, [handleSelect]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // For portal dropdown: check both dropdownRef and dropdownMenuRef
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target) &&
        (!dropdownMenuRef.current || !dropdownMenuRef.current.contains(target))
      ) {
        setIsOpen(false);
        setHoveredIndex(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setHoveredIndex(null);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && portal && buttonRef.current) {
      const updateDropdownPos = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom, // Use viewport position, not adding scrollY
          left: rect.left,
          width: rect.width,
        });
      };

      updateDropdownPos();
      
      // Use requestAnimationFrame for smoother updates during scroll/resize
      let rafId: number;
      const handleUpdate = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateDropdownPos);
      };
      
      // Listen to scroll and resize events
      window.addEventListener('scroll', handleUpdate, { passive: true, capture: true });
      window.addEventListener('resize', handleUpdate, { passive: true });
      
      // Also listen for any parent scroll containers
      const scrollableParents: Element[] = [];
      let parent = buttonRef.current?.parentElement;
      while (parent && parent !== document.body) {
        const overflow = window.getComputedStyle(parent).overflow;
        if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') {
          scrollableParents.push(parent);
          parent.addEventListener('scroll', handleUpdate, { passive: true });
        }
        parent = parent.parentElement;
      }

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
        scrollableParents.forEach(parent => {
          parent.removeEventListener('scroll', handleUpdate);
        });
      };
    }
  }, [isOpen, portal]);

  const renderDropdownOptions = () => (
    <div className="overflow-y-auto custom-scrollbar h-full">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={(e) => handleOptionClick(e, option)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`w-full text-left px-3 py-3 text-sm font-mde transition-all duration-75 flex items-center gap-3 border-b border-gray-700/50 last:border-b-0 focus:outline-none relative overflow-hidden ${option.value === value ? 'border-l-4 border-l-blue-500' : ''
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
            {option.icon ? (
              <span className="flex-shrink-0 opacity-80">
                {option.icon}
              </span>
            ) : option.emoji ? (
              <span className="text-lg flex-shrink-0">
                {option.emoji}
              </span>
            ) : null}
            <span className="flex-1">{option.label}</span>
            {option.value === value && (
              <span className="text-blue-400 text-xs">
                {ClimateIcons.approved}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const dropdownMenu = (
    <div
      ref={dropdownMenuRef}
      className="dropdown-glass rounded-lg overflow-hidden"
      style={
        portal && dropdownPos
          ? {
              position: 'fixed', // Use fixed instead of absolute for better scroll performance
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999, // High z-index for portal mode
              height: `${calculateDropdownHeight()}px`,
            }
          : {
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 200, // Higher than sticky header z-[120]
              height: `${calculateDropdownHeight()}px`,
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {renderDropdownOptions()}
    </div>
  );

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      style={{
        position: 'relative',
        zIndex: isOpen ? 40 : 'auto', // Moderate z-index for portal mode
        isolation: 'auto'
      }}
    >
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className={`btn-glass cursor-pointer w-full px-3 py-2 text-white text-sm font-mde focus:outline-none transition-all duration-200 flex items-center justify-between ${isOpen ? 'ring-1 ring-blue-500/50' : ''}`}
        style={{
          position: 'relative',
          zIndex: isOpen ? 41 : 'auto', /* keep button above menu for focus outline */
          ...(colorCoded && selectedOption?.color && {
            color: selectedOption.color,
            borderColor: selectedOption.color + '50'
          })
        }}
      >
        <span className="flex items-center gap-2">
          {/* Show icon or emoji for selected option */}
          {selectedOption?.icon ? (
            <span className="flex-shrink-0">
              {selectedOption.icon}
            </span>
          ) : selectedOption?.emoji ? (
            <span className="flex-shrink-0">{selectedOption.emoji}</span>
          ) : null}
          <span>{selectedOption?.label || placeholder}</span>
        </span>

        <span
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Options */}
      {isOpen && portal && dropdownPos
        ? createPortal(dropdownMenu, document.body)
        : isOpen && dropdownMenu}
    </div>
  );
}