'use client';
import { useState, useEffect } from 'react';

type FontOption = 'option-a' | 'option-b' | 'option-c';

const fontOptions = {
  'option-a': {
    name: 'Modern & Clean',
    heading: 'font-poppins',
    body: 'font-inter',
    mono: 'font-jetbrains-mono',
    description: 'Poppins + Inter + JetBrains Mono'
  },
  'option-b': {
    name: 'Professional & Trustworthy',
    heading: 'font-plus-jakarta',
    body: 'font-source-sans',
    mono: 'font-fira-code',
    description: 'Plus Jakarta Sans + Source Sans 3 + Fira Code'
  },
  'option-c': {
    name: 'Creative & Distinctive',
    heading: 'font-outfit',
    body: 'font-ibm-plex',
    mono: 'font-space-mono',
    description: 'Outfit + IBM Plex Sans + Space Mono'
  }
};

export function FontSwitcher() {
  const [currentFont, setCurrentFont] = useState<FontOption>('option-c'); // Default to Option C
  const [applied, setApplied] = useState<FontOption>('option-c');
  
  const current = fontOptions[currentFont];

  // Apply font changes to the document
  const applyFont = (fontOption: FontOption) => {
    const fonts = fontOptions[fontOption];
    
    // Create or update a style element for font overrides
    let styleElement = document.getElementById('font-switcher-styles') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'font-switcher-styles';
      document.head.appendChild(styleElement);
    }

    // Apply the font classes using CSS
    styleElement.textContent = `
      /* Override heading fonts */
      h1, h2, h3, h4, h5, h6, .font-heading,
      .text-hero, .text-title, .text-heading {
        font-family: var(--font-${fonts.heading.replace('font-', '')}) !important;
      }
      
      /* Override body fonts */
      p, span, div, .font-body,
      .text-body, .text-body-large, .text-caption, .text-micro {
        font-family: var(--font-${fonts.body.replace('font-', '')}) !important;
      }
      
      /* Override mono fonts */
      code, pre, .font-mono {
        font-family: var(--font-${fonts.mono.replace('font-', '')}) !important;
      }
    `;
    
    setApplied(fontOption);
  };

  // Reset to default fonts
  const resetFonts = () => {
    const styleElement = document.getElementById('font-switcher-styles');
    if (styleElement) {
      styleElement.remove();
    }
    setApplied('option-a');
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-lg p-4 shadow-2xl min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">🎨 Font Preview</h3>
        <button
          onClick={resetFonts}
          className="text-xs text-gray-400 hover:text-white transition-colors"
          title="Reset to default"
        >
          Reset
        </button>
      </div>
      
      {/* Font Option Buttons */}
      <div className="flex flex-col gap-2 mb-4">
        {Object.entries(fontOptions).map(([key, option]) => (
          <button
            key={key}
            onClick={() => setCurrentFont(key as FontOption)}
            className={`text-left p-2 rounded text-xs transition-all ${
              currentFont === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="font-medium flex items-center justify-between">
              {option.name}
              {applied === key && (
                <span className="text-green-400 text-xs">✓ Applied</span>
              )}
            </div>
            <div className="text-xs opacity-80">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Live Preview */}
      <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-4">
        <h1 className={`text-xl font-bold mb-2 ${current.heading}`}>
          Climate Organizations
        </h1>
        <p className={`text-sm mb-2 ${current.body}`}>
          A sophisticated platform to catalog and assess grassroots climate organizations.
        </p>
        <code className={`text-xs text-green-400 ${current.mono}`}>
          Status: 42 approved • 18 pending
        </code>
      </div>

      {/* Apply Button */}
      <div className="flex gap-2">
        <button
          onClick={() => applyFont(currentFont)}
          disabled={applied === currentFont}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            applied === currentFont
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          {applied === currentFont ? 'Applied' : `Apply ${current.name}`}
        </button>
        
        {/* Quick preview toggle */}
        <button
          onClick={() => {
            if (applied === currentFont) {
              resetFonts();
            } else {
              applyFont(currentFont);
            }
          }}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
          title="Quick toggle"
        >
          {applied === currentFont ? '👁️' : '⚡'}
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Select a font option above, then click Apply to see changes
      </div>
    </div>
  );
}