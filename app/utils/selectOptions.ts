import { ClimateIcons } from '../components/Icons';

export const getContinentOptions = () => [
  { value: 'all', label: 'All Continents', icon: ClimateIcons.climate, color: '#d1d5db', bgColor: '#374151' },
  { value: 'North America', label: 'North America', icon: ClimateIcons.northAmerica, color: '#60a5fa', bgColor: '#1e3a8a' },
  { value: 'South America', label: 'South America', icon: ClimateIcons.southAmerica, color: '#34d399', bgColor: '#065f46' },
  { value: 'Europe', label: 'Europe', icon: ClimateIcons.europe, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'Africa', label: 'Africa', icon: ClimateIcons.africa, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'Asia', label: 'Asia', icon: ClimateIcons.asia, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'Oceania', label: 'Oceania', icon: ClimateIcons.oceania, color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'Middle East', label: 'Middle East', icon: ClimateIcons.middleEast, color: '#d97706', bgColor: '#92400e' },
];

export const getScoreRangeOptions = () => [
  { value: 'all', label: 'All Scores', color: '#d1d5db', bgColor: '#374151' },
  { value: 'strong', label: 'Strong (21-26)', icon: ClimateIcons.strong, color: '#10b981', bgColor: '#065f46' },
  { value: 'promising', label: 'Promising (13-20)', icon: ClimateIcons.promising, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'low', label: 'Low Priority (0-12)', icon: ClimateIcons.low, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'unscored', label: 'Not Scored', icon: ClimateIcons.unscored, color: '#9ca3af', bgColor: '#4b5563' },
];

export const getSortFieldOptions = () => [
  { value: 'name', label: 'Name', icon: ClimateIcons.name, color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'score', label: 'Score', icon: ClimateIcons.scoring, color: '#10b981', bgColor: '#065f46' },
  { value: 'status', label: 'Status', icon: ClimateIcons.status, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'country', label: 'Country', icon: ClimateIcons.country, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'recent', label: 'Recently Added', icon: ClimateIcons.recent, color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'website', label: 'Has Website', icon: ClimateIcons.website, color: '#ef4444', bgColor: '#991b1b' },
];

export const getScoringOptions = () => [
  { value: '', label: 'N/A', color: '#9ca3af', bgColor: '#4b5563' },
  { value: '0', label: '0 - No', icon: ClimateIcons.no, color: '#ef4444', bgColor: '#991b1b' },
  { value: '1', label: '1 - Unclear', icon: ClimateIcons.unclear, color: '#f59e0b', bgColor: '#92400e' },
  { value: '2', label: '2 - Yes', icon: ClimateIcons.yes, color: '#10b981', bgColor: '#065f46' },
];

export const getCountryOptions = () => [
  { value: '', label: 'Select Country', color: '#9ca3af', bgColor: '#374151' },
  // North America
  { value: 'US', label: 'United States', icon: ClimateIcons.unitedStates, color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'CA', label: 'Canada', icon: ClimateIcons.canada, color: '#60a5fa', bgColor: '#1e40af' },
  { value: 'MX', label: 'Mexico', icon: ClimateIcons.mexico, color: '#60a5fa', bgColor: '#1e40af' },

  // South America
  { value: 'BR', label: 'Brazil', icon: ClimateIcons.brazil, color: '#34d399', bgColor: '#065f46' },
  { value: 'AR', label: 'Argentina', icon: ClimateIcons.argentina, color: '#34d399', bgColor: '#065f46' },
  { value: 'CL', label: 'Chile', icon: ClimateIcons.chile, color: '#34d399', bgColor: '#065f46' },
  { value: 'CO', label: 'Colombia', icon: ClimateIcons.colombia, color: '#34d399', bgColor: '#065f46' },

  // Europe
  { value: 'GB', label: 'United Kingdom', icon: ClimateIcons.unitedKingdom, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'DE', label: 'Germany', icon: ClimateIcons.germany, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'FR', label: 'France', icon: ClimateIcons.france, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'IT', label: 'Italy', icon: ClimateIcons.italy, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'ES', label: 'Spain', icon: ClimateIcons.spain, color: '#a78bfa', bgColor: '#5b21b6' },
  { value: 'NL', label: 'Netherlands', icon: ClimateIcons.netherlands, color: '#a78bfa', bgColor: '#5b21b6' },

  // Africa
  { value: 'NG', label: 'Nigeria', icon: ClimateIcons.nigeria, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'KE', label: 'Kenya', icon: ClimateIcons.kenya, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'ZA', label: 'South Africa', icon: ClimateIcons.southAfrica, color: '#f59e0b', bgColor: '#92400e' },
  { value: 'GH', label: 'Ghana', icon: ClimateIcons.ghana, color: '#f59e0b', bgColor: '#92400e' },

  // Asia
  { value: 'IN', label: 'India', icon: ClimateIcons.india, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'CN', label: 'China', icon: ClimateIcons.china, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'JP', label: 'Japan', icon: ClimateIcons.japan, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'KR', label: 'South Korea', icon: ClimateIcons.southKorea, color: '#ef4444', bgColor: '#991b1b' },
  { value: 'TH', label: 'Thailand', icon: ClimateIcons.thailand, color: '#ef4444', bgColor: '#991b1b' },

  // Oceania
  { value: 'AU', label: 'Australia', icon: ClimateIcons.australia, color: '#06b6d4', bgColor: '#0e7490' },
  { value: 'NZ', label: 'New Zealand', icon: ClimateIcons.newZealand, color: '#06b6d4', bgColor: '#0e7490' },

  // Middle East
  { value: 'AE', label: 'UAE', icon: ClimateIcons.uae, color: '#d97706', bgColor: '#92400e' },
  { value: 'SA', label: 'Saudi Arabia', icon: ClimateIcons.saudiArabia, color: '#d97706', bgColor: '#92400e' },
  { value: 'IL', label: 'Israel', icon: ClimateIcons.israel, color: '#d97706', bgColor: '#92400e' },
];

export const getStatusOptions = () => [
  { 
    value: 'pending', 
    label: 'Pending Review', 
    icon: ClimateIcons.pending,
    color: '#f59e0b', 
    bgColor: '#92400e' 
  },
  { 
    value: 'approved', 
    label: 'Approved', 
    icon: ClimateIcons.approved,
    color: '#10b981', 
    bgColor: '#065f46' 
  },
  { 
    value: 'rejected', 
    label: 'Rejected', 
    icon: ClimateIcons.rejected,
    color: '#ef4444', 
    bgColor: '#991b1b' 
  },
];