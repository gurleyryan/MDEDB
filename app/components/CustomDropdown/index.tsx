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
  flatColorInDarkMode?: boolean;
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;

  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  colorCoded = false,
  portal = true, // default to true for backwards compatibility
  flatColorInDarkMode = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
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

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setIsDarkTheme(root.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const getColorCodedStyles = (option: DropdownOption, state: 'button' | 'default' | 'hovered' | 'selected') => {
    if (!option.bgColor || !option.color) return {};

    if (isDarkTheme && flatColorInDarkMode && option.value === 'all') {
      return {
        backgroundColor: '#000000',
        color: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.16)',
      };
    }

    const alphaByState = {
      button: [0.08, 0.14],
      default: [0.1, 0.16],
      hovered: [0.14, 0.22],
      selected: [0.16, 0.26],
    } as const;

    const [fromAlpha, toAlpha] = alphaByState[state];

    const resolvedTextColor = isDarkTheme && (option.color.toLowerCase() === '#000000' || option.color.toLowerCase() === 'black')
      ? '#ffffff'
      : option.color;

    const flatDarkSurface = isDarkTheme && flatColorInDarkMode;

    return {
      ...(flatDarkSurface
        ? {
            backgroundColor: hexToRgba(option.bgColor, state === 'button' ? 0.16 : state === 'selected' ? 0.22 : state === 'hovered' ? 0.18 : 0.14),
          }
        : {
            background: `linear-gradient(135deg, ${hexToRgba(option.bgColor, fromAlpha)}, ${hexToRgba(option.bgColor, toAlpha)})`,
          }),
      color: resolvedTextColor,
      borderColor: hexToRgba(resolvedTextColor.startsWith('#') ? resolvedTextColor : option.color, state === 'button' ? 0.28 : 0.2),
    };
  };

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

  useEffect(() => {
    if (portal || !buttonRef.current) return;

    const elevatedElements = [
      buttonRef.current.closest('.scoring-criterion-card') as HTMLElement | null,
      buttonRef.current.closest('.will-change-auto') as HTMLElement | null,
      buttonRef.current.closest('.scoring-section') as HTMLElement | null,
      buttonRef.current.closest('.organization-card') as HTMLElement | null,
    ].filter((element, index, array): element is HTMLElement => !!element && array.indexOf(element) === index);

    const previousValues = elevatedElements.map((element) => ({
      element,
      zIndex: element.style.zIndex,
      position: element.style.position,
    }));

    if (isOpen) {
      elevatedElements.forEach((element) => {
        if (!element.style.position) {
          element.style.position = 'relative';
        }
        element.style.zIndex = '110';
      });
    }

    return () => {
      previousValues.forEach(({ element, zIndex, position }) => {
        element.style.zIndex = zIndex;
        element.style.position = position;
      });
    };
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
          className={`w-full text-left px-3 py-3 text-sm font-mde transition-colors duration-75 flex items-center gap-3 last:border-b-0 focus:outline-none relative overflow-hidden ${option.value === value ? 'border-l-4' : ''
            }`}
          style={{
            height: '48px',
            opacity: 1,
            borderBottomColor: 'var(--glass-border)',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            ...(option.value === value && {
              borderLeftColor: option.color || 'var(--foreground)',
            }),
            ...(colorCoded && option.bgColor && option.color && {
              ...getColorCodedStyles(
                option,
                option.value === value ? 'selected' : hoveredIndex === index ? 'hovered' : 'default'
              ),
              fontWeight: option.value === value ? '600' : '500'
            }),
            ...(!colorCoded && {
              backgroundColor: hoveredIndex === index
                ? 'color-mix(in srgb, var(--background) 86%, var(--foreground) 14%)'
                : 'var(--background)',
              color: 'var(--foreground)'
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
      className="dropdown-glass overflow-hidden"
      style={
        portal && dropdownPos
          ? {
              position: 'fixed', // Use fixed instead of absolute for better scroll performance
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999, // High z-index for portal mode
              height: `${calculateDropdownHeight()}px`,
              backgroundColor: 'var(--background)',
              borderColor: 'var(--glass-border)',
              color: 'var(--foreground)',
            }
          : {
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              height: `${calculateDropdownHeight()}px`,
              backgroundColor: 'var(--background)',
              borderColor: 'var(--glass-border)',
              color: 'var(--foreground)',
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
        zIndex: isOpen ? (portal ? 40 : 45) : 'auto',
        isolation: 'auto'
      }}
    >
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className={`btn-glass cursor-pointer w-full px-3 py-2 text-sm font-mde focus:outline-none transition-all duration-200 flex items-center justify-between ${isOpen ? 'ring-1 ring-black/10 dark:ring-white/15' : ''}`}
        style={{
          position: 'relative',
          zIndex: isOpen ? (portal ? 41 : 46) : 'auto',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          borderColor: 'var(--glass-border)',
          ...(colorCoded && selectedOption?.color && {
            ...getColorCodedStyles(selectedOption, 'button')
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