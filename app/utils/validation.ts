// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex (basic)
const URL_REGEX = /^https?:\/\/.+\..+/;

// Country code validation (ISO 3166-1 alpha-2)
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Field validation result
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

// Organization field validation
export const validateOrgName = (name: string): FieldValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Organization name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Organization name must be at least 2 characters' };
  }
  
  if (name.length > 200) {
    return { isValid: false, error: 'Organization name must be less than 200 characters' };
  }
  
  return { isValid: true };
};

// Email validation - supports multiple emails
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: true }; // Email is optional
  }
  
  // Split emails by common separators
  const emails = email
    .split(/[\s,\n\r;]+/)
    .map(e => e.trim())
    .filter(e => e.length > 0);
  
  const invalidEmails = emails.filter(e => !EMAIL_REGEX.test(e));
  
  if (invalidEmails.length > 0) {
    return {
      isValid: false,
      error: `Invalid email format: ${invalidEmails.join(', ')}`
    };
  }
  
  if (emails.length > 5) {
    return {
      isValid: true,
      warning: 'Consider limiting to 5 or fewer email addresses'
    };
  }
  
  return { isValid: true };
};

// Website URL validation
export const validateWebsite = (website: string): FieldValidationResult => {
  if (!website || website.trim().length === 0) {
    return { isValid: true }; // Website is optional
  }
  
  const trimmedUrl = website.trim();
  
  // Check if URL starts with protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    // Try to create valid URL by adding https://
    const withProtocol = `https://${trimmedUrl}`;
    try {
      new URL(withProtocol);
      return {
        isValid: true,
        warning: 'URL will be automatically prefixed with https://'
      };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
  
  try {
    const url = new URL(trimmedUrl);
    
    // Check for valid domain
    if (!url.hostname.includes('.')) {
      return { isValid: false, error: 'URL must include a valid domain' };
    }
    
    // Check for suspicious protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { isValid: false, error: 'URL must use http or https protocol' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Country code validation
export const validateCountryCode = (countryCode: string): FieldValidationResult => {
  if (!countryCode || countryCode.trim().length === 0) {
    return { isValid: false, error: 'Country code is required' };
  }
  
  const code = countryCode.trim().toUpperCase();
  
  if (!COUNTRY_CODE_REGEX.test(code)) {
    return { isValid: false, error: 'Country code must be 2 letters (e.g., US, CA, UK)' };
  }
  
  // List of common valid country codes for additional validation
  const validCodes = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];
  
  if (!validCodes.includes(code)) {
    return {
      isValid: true,
      warning: `Country code "${code}" may not be valid. Please verify it's correct.`
    };
  }
  
  return { isValid: true };
};

// Type of work validation
export const validateTypeOfWork = (typeOfWork: string): FieldValidationResult => {
  if (!typeOfWork || typeOfWork.trim().length === 0) {
    return { isValid: true }; // Type of work is optional
  }
  
  if (typeOfWork.length > 100) {
    return { isValid: false, error: 'Type of work must be less than 100 characters' };
  }
  
  return { isValid: true };
};

// Mission statement validation
export const validateMissionStatement = (mission: string): FieldValidationResult => {
  if (!mission || mission.trim().length === 0) {
    return { isValid: true }; // Mission statement is optional
  }
  
  if (mission.length > 1000) {
    return { isValid: false, error: 'Mission statement must be less than 1000 characters' };
  }
  
  if (mission.length < 20) {
    return {
      isValid: true,
      warning: 'Mission statement is quite short. Consider adding more detail.'
    };
  }
  
  return { isValid: true };
};

// Notable success validation
export const validateNotableSuccess = (success: string): FieldValidationResult => {
  if (!success || success.trim().length === 0) {
    return { isValid: true }; // Notable success is optional
  }
  
  if (success.length > 1000) {
    return { isValid: false, error: 'Notable success must be less than 1000 characters' };
  }
  
  return { isValid: true };
};

// CTA notes validation
export const validateCtaNotes = (notes: string): FieldValidationResult => {
  if (!notes || notes.trim().length === 0) {
    return { isValid: true }; // CTA notes are optional
  }
  
  if (notes.length > 500) {
    return { isValid: false, error: 'CTA notes must be less than 500 characters' };
  }
  
  return { isValid: true };
};

// Years active validation
export const validateYearsActive = (years: string): FieldValidationResult => {
  if (!years || years.trim().length === 0) {
    return { isValid: true }; // Years active is optional
  }
  
  const trimmedYears = years.trim();
  
  // Check for common formats
  const formats = [
    /^\d{4}–present$/i,           // 2020–present
    /^\d{4}-present$/i,           // 2020-present
    /^\d{4}–\d{4}$/,              // 2020–2023
    /^\d{4}-\d{4}$/,              // 2020-2023
    /^\d+\s*(years?|yrs?)$/i,     // 5 years, 10 yrs
    /^since\s+\d{4}$/i,           // since 2020
    /^\d{4}\s*-\s*\d{4}$/,        // 2020 - 2023
    /^\d{4}$/                     // 2020 (single year)
  ];
  
  const isValidFormat = formats.some(format => format.test(trimmedYears));
  
  if (!isValidFormat) {
    return {
      isValid: true,
      warning: 'Consider using format like "2020–present", "2018–2023", or "5 years"'
    };
  }
  
  // Check for future dates
  const currentYear = new Date().getFullYear();
  const yearMatches = trimmedYears.match(/\d{4}/g);
  
  if (yearMatches) {
    const years = yearMatches.map(y => parseInt(y));
    const futureYears = years.filter(y => y > currentYear + 1);
    
    if (futureYears.length > 0) {
      return {
        isValid: true,
        warning: `Year ${futureYears[0]} appears to be in the future`
      };
    }
  }
  
  return { isValid: true };
};

// Capacity validation
export const validateCapacity = (capacity: string): FieldValidationResult => {
  if (!capacity || capacity.trim().length === 0) {
    return { isValid: true }; // Capacity is optional
  }
  
  if (capacity.length > 200) {
    return { isValid: false, error: 'Capacity description must be less than 200 characters' };
  }
  
  return { isValid: true };
};

// Approval status validation
export const validateApprovalStatus = (status: string): FieldValidationResult => {
  const validStatuses = ['pending', 'approved', 'rejected'];
  
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: 'Approval status must be pending, approved, or rejected' };
  }
  
  return { isValid: true };
};

// Complete organization validation
export const validateOrganization = (org: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  const nameValidation = validateOrgName(org.org_name);
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  if (nameValidation.warning) warnings.push(nameValidation.warning);
  
  const countryValidation = validateCountryCode(org.country_code);
  if (!countryValidation.isValid) errors.push(countryValidation.error!);
  if (countryValidation.warning) warnings.push(countryValidation.warning);
  
  // Optional fields
  if (org.email) {
    const emailValidation = validateEmail(org.email);
    if (!emailValidation.isValid) errors.push(emailValidation.error!);
    if (emailValidation.warning) warnings.push(emailValidation.warning);
  }
  
  if (org.website) {
    const websiteValidation = validateWebsite(org.website);
    if (!websiteValidation.isValid) errors.push(websiteValidation.error!);
    if (websiteValidation.warning) warnings.push(websiteValidation.warning);
  }
  
  if (org.type_of_work) {
    const typeValidation = validateTypeOfWork(org.type_of_work);
    if (!typeValidation.isValid) errors.push(typeValidation.error!);
    if (typeValidation.warning) warnings.push(typeValidation.warning);
  }
  
  if (org.mission_statement) {
    const missionValidation = validateMissionStatement(org.mission_statement);
    if (!missionValidation.isValid) errors.push(missionValidation.error!);
    if (missionValidation.warning) warnings.push(missionValidation.warning);
  }
  
  if (org.notable_success) {
    const successValidation = validateNotableSuccess(org.notable_success);
    if (!successValidation.isValid) errors.push(successValidation.error!);
    if (successValidation.warning) warnings.push(successValidation.warning);
  }
  
  if (org.cta_notes) {
    const ctaValidation = validateCtaNotes(org.cta_notes);
    if (!ctaValidation.isValid) errors.push(ctaValidation.error!);
    if (ctaValidation.warning) warnings.push(ctaValidation.warning);
  }
  
  if (org.years_active) {
    const yearsValidation = validateYearsActive(org.years_active);
    if (!yearsValidation.isValid) errors.push(yearsValidation.error!);
    if (yearsValidation.warning) warnings.push(yearsValidation.warning);
  }
  
  if (org.capacity) {
    const capacityValidation = validateCapacity(org.capacity);
    if (!capacityValidation.isValid) errors.push(capacityValidation.error!);
    if (capacityValidation.warning) warnings.push(capacityValidation.warning);
  }
  
  if (org.approval_status) {
    const statusValidation = validateApprovalStatus(org.approval_status);
    if (!statusValidation.isValid) errors.push(statusValidation.error!);
    if (statusValidation.warning) warnings.push(statusValidation.warning);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Real-time validation for forms
export const validateField = (fieldName: string, value: string): FieldValidationResult => {
  switch (fieldName) {
    case 'org_name':
      return validateOrgName(value);
    case 'email':
      return validateEmail(value);
    case 'website':
      return validateWebsite(value);
    case 'country_code':
      return validateCountryCode(value);
    case 'type_of_work':
      return validateTypeOfWork(value);
    case 'mission_statement':
      return validateMissionStatement(value);
    case 'notable_success':
      return validateNotableSuccess(value);
    case 'cta_notes':
      return validateCtaNotes(value);
    case 'years_active':
      return validateYearsActive(value);
    case 'capacity':
      return validateCapacity(value);
    case 'approval_status':
      return validateApprovalStatus(value);
    default:
      return { isValid: true };
  }
};

// Utility to clean and format input
export const cleanInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' '); // Remove extra whitespace
};

// Utility to format URL
export const formatUrl = (url: string): string => {
  const cleaned = cleanInput(url);
  if (!cleaned) return cleaned;
  
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return `https://${cleaned}`;
  }
  
  return cleaned;
};

// Utility to format country code
export const formatCountryCode = (code: string): string => {
  return cleanInput(code).toUpperCase();
};

// Utility to format emails
export const formatEmails = (emails: string): string => {
  return emails
    .split(/[\s,\n\r;]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0)
    .join(', ');
};

// Check if form is ready for submission
export const isFormReady = (org: any): boolean => {
  const validation = validateOrganization(org);
  return validation.isValid && org.org_name && org.country_code;
};

// Get form completion percentage
export const getFormCompleteness = (org: any): number => {
  const fields = [
    'org_name',
    'country_code',
    'website',
    'email',
    'type_of_work',
    'mission_statement',
    'notable_success',
    'cta_notes',
    'years_active',
    'capacity'
  ];
  
  const completedFields = fields.filter(field => {
    const value = org[field];
    return value && value.toString().trim().length > 0;
  }).length;
  
  return Math.round((completedFields / fields.length) * 100);
};

// Validate file uploads (for future use)
export const validateFileUpload = (file: File, maxSizeMB: number = 5): FieldValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be an image (JPEG, PNG, GIF, or WebP)'
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
};