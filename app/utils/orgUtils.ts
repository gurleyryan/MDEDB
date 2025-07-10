import { ClimateIcons } from '../components/Icons';

// Helper function to get continent from country code
const getContinent = (countryCode: string): string => {
  const continentMap: Record<string, string> = {
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America',
    'DE': 'Europe', 'FR': 'Europe', 'UK': 'Europe', 'GB': 'Europe', 'IT': 'Europe', 'ES': 'Europe',
    'NL': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe', 'PT': 'Europe',
    'CH': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'IE': 'Europe',
    'AU': 'Oceania', 'NZ': 'Oceania',
    'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'KR': 'Asia', 'TH': 'Asia', 'VN': 'Asia', 'MY': 'Asia', 'SG': 'Asia', 'ID': 'Asia', 'PH': 'Asia', 'BD': 'Asia', 'PK': 'Asia', 'LK': 'Asia',
    'NG': 'Africa', 'ZA': 'Africa', 'KE': 'Africa', 'GH': 'Africa', 'EG': 'Africa', 'MA': 'Africa', 'TN': 'Africa',
    'AE': 'Middle East', 'SA': 'Middle East', 'IL': 'Middle East', 'TR': 'Middle East', 'JO': 'Middle East', 'LB': 'Middle East', 'IQ': 'Middle East', 'IR': 'Middle East',
  };
  return continentMap[countryCode] || 'North America';
};

// Function to get regional theme based on country code
export const getRegionalTheme = (countryCode: string): string => {
  const continent = getContinent(countryCode);
  
  switch (continent) {
    case 'North America': return 'north-america';
    case 'South America': return 'south-america';
    case 'Europe': return 'europe';
    case 'Africa': return 'africa';
    case 'Asia': return 'asia';
    case 'Oceania': return 'oceania';
    case 'Middle East': return 'middle-east';
    default: return 'north-america'; // Default fallback
  }
};

// Function to get alignment score color for display
export const getAlignmentScoreColor = (score?: number | null) => {
  if (score === undefined || score === null) return 'text-gray-200 bg-gray-700';
  if (score >= 21) return 'text-green-200 bg-green-800';
  if (score >= 13) return 'text-orange-200 bg-orange-800';
  return 'text-red-200 bg-red-800';
};

// Function to get status color for approval status
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'text-green-200 bg-green-800';
    case 'rejected': return 'text-red-200 bg-red-800';
    case 'pending': return 'text-yellow-200 bg-yellow-800';
    default: return 'text-gray-200 bg-gray-800';
  }
};

// Utility to validate URL and create proper link
export const createValidUrl = (website: string): { isValid: boolean; url: string; hostname: string } => {
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return {
      isValid: true,
      url: url.href,
      hostname: url.hostname
    };
  } catch {
    return {
      isValid: false,
      url: website,
      hostname: website.replace(/^https?:\/\//, '').split('/')[0]
    };
  }
};

// Utility to process and validate emails
export const processEmails = (emailString: string): string[] => {
  if (!emailString) return [];
  
  return emailString
    .split(/[\s,\n\r]+/) // Split on whitespace, commas, and line breaks
    .map(email => email.trim())
    .filter(email => email && email.includes('@')); // Only keep valid-looking emails
};

// Utility to get Google favicon URL with fallback
export const getGoogleFaviconUrl = (website: string, size: number = 64): string => {
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
  } catch {
    const domain = website.replace(/^https?:\/\//, '').split('/')[0];
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }
};

// Utility to check if an image/favicon is a placeholder
export const isPlaceholderUrl = (url?: string): boolean => {
  if (!url) return true;
  return url.includes('placeholder') || url.includes('via.placeholder.com');
};

// Utility to get score recommendation
export const getScoreRecommendation = (score?: number | null): { 
  text: string; 
  color: string; 
  icon: React.ReactNode; 
  category: string 
} => {
  if (score === undefined || score === null) {
    return {
      text: 'Not Scored',
      color: 'text-gray-200 bg-gray-700',
      icon: ClimateIcons.unscored,
      category: 'unscored'
    };
  }

  if (score >= 21) {
    return {
      text: 'Strong Candidate',
      color: 'text-green-200 bg-green-800',
      icon: ClimateIcons.strong,
      category: 'strong'
    };
  } else if (score >= 13) {
    return {
      text: 'Promising, Needs Follow-Up',
      color: 'text-orange-200 bg-orange-800',
      icon: ClimateIcons.promising,
      category: 'promising'
    };
  } else {
    return {
      text: 'Low Priority / Not Suitable',
      color: 'text-red-200 bg-red-800',
      icon: ClimateIcons.low,
      category: 'low'
    };
  }
};

// Utility to format years active display
export const formatYearsActive = (yearsActive?: string): string => {
  if (!yearsActive) return '';
  
  // If it's already formatted (contains dash or "present"), return as-is
  if (yearsActive.includes('–') || yearsActive.includes('-') || yearsActive.toLowerCase().includes('present')) {
    return yearsActive;
  }
  
  // If it's just a number, assume it's years of operation
  const num = parseInt(yearsActive);
  if (!isNaN(num)) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - num;
    return `${startYear}–present`;
  }
  
  return yearsActive;
};

// Utility to create placeholder image URL
export const createPlaceholderImage = (text: string, width: number = 1200, height: number = 630): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}/059669/ffffff?text=${encodedText}`;
};

// Utility to truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Utility to get readable region name
export const getRegionName = (countryCode: string): string => {
  const regions: Record<string, string> = {
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America',
    'DE': 'Europe', 'FR': 'Europe', 'UK': 'Europe', 'GB': 'Europe', 'IT': 'Europe', 'ES': 'Europe',
    'AU': 'Oceania', 'NZ': 'Oceania',
    'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'KR': 'Asia', 'TH': 'Asia', 'VN': 'Asia',
    'NG': 'Africa', 'ZA': 'Africa', 'KE': 'Africa', 'GH': 'Africa', 'EG': 'Africa', 'MA': 'Africa',
    'AE': 'Middle East', 'SA': 'Middle East', 'IL': 'Middle East', 'TR': 'Middle East',
  };
  
  return regions[countryCode] || 'Unknown Region';
};

// Utility to sort organizations by various criteria
type Org = {
  org_name: string;
  alignment_score?: number | null;
  approval_status?: string;
  country_code?: string;
  created_at?: string | number | Date;
  [key: string]: unknown;
};

export const sortOrganizations = (
  orgs: Org[], 
  sortBy: 'name' | 'score' | 'status' | 'country' | 'recent',
  direction: 'asc' | 'desc' = 'asc'
) => {
  const sorted = [...orgs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.org_name.localeCompare(b.org_name);
        break;
      case 'score': {
        const scoreA = a.alignment_score ?? -1;
        const scoreB = b.alignment_score ?? -1;
        comparison = scoreA - scoreB;
        break;
      }
      case 'status': {
        const statusOrder = { approved: 3, pending: 2, rejected: 1 };
        comparison = (statusOrder[a.approval_status as keyof typeof statusOrder] || 0) - 
                    (statusOrder[b.approval_status as keyof typeof statusOrder] || 0);
        break;
      }
      case 'country':
        comparison = (a.country_code ?? '').localeCompare(b.country_code ?? '');
        break;
      case 'recent':
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};