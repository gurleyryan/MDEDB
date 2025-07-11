'use client';
import { useState } from 'react';
import { CustomDropdown } from '../CustomDropdown';
import { getStatusOptions } from '../../utils/selectOptions';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';
import { WebsiteMetadata } from '../../hooks/useWebsiteMetadata';
import { OrgScoring } from '../../utils/scoring';
import {
  getRegionalTheme,
  getAlignmentScoreColor,
  getStatusColor,
  createValidUrl,
  processEmails,
  getGoogleFaviconUrl,
  isPlaceholderUrl} from '../../utils/orgUtils';
import { validateField, formatUrl, formatCountryCode } from '../../utils/validation';
import { ClimateIcons } from '../Icons';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};


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

// Status options are now imported from utils/selectOptions

export function OrganizationCard({
  org,
  metadata,
  isExpanded,
  isEditing,
  updatingId,
  onExpand,
  onEdit,
  onSave,
  onCancel,
  onStatusUpdate}: OrganizationCardProps) {
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
    onEdit(org); // Restore this call to set editing state
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

  // Add loading state awareness
  const isMetadataLoading = !metadata && org.website; // Loading if no metadata but has website

  return (
    <div
      className={`organization-card panel-glass relative rounded-2xl backdrop-blur-sm shadow-2xl transition-all duration-300 stained-glass ${getRegionalTheme(org.country_code)} ${isExpanded || isEditing ? 'expanded-card' : 'hover:shadow-3xl'
        }`}
      style={{
        overflow: 'visible',
        position: 'relative',
        // Remove hover transform when expanded/editing
        transform: isExpanded || isEditing ? 'none' : undefined
      }}
      // Remove any tabIndex or focus-related attributes
      tabIndex={-1} // Prevent card from receiving focus
      onFocus={(e) => e.preventDefault()} // Prevent focus events
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
                console.log(`Image failed to load for ${org.org_name}: ${metadata.image}`);
                // Try HTTP version if HTTPS failed
                if (metadata.image?.startsWith('https://')) {
                  const httpVersion = metadata.image.replace('https://', 'http://');
                  console.log(`Trying HTTP version: ${httpVersion}`);
                  e.currentTarget.src = httpVersion;
                } else {
                  // Hide the banner if both fail
                  const container = e.currentTarget.parentElement;
                  if (container) container.style.display = 'none';
                }

              }}
            />
          ) : null}

          {/* Mission Statement Overlay - simplified with auto-width glass box */}
          {org.mission_statement && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              {/* Glass box that sizes to content */}
              <div className="mission-statement-glass px-4 py-3 max-w-full">
                <blockquote className="mission-statement-text text-sm leading-relaxed text-pretty text-center">
                  <span className="mission-quote-mark text-lg leading-none">&quot;</span>
                  <span className="mx-1">{org.mission_statement}</span>
                  <span className="mission-quote-mark text-lg leading-none">&quot;</span>
                </blockquote>
              </div>
            </div>
          )}
        </div>
      )}
      {!metadata?.image && (
        <div className="text-xs text-orange-400 mt-2">
          No banner found. {org.website?.startsWith('http://') && 'Site is not secure (HTTP only).'}
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
                className={`w-full p-2 bg-gray-700 border rounded text-white text-xl font-bold focus:outline-none ${errors.org_name ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.website ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.country_code ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.type_of_work ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.years_active ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.capacity ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${errors.mission_statement ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${errors.notable_success ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none h-20 resize-none ${errors.cta_notes ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
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
            {/* Header with responsive two-column layout */}
            <div className="flex justify-between items-start mb-3 gap-4">
              {/* Left Column: Favicon + Org Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Favicon */}
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

                {/* Left side organization info - Enhanced responsive layout */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  {/* Org name with better responsive handling */}
                  <div className="mb-1">
                    <h3 className="org-name-heading text-heading text-white break-words leading-tight">
                      {org.org_name}
                    </h3>
                  </div>

                  {/* Country code and type of work */}
                  <div className="flex items-center gap-1 text-sm flex-wrap">
                    <span className="text-gray-300 flex-shrink-0">{org.country_code}</span>
                    {org.type_of_work && (
                      <>
                        <span className="text-gray-500 flex-shrink-0">•</span>
                        <span className="text-gray-300 break-words min-w-0">{org.type_of_work}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Fixed layout - Badges and Years stay right, Website and Email move down */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-0 max-w-[45%] sm:max-w-none">
                {/* Row 1: Badges - ALWAYS stay at top right */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                    {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                  </span>

                  <span className={`px-2 py-1 rounded text-xs font-bold capitalize whitespace-nowrap ${getStatusColor(org.approval_status)}`}>
                    {org.approval_status}
                  </span>
                </div>

                {/* Row 2: Years Active - ALWAYS stay at second row right */}
                {org.years_active && (
                  <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                    <span className="text-yellow-400 flex-shrink-0">
                      {ClimateIcons.calendar}
                    </span>
                    <span
                      className="text-gray-300 leading-tight text-xs sm:text-sm truncate min-w-0 max-w-[100px] sm:max-w-[120px] md:max-w-[150px]"
                      title={org.years_active}
                    >
                      {org.years_active}
                    </span>
                  </div>
                )}

                {/* Row 3: Website - Moves down from top when needed */}
                {org.website && (
                  <div className="flex items-center gap-1 min-w-0 website-row">
                    <span className="text-blue-400 flex-shrink-0">
                      {ClimateIcons.website}
                    </span>
                    {websiteInfo?.isValid ? (
                      <a
                        href={websiteInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0"
                        title={org.website}
                      >
                        {websiteInfo.hostname}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>
                        Invalid URL
                      </span>
                    )}
                  </div>
                )}

                {/* Row 4: Emails - Moves down from second row when needed */}
                {emails.length > 0 && (
                  <div className="flex items-center gap-1 min-w-0 email-row">
                    <span className="text-green-400 flex-shrink-0">
                      {ClimateIcons.email}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 min-w-0">
                      {emails.length <= 2 ? (
                        // 1-2 emails: Show all with mobile-optimized truncation
                        emails.map((email, index) => (
                          <span key={index} className="flex items-center min-w-0">
                            <a
                              href={`mailto:${email}`}
                              className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-full sm:max-w-[120px] md:max-w-[200px]"
                              title={email}
                            >
                              {email}
                            </a>
                            {index < emails.length - 1 && (
                              <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                            )}
                          </span>
                        ))
                      ) : emails.length === 3 ? (
                        // 3 emails: Adaptive display
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 min-w-0">
                          {emails.every(email => email.length <= 12) ? (
                            // All short emails, try to show all
                            emails.map((email, index) => (
                              <span key={index} className="flex items-center min-w-0">
                                <a
                                  href={`mailto:${email}`}
                                  className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-[80px] sm:max-w-[100px] md:max-w-[150px]"
                                  title={email}
                                >
                                  {email}
                                </a>
                                {index < emails.length - 1 && (
                                  <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                                )}
                              </span>
                            ))
                          ) : (
                            // Show count for compact display
                            <span
                              className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                              title={`All emails: ${emails.join(', ')}`}
                            >
                              {emails.length} emails
                            </span>
                          )}
                        </div>
                      ) : (
                        // 4+ emails: Always show count
                        <span
                          className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                          title={`All emails: ${emails.join(', ')}`}
                        >
                          {emails.length} emails
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Condensed highlights */}
            <div className="space-y-2 mb-3">
              {org.capacity && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-400">
                    {ClimateIcons.capacity}
                  </span>
                  <span className="text-gray-300">{org.capacity}</span>
                </div>
              )}

              {org.notable_success && (
                <div className="p-2 bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r text-sm">
                  <span className="text-emerald-200 font-medium">
                    {ClimateIcons.trophy}
                  </span>
                  <span className="text-gray-300 ml-2">{org.notable_success}</span>
                </div>
              )}

              {org.cta_notes && (
                <div className="p-2 bg-blue-500/10 border-l-2 border-blue-500 rounded-r text-sm">
                  <span className="text-blue-200 font-medium">
                    {ClimateIcons.announcement}
                  </span>
                  <span className="text-gray-300 ml-2">{org.cta_notes}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Status and Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          {/* First Row: Status, Audit Trail (when space), and Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Dropdown */}
            <div
              className="flex items-center gap-2 w-full sm:w-auto"
              style={{
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-yellow-400 flex items-center flex-shrink-0">
                {ClimateIcons.energy}
              </span>
              <div className="flex-1 sm:flex-initial">
                <CustomDropdown
                  value={org.approval_status}
                  onChange={(newValue) => {
                    console.log('Status changing from', org.approval_status, 'to', newValue);
                    if (newValue === 'pending' || newValue === 'approved' || newValue === 'rejected') {
                      onStatusUpdate(org.id, newValue);
                    } else {
                      console.error('Invalid status value:', newValue);
                    }
                  }}
                  options={getStatusOptions()}
                  colorCoded={true}
                  className="w-full min-w-[100px] text-xs status-dropdown"
                />
              </div>
            </div>

            {/* Compact Audit Trail - Show inline on larger screens when expanded */}
            {isExpanded && (
              <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                <div className="flex items-center gap-1">
                  {ClimateIcons.calendar}
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-300">{formatDate(org.created_at)}</span>
                  {org.created_by_name && (
                    <>
                      <span className="text-gray-500">by</span>
                      <span className="text-gray-300">{org.created_by_name}</span>
                    </>
                  )}
                </div>
                
                <div className="w-px h-3 bg-gray-600"></div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-300">{formatDate(org.updated_at)}</span>
                  {org.updated_by_name && (
                    <>
                      <span className="text-gray-500">by</span>
                      <span className="text-gray-300">{org.updated_by_name}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updatingId === org.id || Object.keys(errors).length > 0}
                    className="btn-glass btn-glass-green px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 hover:translate-y-[-1px] transition-all duration-200 shadow-lg flex-1 sm:flex-initial justify-center sm:justify-start"
                  >
                    {ClimateIcons.save}
                    <span className="transition-opacity duration-200">
                      {updatingId === org.id ? 'Saving...' : 'Save'}
                    </span>
                  </button>

                  <button
                    onClick={handleCancel}
                    className="btn-glass text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:translate-y-[-1px] transition-all duration-200 shadow-lg flex-1 sm:flex-initial justify-center sm:justify-start"
                  >
                    {ClimateIcons.cancel}
                    <span className="transition-opacity duration-200">Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startEdit}
                    onMouseDown={(e) => e.preventDefault()}
                    className="btn-glass btn-glass-blue px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-glow-blue flex items-center gap-2 hover:translate-y-[-1px] transition-all duration-200 shadow-lg flex-1 sm:flex-initial justify-center sm:justify-start"
                  >
                    {ClimateIcons.edit}
                    <span className="transition-opacity duration-200">Edit Info</span>
                  </button>

                  <button
                    onClick={() => onExpand(org.id)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="btn-glass btn-glass-purple px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-glow-purple flex items-center gap-2 hover:translate-y-[-1px] transition-all duration-200 shadow-lg flex-1 sm:flex-initial justify-center sm:justify-start"
                  >
                    {ClimateIcons.scoring}
                    <span className="transition-opacity duration-200">
                      {isExpanded ? 'Hide Scoring' : 'Edit Scoring'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Second Row: Expanded Audit Trail - Show below on smaller screens when expanded */}
          {isExpanded && (
            <div className="lg:hidden flex items-center justify-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                {ClimateIcons.calendar}
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-300">{formatDate(org.created_at)}</span>
                {org.created_by_name && (
                  <>
                    <span className="text-gray-500">by</span>
                    <span className="text-gray-300">{org.created_by_name}</span>
                  </>
                )}
              </div>
              
              <div className="w-px h-3 bg-gray-600"></div>
              
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Updated:</span>
                <span className="text-gray-300">{formatDate(org.updated_at)}</span>
                {org.updated_by_name && (
                  <>
                    <span className="text-gray-500">by</span>
                    <span className="text-gray-300">{org.updated_by_name}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizationCard;