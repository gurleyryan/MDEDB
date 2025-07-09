'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { snapTransition } from '../../utils/motion';
import { CustomDropdown } from '../CustomDropdown';
import { getScoringOptions } from '../../utils/selectOptions';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';
import { WebsiteMetadata } from '../../hooks/useWebsiteMetadata';
import { OrgScoring, SCORING_CRITERIA } from '../../utils/scoring';
import { 
  getRegionalTheme, 
  getAlignmentScoreColor,
  getStatusColor,
  createValidUrl,
  processEmails,
  getGoogleFaviconUrl,
  isPlaceholderUrl,
  getScoreRecommendation
} from '../../utils/orgUtils';
import { validateField, formatUrl, formatCountryCode } from '../../utils/validation';

interface OrganizationCardProps {
  org: OrgWithScore;
  metadata?: WebsiteMetadata;
  scores?: OrgScoring;
  isExpanded: boolean;
  isEditing: boolean;
  updatingId: string | null;
  savingScores: string | null;
  onExpand: (orgId: string) => void;
  onEdit: (org: OrgWithScore) => void;
  onSave: (orgId: string, data: Partial<Org>) => Promise<boolean>;
  onCancel: () => void;
  onStatusUpdate: (orgId: string, status: 'approved' | 'rejected' | 'pending') => void;
  onScoreUpdate: (orgId: string, field: keyof OrgScoring, value: number | string) => void;
  onScoringSave: (orgId: string) => Promise<boolean>;
}

// Add status options
const getStatusOptions = () => [
  { value: 'pending', label: 'Pending', emoji: '⏳', color: '#f59e0b', bgColor: '#92400e' },
  { value: 'approved', label: 'Approved', emoji: '✅', color: '#10b981', bgColor: '#065f46' },
  { value: 'rejected', label: 'Rejected', emoji: '❌', color: '#ef4444', bgColor: '#991b1b' },
];

export function OrganizationCard({
  org,
  metadata,
  scores,
  isExpanded,
  isEditing,
  updatingId,
  savingScores,
  onExpand,
  onEdit,
  onSave,
  onCancel,
  onStatusUpdate,
  onScoreUpdate,
  onScoringSave
}: OrganizationCardProps) {
  const [editForm, setEditForm] = useState<Partial<Org>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize edit form when editing starts
  const startEdit = () => {
    setEditForm({
      org_name: org.org_name,
      website: org.website || '',
      email: org.email || '',
      country_code: org.country_code,
      type_of_work: org.type_of_work || '',
      mission_statement: org.mission_statement || '',
      notable_success: org.notable_success || '',
      cta_notes: org.cta_notes || '',
      years_active: org.years_active || '',
      capacity: org.capacity || ''
    });
    setErrors({});
    onEdit(org);
  };

  // Handle field changes with validation
  const handleFieldChange = (field: keyof Org, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const validation = validateField(field, value);
    if (!validation.isValid && validation.error) {
      setErrors(prev => ({ ...prev, [field]: validation.error! }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle save with validation
  const handleSave = async () => {
    // Validate all fields
    const validationErrors: Record<string, string> = {};
    
    Object.entries(editForm).forEach(([key, value]) => {
      const stringValue = Array.isArray(value) ? value.join(', ') : value || '';
      const validation = validateField(key, stringValue);
      if (!validation.isValid && validation.error) {
        validationErrors[key] = validation.error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const success = await onSave(org.id, editForm);
    if (success) {
      setEditForm({});
      setErrors({});
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditForm({});
    setErrors({});
    onCancel();
  };

  // Get processed emails for display
  const emails = org.email ? processEmails(org.email) : [];

  // Get valid URL info
  const websiteInfo = org.website ? createValidUrl(org.website) : null;

  // Calculate total score
  const totalScore = scores ? (() => {
    const numericScores = [
      scores.impact_track_record,
      scores.local_legitimacy,
      scores.transparency,
      scores.scalability,
      scores.digital_presence,
      scores.alignment,
      scores.urgency_relevance,
      scores.clear_actionable_cta,
      scores.show_ready_cta,
      scores.scalable_impact,
      scores.accessibility,
      scores.global_regional_fit,
      scores.volunteer_pipeline
    ].filter(score => score !== undefined && score !== null) as number[];
    
    return numericScores.length > 0 ? numericScores.reduce((sum, score) => sum + score, 0) : null;
  })() : null;

  const recommendation = getScoreRecommendation(totalScore);

  // Add loading state awareness
  const isMetadataLoading = !metadata && org.website; // Loading if no metadata but has website

  return (
    <div
      className={`organization-card panel-glass relative rounded-2xl backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 stained-glass ${getRegionalTheme(org.country_code)}`}
      style={{ 
        overflow: 'visible',
        position: 'relative',
        zIndex: 'auto'
      }}
    >
      {/* Banner Image with proper rounding */}
      {org.website && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {isMetadataLoading ? (
            // Skeleton loader for banner
            <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ) : metadata?.image && !isPlaceholderUrl(metadata.image) ? (
            <img
              src={metadata.image}
              alt={`${org.org_name} banner`}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => {
                const container = e.currentTarget.parentElement;
                if (container) container.style.display = 'none';
              }}
            />
          ) : null}
          
          {/* Mission Statement Overlay */}
          {org.mission_statement && !isMetadataLoading && (
            <div className="absolute bottom-0 left-0 right-0 group cursor-default">
              {/* Progressive gradient darkening */}
              <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent group-hover:from-black/95 group-hover:via-black/80 transition-all duration-500 ease-out p-6 pb-4">
                
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-400 group-hover:text-blue-300 text-lg transition-colors duration-300">💭</span>
                  <span className="text-blue-300 group-hover:text-blue-200 text-xs font-medium uppercase tracking-wide transition-colors duration-300">
                    Mission Statement
                  </span>
                </div>
                
                {/* Mission text with subtle scale and enhanced typography on hover */}
                <blockquote className="text-body text-white/90 group-hover:text-white leading-relaxed transition-all duration-300 text-pretty">
                  <span className="text-blue-300 text-lg leading-none">"</span>
                  {org.mission_statement}
                  <span className="text-blue-300 text-lg leading-none">"</span>
                </blockquote>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Content with enhanced glass effect */}
      <div className={`p-6 backdrop-blur relative panel-glass ${org.website ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Organization Name</label>
              <input
                type="text"
                value={editForm.org_name || ''}
                onChange={(e) => handleFieldChange('org_name', e.target.value)}
                className={`w-full p-2 bg-gray-700 border rounded text-white text-xl font-bold focus:outline-none ${
                  errors.org_name ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {errors.org_name && (
                <p className="text-red-400 text-xs mt-1">{errors.org_name}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Website</label>
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      const formatted = formatUrl(e.target.value);
                      handleFieldChange('website', formatted);
                    }
                  }}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${
                    errors.website ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                />
                {errors.website && (
                  <p className="text-red-400 text-xs mt-1">{errors.website}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <textarea
                  value={editForm.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${
                    errors.email ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  placeholder="Multiple emails separated by commas or line breaks"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Country Code</label>
                <input
                  type="text"
                  value={editForm.country_code || ''}
                  onChange={(e) => handleFieldChange('country_code', e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    if (e.target.value) {
                      const formatted = formatCountryCode(e.target.value);
                      handleFieldChange('country_code', formatted);
                    }
                  }}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${
                    errors.country_code ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  maxLength={2}
                />
                {errors.country_code && (
                  <p className="text-red-400 text-xs mt-1">{errors.country_code}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type of Work</label>
                <input
                  type="text"
                  value={editForm.type_of_work || ''}
                  onChange={(e) => handleFieldChange('type_of_work', e.target.value)}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${
                    errors.type_of_work ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                />
                {errors.type_of_work && (
                  <p className="text-red-400 text-xs mt-1">{errors.type_of_work}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Years Active</label>
                <input
                  type="text"
                  value={editForm.years_active || ''}
                  onChange={(e) => handleFieldChange('years_active', e.target.value)}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${
                    errors.years_active ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  placeholder="e.g., 2013–present, 2018–2023"
                />
                {errors.years_active && (
                  <p className="text-red-400 text-xs mt-1">{errors.years_active}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                <input
                  type="text"
                  value={editForm.capacity || ''}
                  onChange={(e) => handleFieldChange('capacity', e.target.value)}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${
                    errors.capacity ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                />
                {errors.capacity && (
                  <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mission Statement</label>
              <textarea
                value={editForm.mission_statement || ''}
                onChange={(e) => handleFieldChange('mission_statement', e.target.value)}
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${
                  errors.mission_statement ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {errors.mission_statement && (
                <p className="text-red-400 text-xs mt-1">{errors.mission_statement}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Notable Success</label>
              <textarea
                value={editForm.notable_success || ''}
                onChange={(e) => handleFieldChange('notable_success', e.target.value)}
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${
                  errors.notable_success ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {errors.notable_success && (
                <p className="text-red-400 text-xs mt-1">{errors.notable_success}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">CTA Notes</label>
              <textarea
                value={editForm.cta_notes || ''}
                onChange={(e) => handleFieldChange('cta_notes', e.target.value)}
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${
                  errors.cta_notes ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {errors.cta_notes && (
                <p className="text-red-400 text-xs mt-1">{errors.cta_notes}</p>
              )}
            </div>
          </div>
        ) : (
          // Display Mode
          <>
            {/* Mission Statement as header if no banner */}
            {org.mission_statement && (!metadata?.image || isPlaceholderUrl(metadata.image)) && (
              <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                <blockquote className="text-blue-100 text-sm font-medium italic leading-relaxed">
                  "{org.mission_statement}"
                </blockquote>
              </div>
            )}

            {/* Header with favicon and badges */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3 flex-1">
                {/* Favicon with Loading State */}
                {org.website && (
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 p-1">
                    {isMetadataLoading ? (
                      <div className="w-full h-full bg-gray-600 rounded animate-pulse"></div>
                    ) : metadata?.favicon && !isPlaceholderUrl(metadata.favicon) ? (
                      <img
                        src={metadata.favicon}
                        alt=""
                        className="w-full h-full rounded"
                        onError={(e) => {
                          e.currentTarget.src = getGoogleFaviconUrl(org.website!);
                        }}
                      />
                    ) : (
                      <img
                        src={getGoogleFaviconUrl(org.website)}
                        alt=""
                        className="w-full h-full rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
                
                {/* Organization name and info */}
                <div className="flex-1 min-w-0">
                  {/* Organization name with distinctive heading font */}
                  <h3 className="text-heading text-white mb-1 break-words text-balance">
                    {org.org_name}
                  </h3>
                  
                  <p className="text-gray-300 text-sm">
                    {org.country_code} • {org.type_of_work}
                  </p>
                  
                  {/* Loading indicator for metadata */}
                  {isMetadataLoading && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-400">Loading details...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Alignment Score Badge with Label */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Alignment Score:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                    {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                  </span>
                </div>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(org.approval_status)}`}>
                  {org.approval_status}
                </span>
              </div>
            </div>

            {/* Quick Info Grid - Single Row Layout */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Left Column - Website */}
              <div className="flex items-center gap-2">
                {org.website ? (
                  <>
                    <span className="text-blue-400">🌐</span>
                    {websiteInfo?.isValid ? (
                      <a
                        href={websiteInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate"
                      >
                        {websiteInfo.hostname}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 truncate">
                        {org.website} (invalid URL)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500 italic">No website</span>
                )}
              </div>
              
              {/* Center Column - Email */}
              <div className="flex flex-col items-center gap-1">
                {emails.length > 0 ? (
                  <>
                    <div className="space-y-1 text-center">
                      {emails.slice(0, 1).map((email, index) => (
                        <div key={index} className="flex items-center gap-2 justify-center">
                          <span className="text-green-400">📧</span>
                          <a
                            href={`mailto:${email}`}
                            className="text-sm text-green-400 hover:text-green-300 hover:underline truncate max-w-full"
                            title={email}
                          >
                            {email}
                          </a>
                        </div>
                      ))}
                      {emails.length > 1 && (
                        <span className="text-xs text-gray-500">
                          +{emails.length - 1} more
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-center">
                    <span className="text-gray-500">📧</span>
                    <span className="text-sm text-gray-500 italic">No contact email</span>
                  </div>
                )}
              </div>
              
              {/* Right Column - Years Active */}
              <div className="flex items-center justify-end gap-2">
                {org.years_active ? (
                  <>
                    <span className="text-yellow-400">📅</span>
                    <span className="text-sm text-gray-300">Active: {org.years_active}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 italic">Years not specified</span>
                )}
              </div>
            </div>

            {/* Capacity - Separate row if needed */}
            {org.capacity && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-purple-400">👥</span>
                <span className="text-sm text-gray-300">{org.capacity}</span>
              </div>
            )}

            {/* Notable Success Highlight */}
            {org.notable_success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-lg">
                <p className="text-sm text-emerald-200 font-medium">🏆 Notable Success</p>
                <p className="text-sm text-gray-300 mt-1">{org.notable_success}</p>
              </div>
            )}

            {/* CTA Notes */}
            {org.cta_notes && (
              <div className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-200 font-medium">📢 Call to Action</p>
                <p className="text-sm text-gray-300 mt-1">{org.cta_notes}</p>
              </div>
            )}
          </>
        )}

        {/* Status and Action Buttons - Enhanced positioning */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div 
            className="flex items-center gap-3 relative"
            style={{ 
              zIndex: 9999 // Very high z-index for dropdown container
            }}
          >
            <span className="text-sm text-gray-400">Status:</span>
            <CustomDropdown
              value={org.approval_status}
              onChange={(value) => onStatusUpdate(org.id, value as 'pending' | 'approved' | 'rejected')}
              options={getStatusOptions()}
              colorCoded={true}
              className="min-w-[120px]"
            />
          </div>

          {/* Action Buttons - Simple CSS transitions, no Framer Motion */}
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              // Edit mode buttons - simple appearance
              <>
                <button
                  onClick={handleSave}
                  disabled={updatingId === org.id || Object.keys(errors).length > 0}
                  className="btn-glass btn-glass-green px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 shadow-lg flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <span>💾</span>
                  <span>{updatingId === org.id ? 'Saving...' : 'Save'}</span>
                </button>
                
                <button
                  onClick={handleCancel}
                  className="btn-glass text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-100 shadow-lg flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <span>❌</span>
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              // Normal mode buttons - simple appearance
              <>
                <button
                  onClick={startEdit}
                  className="btn-glass btn-glass-blue px-4 py-2 rounded-lg text-sm font-medium transition-all duration-100 shadow-lg flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <span>✏️</span>
                  <span>Edit Info</span>
                </button>

                <button
                  onClick={() => onExpand(org.id)}
                  className="btn-glass btn-glass-purple px-4 py-2 rounded-lg text-sm font-medium transition-all duration-100 shadow-lg flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <span>📊</span>
                  <span>{isExpanded ? 'Hide Scoring' : 'Edit Scoring'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationCard;