// Function to get regional theme based on country code
export const getRegionalTheme = (countryCode: string) => {
  const regions = {
    // Africa - warm earth tones
    'NG': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'KE': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'ZA': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'GH': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'EG': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'MA': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    'TN': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
    
    // Europe - cool greens
    'DE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'FR': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'UK': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'GB': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'NL': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'SE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'NO': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'DK': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'FI': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'IT': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'ES': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'PT': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'CH': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'AT': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'BE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    'IE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
    
    // Americas - blues and greens
    'US': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    'CA': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    'BR': 'from-green-600/20 via-yellow-500/10 to-blue-500/20',
    'MX': 'from-green-500/20 via-red-500/10 to-yellow-500/20',
    'AR': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    'CL': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    'CO': 'from-yellow-500/20 via-blue-500/10 to-red-500/20',
    'PE': 'from-red-500/20 via-white/10 to-red-500/20',
    'EC': 'from-yellow-500/20 via-blue-500/10 to-red-500/20',
    'UY': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    'CR': 'from-green-500/20 via-blue-500/10 to-red-500/20',
    'GT': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
    
    // Asia Pacific - ocean blues and cultural colors
    'AU': 'from-blue-600/20 via-teal-500/10 to-cyan-500/20',
    'NZ': 'from-blue-600/20 via-teal-500/10 to-cyan-500/20',
    'JP': 'from-blue-500/20 via-purple-500/10 to-pink-500/20',
    'IN': 'from-orange-500/20 via-green-500/10 to-blue-500/20',
    'CN': 'from-red-500/20 via-yellow-500/10 to-green-500/20',
    'KR': 'from-blue-500/20 via-red-500/10 to-white/20',
    'TH': 'from-red-500/20 via-blue-500/10 to-red-500/20',
    'VN': 'from-red-500/20 via-yellow-500/10 to-red-500/20',
    'MY': 'from-red-500/20 via-blue-500/10 to-yellow-500/20',
    'SG': 'from-red-500/20 via-white/10 to-blue-500/20',
    'ID': 'from-red-500/20 via-white/10 to-red-500/20',
    'PH': 'from-blue-500/20 via-red-500/10 to-yellow-500/20',
    'BD': 'from-green-500/20 via-red-500/10 to-green-500/20',
    'PK': 'from-green-500/20 via-white/10 to-green-500/20',
    'LK': 'from-orange-500/20 via-red-500/10 to-green-500/20',
    
    // Middle East - warm desert tones
    'AE': 'from-red-500/20 via-green-500/10 to-black/20',
    'SA': 'from-green-500/20 via-white/10 to-green-500/20',
    'IL': 'from-blue-500/20 via-white/10 to-blue-500/20',
    'TR': 'from-red-500/20 via-white/10 to-red-500/20',
    'JO': 'from-red-500/20 via-white/10 to-green-500/20',
    'LB': 'from-red-500/20 via-white/10 to-red-500/20',
    'IQ': 'from-red-500/20 via-white/10 to-black/20',
    'IR': 'from-green-500/20 via-white/10 to-red-500/20',
    
    // Default for unknown countries
    'default': 'from-emerald-500/20 via-green-500/10 to-teal-500/20'
  };
  
  return regions[countryCode as keyof typeof regions] || regions.default;
};

// Function to get accent color based on region
export const getAccentColor = (countryCode: string) => {
  const colors = {
    // Africa - warm oranges
    'NG': 'border-orange-500/30 hover:border-orange-400',
    'KE': 'border-orange-500/30 hover:border-orange-400',
    'ZA': 'border-orange-500/30 hover:border-orange-400',
    'GH': 'border-orange-500/30 hover:border-orange-400',
    'EG': 'border-orange-500/30 hover:border-orange-400',
    'MA': 'border-orange-500/30 hover:border-orange-400',
    'TN': 'border-orange-500/30 hover:border-orange-400',
    
    // Europe - cool greens
    'DE': 'border-green-500/30 hover:border-green-400',
    'FR': 'border-green-500/30 hover:border-green-400',
    'UK': 'border-green-500/30 hover:border-green-400',
    'GB': 'border-green-500/30 hover:border-green-400',
    'NL': 'border-green-500/30 hover:border-green-400',
    'SE': 'border-green-500/30 hover:border-green-400',
    'NO': 'border-green-500/30 hover:border-green-400',
    'DK': 'border-green-500/30 hover:border-green-400',
    'FI': 'border-green-500/30 hover:border-green-400',
    'IT': 'border-green-500/30 hover:border-green-400',
    'ES': 'border-green-500/30 hover:border-green-400',
    'PT': 'border-green-500/30 hover:border-green-400',
    'CH': 'border-green-500/30 hover:border-green-400',
    'AT': 'border-green-500/30 hover:border-green-400',
    'BE': 'border-green-500/30 hover:border-green-400',
    'IE': 'border-green-500/30 hover:border-green-400',
    
    // Americas - blues
    'US': 'border-blue-500/30 hover:border-blue-400',
    'CA': 'border-blue-500/30 hover:border-blue-400',
    'BR': 'border-green-600/30 hover:border-green-500',
    'MX': 'border-green-500/30 hover:border-green-400',
    'AR': 'border-blue-500/30 hover:border-blue-400',
    'CL': 'border-blue-500/30 hover:border-blue-400',
    'CO': 'border-yellow-500/30 hover:border-yellow-400',
    'PE': 'border-red-500/30 hover:border-red-400',
    'EC': 'border-yellow-500/30 hover:border-yellow-400',
    'UY': 'border-blue-500/30 hover:border-blue-400',
    'CR': 'border-green-500/30 hover:border-green-400',
    'GT': 'border-blue-500/30 hover:border-blue-400',
    
    // Asia Pacific - ocean blues
    'AU': 'border-blue-600/30 hover:border-blue-500',
    'NZ': 'border-blue-600/30 hover:border-blue-500',
    'JP': 'border-purple-500/30 hover:border-purple-400',
    'IN': 'border-orange-500/30 hover:border-orange-400',
    'CN': 'border-red-500/30 hover:border-red-400',
    'KR': 'border-blue-500/30 hover:border-blue-400',
    'TH': 'border-red-500/30 hover:border-red-400',
    'VN': 'border-red-500/30 hover:border-red-400',
    'MY': 'border-red-500/30 hover:border-red-400',
    'SG': 'border-red-500/30 hover:border-red-400',
    'ID': 'border-red-500/30 hover:border-red-400',
    'PH': 'border-blue-500/30 hover:border-blue-400',
    'BD': 'border-green-500/30 hover:border-green-400',
    'PK': 'border-green-500/30 hover:border-green-400',
    'LK': 'border-orange-500/30 hover:border-orange-400',
    
    // Middle East - warm tones
    'AE': 'border-red-500/30 hover:border-red-400',
    'SA': 'border-green-500/30 hover:border-green-400',
    'IL': 'border-blue-500/30 hover:border-blue-400',
    'TR': 'border-red-500/30 hover:border-red-400',
    'JO': 'border-red-500/30 hover:border-red-400',
    'LB': 'border-red-500/30 hover:border-red-400',
    'IQ': 'border-red-500/30 hover:border-red-400',
    'IR': 'border-green-500/30 hover:border-green-400',
    
    // Default
    'default': 'border-emerald-500/30 hover:border-emerald-400'
  };
  
  return colors[countryCode as keyof typeof colors] || colors.default;
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
export const getScoreRecommendation = (score: number | null): { 
  text: string; 
  color: string; 
  emoji: string; 
  category: 'strong' | 'promising' | 'low' | 'none';
} => {
  if (score === null || score === 0) {
    return {
      text: 'Not Scored',
      color: 'text-gray-300',
      emoji: '⚪',
      category: 'none'
    };
  }
  
  if (score >= 21) {
    return {
      text: 'Strong Candidate',
      color: 'text-green-300',
      emoji: '🟢',
      category: 'strong'
    };
  } else if (score >= 13) {
    return {
      text: 'Promising, Needs Follow-Up',
      color: 'text-orange-300',
      emoji: '🟡',
      category: 'promising'
    };
  } else {
    return {
      text: 'Low Priority / Not Suitable',
      color: 'text-red-300',
      emoji: '🔴',
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

// Utility to get country flag emoji (basic implementation)
export const getCountryFlag = (countryCode: string): string => {
  const flagMap: Record<string, string> = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'UK': '🇬🇧', 'GB': '🇬🇧', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'AU': '🇦🇺', 'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'KR': '🇰🇷', 'TH': '🇹🇭',
    'NG': '🇳🇬', 'ZA': '🇿🇦', 'KE': '🇰🇪', 'GH': '🇬🇭', 'EG': '🇪🇬', 'MA': '🇲🇦',
    // Add more as needed
  };
  
  return flagMap[countryCode] || '🌍';
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
export const sortOrganizations = (
  orgs: any[], 
  sortBy: 'name' | 'score' | 'status' | 'country' | 'recent',
  direction: 'asc' | 'desc' = 'asc'
) => {
  const sorted = [...orgs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.org_name.localeCompare(b.org_name);
        break;
      case 'score':
        const scoreA = a.alignment_score ?? -1;
        const scoreB = b.alignment_score ?? -1;
        comparison = scoreA - scoreB;
        break;
      case 'status':
        const statusOrder = { approved: 3, pending: 2, rejected: 1 };
        comparison = (statusOrder[a.approval_status as keyof typeof statusOrder] || 0) - 
                    (statusOrder[b.approval_status as keyof typeof statusOrder] || 0);
        break;
      case 'country':
        comparison = a.country_code.localeCompare(b.country_code);
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