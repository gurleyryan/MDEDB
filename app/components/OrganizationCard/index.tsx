'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';
import { WebsiteMetadata } from '../../hooks/useWebsiteMetadata';
import { OrgScoring, SCORING_CRITERIA } from '../../utils/scoring';
import { 
  getRegionalTheme, 
  getAccentColor, 
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getRegionalTheme(org.country_code)} backdrop-blur-sm border ${getAccentColor(org.country_code)} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}
    >
      {/* Banner Image with Loading State */}
      {org.website && (
        <div className="relative h-48 overflow-hidden">
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
            <div className="absolute bottom-4 left-4 right-4">
              <blockquote className="text-white text-base font-medium italic leading-relaxed line-clamp-2">
                "{org.mission_statement}"
              </blockquote>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6 bg-gray-800/80 backdrop-blur">
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
                  <h3 className="text-xl font-bold text-white mb-1 break-words">
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
                {/* Alignment Score Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                  {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                </span>
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(org.approval_status)}`}>
                  {org.approval_status}
                </span>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {org.website && (
                <div className="flex items-center gap-2">
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
                </div>
              )}
              
              {emails.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">📧</span>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {emails.map((email, index) => (
                      <a
                        key={index}
                        href={`mailto:${email}`}
                        className="text-sm text-green-400 hover:text-green-300 hover:underline break-all"
                        title={email}
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {org.years_active && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">📅</span>
                  <span className="text-sm text-gray-300">Active: {org.years_active}</span>
                </div>
              )}
              
              {org.capacity && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">👥</span>
                  <span className="text-sm text-gray-300">{org.capacity}</span>
                </div>
              )}
            </div>

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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              // Edit mode buttons
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={updatingId === org.id || Object.keys(errors).length > 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors shadow-lg"
                >
                  {updatingId === org.id ? 'Saving...' : '💾 Save'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors shadow-lg"
                >
                  ❌ Cancel
                </motion.button>
              </>
            ) : (
              // Normal mode buttons
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={updatingId === org.id || org.approval_status === 'approved'}
                  onClick={() => onStatusUpdate(org.id, 'approved')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors shadow-lg"
                >
                  {updatingId === org.id ? '...' : '✓ Approve'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={updatingId === org.id || org.approval_status === 'rejected'}
                  onClick={() => onStatusUpdate(org.id, 'rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors shadow-lg"
                >
                  {updatingId === org.id ? '...' : '✗ Reject'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={updatingId === org.id || org.approval_status === 'pending'}
                  onClick={() => onStatusUpdate(org.id, 'pending')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors shadow-lg"
                >
                  {updatingId === org.id ? '...' : '⏳ Pending'}
                </motion.button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startEdit}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors shadow-lg"
              >
                ✏️ Edit
              </motion.button>
            )}
            
            {org.website && !isEditing && websiteInfo?.isValid && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={websiteInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg"
              >
                🔗 Visit Site
              </motion.a>
            )}
            
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExpand(org.id)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg"
              >
                {isExpanded ? '📊 Hide Scoring' : '📊 Edit Scoring'}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Scoring Section */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-700 bg-gray-900/90 p-6"
        >
          <h4 className="text-lg font-bold text-white mb-4">🎯 Scoring Criteria</h4>
          
          {/* Scoring Guide */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h5 className="text-blue-200 font-medium mb-2">📋 Scoring Guide</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="space-y-1 mb-3">
                  <div className="text-gray-300"><span className="font-bold text-red-400">0</span> = Does not meet the criteria</div>
                  <div className="text-gray-300"><span className="font-bold text-yellow-400">1</span> = Unclear/questionable</div>
                  <div className="text-gray-300"><span className="font-bold text-green-400">2</span> = Clearly meets the criteria</div>
                </div>
              </div>
              <div>
                <div className="space-y-1">
                  <div className="text-green-200 font-medium">🟢 21–26: Strong Candidate</div>
                  <div className="text-orange-200 font-medium">🟡 13–20: Promising, Needs Follow-Up</div>
                  <div className="text-red-200 font-medium">🔴 0–12: Low Priority / Not Suitable</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scoring Criteria Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {SCORING_CRITERIA.map((criterion) => (
              <div key={criterion.key} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-white text-sm">{criterion.label}</h5>
                  <select
                    value={scores?.[criterion.key as keyof OrgScoring] || ''}
                    onChange={(e) => onScoreUpdate(org.id, criterion.key as keyof OrgScoring, parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm ml-2 min-w-[70px]"
                  >
                    <option value="">N/A</option>
                    <option value={0}>0 - No</option>
                    <option value={1}>1 - Unclear</option>
                    <option value={2}>2 - Yes</option>
                  </select>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{criterion.description}</p>
              </div>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Comments</label>
            <textarea
              value={scores?.comments || ''}
              onChange={(e) => onScoreUpdate(org.id, 'comments', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-24 resize-none"
              placeholder="Add any additional notes or comments about this organization..."
            />
          </div>

          {/* Calculated Score Display */}
          <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Calculated Alignment Score:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getAlignmentScoreColor(totalScore)}`}>
                {totalScore ?? 'N/A'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Maximum possible score: 26 (13 criteria × 2 points each)
            </div>
            
            {/* Recommendation */}
            {totalScore !== null && totalScore > 0 && (
              <div className="text-xs mt-2">
                <span className={`font-medium ${recommendation.color}`}>
                  {recommendation.emoji} Recommendation: {recommendation.text}
                </span>
              </div>
            )}
          </div>

          {/* Save Scoring Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onScoringSave(org.id)}
              disabled={savingScores === org.id}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors shadow-lg"
            >
              {savingScores === org.id ? 'Saving...' : '💾 Save Scoring'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default OrganizationCard;