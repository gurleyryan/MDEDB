'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Org } from '@/models/org';
import { validateField, formatUrl, formatCountryCode, isFormReady } from '../../utils/validation';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orgData: Partial<Org>) => Promise<boolean>;
  isSubmitting?: boolean;
}

interface FormErrors {
  [key: string]: string | null;
}

interface FormWarnings {
  [key: string]: string | null;
}

export function AddOrganizationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}: AddOrganizationModalProps) {
  const [formData, setFormData] = useState<Partial<Org>>({
    org_name: '',
    website: '',
    email: '',
    country_code: '',
    type_of_work: '',
    mission_statement: '',
    notable_success: '',
    cta_notes: '',
    years_active: '',
    capacity: '',
    approval_status: 'pending'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [warnings, setWarnings] = useState<FormWarnings>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle field changes with real-time validation
  const handleFieldChange = (field: keyof Org, value: string) => {
    // Update form data
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field
    const validation = validateField(field, value);
    
    if (validation.isValid) {
      setErrors(prev => ({ ...prev, [field]: null }));
      setWarnings(prev => ({ ...prev, [field]: validation.warning || null }));
    } else {
      setErrors(prev => ({ ...prev, [field]: validation.error || null }));
      setWarnings(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle field blur - format certain fields
  const handleFieldBlur = (field: keyof Org) => {
    const value = formData[field] || '';
    let formattedValue = value;

    switch (field) {
      case 'website':
        if (value) {
          const url = formatUrl(String(value));
          formattedValue = Array.isArray(url) ? url.join(', ') : url;
          setFormData(prev => ({ ...prev, [field]: String(formattedValue) }));
        }
        break;
      case 'country_code':
        if (value) {
          const country = formatCountryCode(String(value));
          formattedValue = Array.isArray(country) ? country.join(', ') : country;
          setFormData(prev => ({ ...prev, [field]: String(formattedValue) }));
        }
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields = Object.keys(formData) as (keyof Org)[];
    const touchedState = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(touchedState);

    // Validate all fields
    const validationErrors: FormErrors = {};
    allFields.forEach(field => {
      const value = formData[field];
      const stringValue = Array.isArray(value) ? value.join(', ') : value || '';
      const validation = validateField(field, stringValue);
      if (!validation.isValid) {
        validationErrors[field] = validation.error || null;
      }
    });

    setErrors(validationErrors);

    // Check if form is ready for submission
    if (!isFormReady(formData) || Object.values(validationErrors).some(error => error !== null)) {
      return;
    }

    // Submit form
    const success = await onSubmit(formData);
    
    if (success) {
      // Reset form on successful submission
      setFormData({
        org_name: '',
        website: '',
        email: '',
        country_code: '',
        type_of_work: '',
        mission_statement: '',
        notable_success: '',
        cta_notes: '',
        years_active: '',
        capacity: '',
        approval_status: 'pending'
      });
      setErrors({});
      setWarnings({});
      setTouched({});
      onClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = Object.values(formData).some(value => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.some(v => typeof v === 'string' && v.trim().length > 0);
    }
    return false;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Organization</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white text-2xl transition-colors disabled:opacity-50"
            title="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.org_name || ''}
                onChange={(e) => handleFieldChange('org_name', e.target.value)}
                onBlur={() => handleFieldBlur('org_name')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.org_name 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.org_name
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="Enter organization name"
                disabled={isSubmitting}
              />
              {touched.org_name && errors.org_name && (
                <p className="text-red-400 text-xs mt-1">{errors.org_name}</p>
              )}
              {touched.org_name && warnings.org_name && !errors.org_name && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.org_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country Code *
              </label>
              <input
                type="text"
                value={formData.country_code || ''}
                onChange={(e) => handleFieldChange('country_code', e.target.value.toUpperCase())}
                onBlur={() => handleFieldBlur('country_code')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.country_code 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.country_code
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., US, CA, UK"
                maxLength={2}
                disabled={isSubmitting}
              />
              {touched.country_code && errors.country_code && (
                <p className="text-red-400 text-xs mt-1">{errors.country_code}</p>
              )}
              {touched.country_code && warnings.country_code && !errors.country_code && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.country_code}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                onBlur={() => handleFieldBlur('website')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.website 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.website
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="https://example.org"
                disabled={isSubmitting}
              />
              {touched.website && errors.website && (
                <p className="text-red-400 text-xs mt-1">{errors.website}</p>
              )}
              {touched.website && warnings.website && !errors.website && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.website}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <textarea
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-24 resize-none ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.email
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="contact@example.org (multiple emails separated by commas or line breaks)"
                disabled={isSubmitting}
              />
              {touched.email && errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
              {touched.email && warnings.email && !errors.email && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.email}</p>
              )}
            </div>
          </div>

          {/* Organization Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type of Work</label>
              <input
                type="text"
                value={formData.type_of_work || ''}
                onChange={(e) => handleFieldChange('type_of_work', e.target.value)}
                onBlur={() => handleFieldBlur('type_of_work')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.type_of_work 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.type_of_work
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., Advocacy, Education, Direct Action"
                disabled={isSubmitting}
              />
              {touched.type_of_work && errors.type_of_work && (
                <p className="text-red-400 text-xs mt-1">{errors.type_of_work}</p>
              )}
              {touched.type_of_work && warnings.type_of_work && !errors.type_of_work && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.type_of_work}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Years Active</label>
              <input
                type="text"
                value={formData.years_active || ''}
                onChange={(e) => handleFieldChange('years_active', e.target.value)}
                onBlur={() => handleFieldBlur('years_active')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  errors.years_active 
                    ? 'border-red-500 focus:border-red-400' 
                    : warnings.years_active
                    ? 'border-yellow-500 focus:border-yellow-400'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="e.g., 2013–present, 2018–2023"
                disabled={isSubmitting}
              />
              {touched.years_active && errors.years_active && (
                <p className="text-red-400 text-xs mt-1">{errors.years_active}</p>
              )}
              {touched.years_active && warnings.years_active && !errors.years_active && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.years_active}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
            <input
              type="text"
              value={formData.capacity || ''}
              onChange={(e) => handleFieldChange('capacity', e.target.value)}
              onBlur={() => handleFieldBlur('capacity')}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                errors.capacity 
                  ? 'border-red-500 focus:border-red-400' 
                  : warnings.capacity
                  ? 'border-yellow-500 focus:border-yellow-400'
                  : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder="e.g., 20-50 volunteers, Small team"
              disabled={isSubmitting}
            />
            {touched.capacity && errors.capacity && (
              <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>
            )}
            {touched.capacity && warnings.capacity && !errors.capacity && (
              <p className="text-yellow-400 text-xs mt-1">{warnings.capacity}</p>
            )}
          </div>

          {/* Long Text Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mission Statement</label>
            <textarea
              value={formData.mission_statement || ''}
              onChange={(e) => handleFieldChange('mission_statement', e.target.value)}
              onBlur={() => handleFieldBlur('mission_statement')}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-24 resize-none ${
                errors.mission_statement 
                  ? 'border-red-500 focus:border-red-400' 
                  : warnings.mission_statement
                  ? 'border-yellow-500 focus:border-yellow-400'
                  : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder="Enter the organization's mission statement"
              disabled={isSubmitting}
            />
            {touched.mission_statement && errors.mission_statement && (
              <p className="text-red-400 text-xs mt-1">{errors.mission_statement}</p>
            )}
            {touched.mission_statement && warnings.mission_statement && !errors.mission_statement && (
              <p className="text-yellow-400 text-xs mt-1">{warnings.mission_statement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notable Success</label>
            <textarea
              value={formData.notable_success || ''}
              onChange={(e) => handleFieldChange('notable_success', e.target.value)}
              onBlur={() => handleFieldBlur('notable_success')}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-20 resize-none ${
                errors.notable_success 
                  ? 'border-red-500 focus:border-red-400' 
                  : warnings.notable_success
                  ? 'border-yellow-500 focus:border-yellow-400'
                  : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder="Describe a key achievement or success story"
              disabled={isSubmitting}
            />
            {touched.notable_success && errors.notable_success && (
              <p className="text-red-400 text-xs mt-1">{errors.notable_success}</p>
            )}
            {touched.notable_success && warnings.notable_success && !errors.notable_success && (
              <p className="text-yellow-400 text-xs mt-1">{warnings.notable_success}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">CTA Notes</label>
            <textarea
              value={formData.cta_notes || ''}
              onChange={(e) => handleFieldChange('cta_notes', e.target.value)}
              onBlur={() => handleFieldBlur('cta_notes')}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-20 resize-none ${
                errors.cta_notes 
                  ? 'border-red-500 focus:border-red-400' 
                  : warnings.cta_notes
                  ? 'border-yellow-500 focus:border-yellow-400'
                  : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder="Notes about call-to-action or how people can get involved"
              disabled={isSubmitting}
            />
            {touched.cta_notes && errors.cta_notes && (
              <p className="text-red-400 text-xs mt-1">{errors.cta_notes}</p>
            )}
            {touched.cta_notes && warnings.cta_notes && !errors.cta_notes && (
              <p className="text-yellow-400 text-xs mt-1">{warnings.cta_notes}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormReady(formData) || Object.values(errors).some(error => error !== null)}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Organization'
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 shadow-lg"
            >
              Cancel
            </motion.button>
          </div>

          {/* Form Status Indicator */}
          {hasUnsavedChanges && !isSubmitting && (
            <div className="text-xs text-gray-400 text-center pt-2">
              * Fields marked with asterisk are required
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AddOrganizationModal;