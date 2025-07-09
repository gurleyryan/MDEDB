export const getContinentOptions = () => [
  { value: 'all', label: 'All Continents', color: '#d1d5db', bgColor: '#374151' },
  { value: 'North America', label: 'North America', emoji: '🌎', color: '#60a5fa', bgColor: '#1e3a8a' },
  { value: 'South America', label: 'South America', emoji: '🌎', color: '#34d399', bgColor: '#065f46' },
  { value: 'Europe', label: 'Europe', emoji: '🌍', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'Africa', label: 'Africa', emoji: '🌍', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'Asia', label: 'Asia', emoji: '🌏', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'Oceania', label: 'Oceania', emoji: '🌏', color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'Middle East', label: 'Middle East', emoji: '🌍', color: '#d97706', bgColor: '#92400e' },
];

export const getScoreRangeOptions = () => [
  { value: 'all', label: 'All Scores', color: '#d1d5db', bgColor: '#374151' },
  { value: 'strong', label: 'Strong (21-26)', emoji: '🟢', color: '#10b981', bgColor: '#065f46' },
  { value: 'promising', label: 'Promising (13-20)', emoji: '🟡', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'low', label: 'Low Priority (0-12)', emoji: '🔴', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'unscored', label: 'Not Scored', emoji: '⚪', color: '#9ca3af', bgColor: '#4b5563' },
];

export const getWebsiteStatusOptions = () => [
  { value: 'all', label: 'All Organizations', color: '#d1d5db', bgColor: '#374151' },
  { value: 'yes', label: 'Has Website', emoji: '🌐', color: '#10b981', bgColor: '#065f46' },
  { value: 'no', label: 'No Website', emoji: '❌', color: '#ef4444', bgColor: '#991b1b' },
];

export const getSortFieldOptions = () => [
  { value: 'name', label: 'Name', emoji: '📝', color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'score', label: 'Score', emoji: '📊', color: '#10b981', bgColor: '#065f46' },
  { value: 'status', label: 'Status', emoji: '⚡', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'country', label: 'Country', emoji: '🌍', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'recent', label: 'Recently Added', emoji: '📅', color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'website', label: 'Has Website', emoji: '🌐', color: '#ef4444', bgColor: '#991b1b' },
];

export const getScoringOptions = () => [
  { value: '', label: 'N/A', color: '#9ca3af', bgColor: '#4b5563' },
  { value: '0', label: '0 - No', emoji: '❌', color: '#ef4444', bgColor: '#991b1b' },
  { value: '1', label: '1 - Unclear', emoji: '❓', color: '#f59e0b', bgColor: '#92400e' },
  { value: '2', label: '2 - Yes', emoji: '✅', color: '#10b981', bgColor: '#065f46' },
];

export const getCountryOptions = () => [
  { value: '', label: 'Select Country', color: '#9ca3af', bgColor: '#374151' },
  // North America
  { value: 'US', label: 'United States', emoji: '🇺🇸', color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'CA', label: 'Canada', emoji: '🇨🇦', color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'MX', label: 'Mexico', emoji: '🇲🇽', color: '#60a5fa', bgColor: '#1e40af' },

  // South America
  { value: 'BR', label: 'Brazil', emoji: '🇧🇷', color: '#34d399', bgColor: '#065f46' },
  { value: 'AR', label: 'Argentina', emoji: '🇦🇷', color: '#34d399', bgColor: '#065f46' },
  { value: 'CL', label: 'Chile', emoji: '🇨🇱', color: '#34d399', bgColor: '#065f46' },
  { value: 'CO', label: 'Colombia', emoji: '🇨🇴', color: '#34d399', bgColor: '#065f46' },

  // Europe
  { value: 'GB', label: 'United Kingdom', emoji: '🇬🇧', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'DE', label: 'Germany', emoji: '🇩🇪', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'FR', label: 'France', emoji: '🇫🇷', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'IT', label: 'Italy', emoji: '🇮🇹', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'ES', label: 'Spain', emoji: '🇪🇸', color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'NL', label: 'Netherlands', emoji: '🇳🇱', color: '#a78bfa', bgColor: '#5b21b6' },

  // Africa
  { value: 'NG', label: 'Nigeria', emoji: '🇳🇬', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'KE', label: 'Kenya', emoji: '🇰🇪', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'ZA', label: 'South Africa', emoji: '🇿🇦', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'GH', label: 'Ghana', emoji: '🇬🇭', color: '#f59e0b', bgColor: '#92400e' },

  // Asia
  { value: 'IN', label: 'India', emoji: '🇮🇳', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'CN', label: 'China', emoji: '🇨🇳', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'JP', label: 'Japan', emoji: '🇯🇵', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'KR', label: 'South Korea', emoji: '🇰🇷', color: '#ef4444', bgColor: '#991b1b' },
  { value: 'TH', label: 'Thailand', emoji: '🇹🇭', color: '#ef4444', bgColor: '#991b1b' },

  // Oceania
  { value: 'AU', label: 'Australia', emoji: '🇦🇺', color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'NZ', label: 'New Zealand', emoji: '🇳🇿', color: '#06b6d4', bgColor: '#0e7490' },

  // Middle East
  { value: 'AE', label: 'UAE', emoji: '🇦🇪', color: '#d97706', bgColor: '#92400e' },
  { value: 'SA', label: 'Saudi Arabia', emoji: '🇸🇦', color: '#d97706', bgColor: '#92400e' },
  { value: 'IL', label: 'Israel', emoji: '🇮🇱', color: '#d97706', bgColor: '#92400e' },
];

export const getStatusOptions = () => [
  { value: 'pending', label: 'Pending Review', emoji: '⏳', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'approved', label: 'Approved', emoji: '✅', color: '#10b981', bgColor: '#065f46' },
  { value: 'rejected', label: 'Rejected', emoji: '❌', color: '#ef4444', bgColor: '#991b1b' },
];