'use client';
import { useState } from 'react';
import { Org } from '@/models/org';
import { validateField, formatUrl, formatCountryCode, isFormReady } from '../../utils/validation';
import { createPortal } from 'react-dom';
import { ClimateIcons } from '../Icons';

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
  console.log('Modal rendered');
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
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

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
    console.log('isFormReady:', isFormReady(formData));
    console.log('validationErrors:', validationErrors);

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

  // Check if form has unsaved changes

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 z-[99999]"
      style={{
        opacity: 1,
        visibility: 'visible',
        transition: 'opacity 0.15s ease-out',
      }}
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform scale-100 flex flex-col"
        style={{
          transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
          opacity: 1,
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {ClimateIcons.plus}
              <span>Add New Organization</span>
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 p-1"
              title="Close modal"
            >
              {ClimateIcons.cancel}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors font-body ${errors.org_name
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.org_name
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="Enter organization name"
                  required
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
                  <span className="text-gray-400 text-xs ml-1">(2 letters, e.g., US, CA, GB)</span>
                </label>
                <input
                  type="text"
                  value={formData.country_code || ''}
                  onChange={(e) => handleFieldChange('country_code', e.target.value.toUpperCase())}
                  onBlur={() => handleFieldBlur('country_code')}
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors font-body uppercase ${errors.country_code
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.country_code
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="US"
                  maxLength={2}
                  required
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
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors font-body ${errors.website
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.website
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="https://example.org"
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
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-24 resize-none ${errors.email
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.email
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="contact@example.org (multiple emails separated by commas or line breaks)"
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
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${errors.type_of_work
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.type_of_work
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="e.g., Advocacy, Education, Direct Action"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Years Active</label>
                <input
                  type="text"
                  value={formData.years_active || ''}
                  onChange={(e) => handleFieldChange('years_active', e.target.value)}
                  onBlur={() => handleFieldBlur('years_active')}
                  className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${errors.years_active
                      ? 'border-red-500 focus:border-red-400'
                      : warnings.years_active
                        ? 'border-yellow-500 focus:border-yellow-400'
                        : 'border-gray-600 focus:border-blue-500'
                    }`}
                  placeholder="e.g., 2013–present, 2018–2023"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
              <input
                type="text"
                value={formData.capacity || ''}
                onChange={(e) => handleFieldChange('capacity', e.target.value)}
                onBlur={() => handleFieldBlur('capacity')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${errors.capacity
                    ? 'border-red-500 focus:border-red-400'
                    : warnings.capacity
                      ? 'border-yellow-500 focus:border-yellow-400'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                placeholder="e.g., 20-50 volunteers, Small team"
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
                value={formData.mission_statement}
                onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors font-body resize-none"
                rows={4}
                placeholder="Enter the organization's mission statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notable Success</label>
              <textarea
                value={formData.notable_success || ''}
                onChange={(e) => handleFieldChange('notable_success', e.target.value)}
                onBlur={() => handleFieldBlur('notable_success')}
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-20 resize-none ${errors.notable_success
                    ? 'border-red-500 focus:border-red-400'
                    : warnings.notable_success
                      ? 'border-yellow-500 focus:border-yellow-400'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                placeholder="Describe a key achievement or success story"
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
                className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors h-20 resize-none ${errors.cta_notes
                    ? 'border-red-500 focus:border-red-400'
                    : warnings.cta_notes
                      ? 'border-yellow-500 focus:border-yellow-400'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                placeholder="Notes about call-to-action or how people can get involved"
              />
              {touched.cta_notes && errors.cta_notes && (
                <p className="text-red-400 text-xs mt-1">{errors.cta_notes}</p>
              )}
              {touched.cta_notes && warnings.cta_notes && !errors.cta_notes && (
                <p className="text-yellow-400 text-xs mt-1">{warnings.cta_notes}</p>
              )}
            </div>

            {/* Initial Status - Updated with CustomDropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Status
              </label>
              <div className="flex gap-3">
                {['pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                      ${formData.approval_status === status
                        ? status === 'approved'
                          ? 'bg-green-600 text-white'
                          : status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                    `}
                    onClick={() => setFormData({ ...formData, approval_status: status as 'pending' | 'approved' | 'rejected' })}
                    disabled={isSubmitting}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
        {/* Action Buttons - Always visible at the bottom */}
        <div className="flex gap-3 p-4 pt-0 border-t border-gray-700 bg-gray-800 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {ClimateIcons.cancel}
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.org_name?.trim() || !formData.country_code?.trim()}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                {ClimateIcons.plus}
                Add Organization
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render to document body to avoid z-index conflicts
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

export default AddOrganizationModal;