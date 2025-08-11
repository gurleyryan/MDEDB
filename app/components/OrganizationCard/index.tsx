'use client';
import { useState, type ReactNode, useRef } from 'react';
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
  isPlaceholderUrl
} from '../../utils/orgUtils';
import { validateField, formatUrl, formatCountryCode } from '../../utils/validation';
import { uploadOrgAsset } from '../../utils/storage';
import { ClimateIcons } from '../Icons';

// Convert plain-text URLs to clickable links (keeps everything client-side and safe)
const linkifyText = (text: string): ReactNode => {
  if (!text) return null;
  // Matches http(s)://... or www.... up to common trailing punctuation
  const urlRegex = /((https?:\/\/|www\.)[^\s<>()]+[^\s.,;:()<>[\]{}"'])/gi;

  // Build a list of nodes keeping newlines
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  text.replace(urlRegex, (match, _grp, proto, offset) => {
    // Push preceding text (preserve newlines)
    if (offset > lastIndex) {
      const chunk = text.slice(lastIndex, offset);
      // Split on newline to insert <br />
      const parts = chunk.split('\n');
      parts.forEach((p, i) => {
        if (p) nodes.push(p);
        if (i < parts.length - 1) nodes.push(<br key={`br-pre-${lastIndex}-${offset}-${i}`} />);
      });
    }

    const href = proto && proto.startsWith('http') ? match : `https://${match}`;
    nodes.push(
      <a
        key={`lnk-${offset}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 hover:underline break-words"
        title={match}
      >
        {match}
      </a>
    );
    lastIndex = offset + match.length;
    return match;
  });

  // Trailing text after last link
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex);
    const parts = tail.split('\n');
    parts.forEach((p, i) => {
      if (p) nodes.push(p);
      if (i < parts.length - 1) nodes.push(<br key={`br-tail-${lastIndex}-${i}`} />);
    });
  }

  return nodes.length ? nodes : text;
};

// Extract the first URL from a block of text (supports http(s) and www.)
const extractFirstUrl = (text?: string): string | null => {
  if (!text) return null;
  const first = text.match(/(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/i);
  if (!first) return null;
  const raw = first[0];
  return raw.startsWith('http') ? raw : `https://${raw}`;
};

// Light rules-based labeler for CTA button based on the surrounding text
const deriveCtaLabel = (text?: string): string => {
  if (!text) return 'Call To Action';
  // Prefer the most specific phrases first
  if (/(register\s+to\s+vote)/i.test(text)) return 'Register to Vote';
  if (/\bregister(ing)?\b/i.test(text)) return 'Register';
  if (/(sign\s*up|signup|sign-up)/i.test(text)) return 'Sign Up';
  if (/\bjoin\b/i.test(text)) return 'Join';
  return 'Call To Action';
};

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
  isPublic?: boolean;
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
  onStatusUpdate,
  isPublic
}: OrganizationCardProps) {
  const [editForm, setEditForm] = useState<Partial<Org>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<{ logo?: boolean; banner?: boolean }>({});

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
      capacity: org.capacity || '',
  // new optional fields
  logo: org.logo || '',
  banner: org.banner || '',
  instagram: org.instagram || '',
  twitter: org.twitter || '',
  facebook: org.facebook || '',
  tiktok: org.tiktok || '',
  linkedin: org.linkedin || '',
  youtube: org.youtube || ''
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

  // Upload helpers
  const handleUpload = async (file: File, kind: 'logo' | 'banner') => {
    try {
      setUploading(prev => ({ ...prev, [kind]: true }));
      const url = await uploadOrgAsset(file, org.id, kind);
      setEditForm(prev => ({ ...prev, [kind]: url }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      setErrors(prev => ({ ...prev, [kind]: message }));
    } finally {
      setUploading(prev => ({ ...prev, [kind]: false }));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, kind: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUpload(file, kind);
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
      {/* Banner Image with proper rounding (custom overrides scraped) */}
      {(org.banner || org.website) && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {org.banner ? (
            <img
              src={org.banner}
              alt={`${org.org_name} banner`}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => {
                // Hide the banner if custom fails
                const container = e.currentTarget.parentElement;
                if (container) container.style.display = 'none';
              }}
            />
          ) : isMetadataLoading ? (
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
      <span className="mx-1">{linkifyText(org.mission_statement)}</span>
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
              {/* Logo upload + preview */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  {/* Hidden native input; triggered by button */}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(e, 'logo')}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="btn-glass btn-glass-blue px-3 py-1.5 rounded-md text-xs font-medium hover:shadow-glow-blue flex items-center gap-2"
                  >
                    {ClimateIcons.plus}
                    <span>{editForm.logo ? 'Change Logo' : 'Choose Logo'}</span>
                  </button>
                  {uploading.logo && <span className="text-gray-400 text-xs">Uploading…</span>}
                </div>
                <input
                  type="url"
                  value={editForm.logo || ''}
                  onChange={(e) => handleFieldChange('logo', e.target.value)}
                  onBlur={(e) => e.target.value && handleFieldChange('logo', formatUrl(e.target.value))}
                  className="mt-2 w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                  placeholder="Or paste a logo URL"
                />
                {editForm.logo && (
                  <div className="mt-2 w-16 h-16 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                    <img src={editForm.logo} alt="logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                {errors.logo && <p className="text-red-400 text-xs mt-1">{errors.logo}</p>}
              </div>

              {/* Banner upload + preview */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Banner</label>
                <div className="flex items-center gap-3">
                  {/* Hidden native input; triggered by button */}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(e, 'banner')}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="btn-glass btn-glass-purple px-3 py-1.5 rounded-md text-xs font-medium hover:shadow-glow-purple flex items-center gap-2"
                  >
                    {ClimateIcons.plus}
                    <span>{editForm.banner ? 'Change Banner' : 'Choose Banner'}</span>
                  </button>
                  {uploading.banner && <span className="text-gray-400 text-xs">Uploading…</span>}
                </div>
                <input
                  type="url"
                  value={editForm.banner || ''}
                  onChange={(e) => handleFieldChange('banner', e.target.value)}
                  onBlur={(e) => e.target.value && handleFieldChange('banner', formatUrl(e.target.value))}
                  className="mt-2 w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                  placeholder="Or paste a banner URL"
                />
                {editForm.banner && (
                  <div className="mt-2 w-full h-20 bg-white/10 rounded overflow-hidden">
                    <img src={editForm.banner} alt="banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {errors.banner && <p className="text-red-400 text-xs mt-1">{errors.banner}</p>}
              </div>
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
                <input
                  type="text"
                  value={editForm.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'}`}
                  placeholder="Multiple emails separated by commas"
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

              {/* Social links */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Instagram</label>
                  <input
                    type="url"
                    value={editForm.instagram || ''}
                    onChange={(e) => handleFieldChange('instagram', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('instagram', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://instagram.com/yourorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X (Twitter)</label>
                  <input
                    type="url"
                    value={editForm.twitter || ''}
                    onChange={(e) => handleFieldChange('twitter', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('twitter', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://x.com/yourorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Facebook</label>
                  <input
                    type="url"
                    value={editForm.facebook || ''}
                    onChange={(e) => handleFieldChange('facebook', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('facebook', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://facebook.com/yourorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">TikTok</label>
                  <input
                    type="url"
                    value={editForm.tiktok || ''}
                    onChange={(e) => handleFieldChange('tiktok', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('tiktok', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://tiktok.com/@yourorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={editForm.linkedin || ''}
                    onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('linkedin', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://linkedin.com/company/yourorg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">YouTube</label>
                  <input
                    type="url"
                    value={editForm.youtube || ''}
                    onChange={(e) => handleFieldChange('youtube', e.target.value)}
                    onBlur={(e) => e.target.value && handleFieldChange('youtube', formatUrl(e.target.value))}
                    className="w-full p-2 bg-gray-700 border rounded text-white text-sm focus:outline-none border-gray-600 focus:border-blue-500"
                    placeholder="https://youtube.com/@yourorg"
                  />
                </div>
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
            <div className="flex justify-between items-start mb-3 gap-4 flex-wrap">
              {/* Left Column: Favicon + Org Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0 max-w-[50%]">
                {/* Favicon */}
                {(org.logo || org.website) && (
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 p-1">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt=""
                        className="w-full h-full rounded object-cover"
                        onError={(e) => {
                          if (org.website) {
                            e.currentTarget.src = getGoogleFaviconUrl(org.website);
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                    ) : isMetadataLoading ? (
                      <div className="w-full h-full bg-gray-600 rounded animate-pulse"></div>
                    ) : metadata?.favicon && !isPlaceholderUrl(metadata.favicon) ? (
                      <img
                        src={metadata.favicon}
                        alt=""
                        className="w-full h-full rounded"
                        onError={(e) => {
                          if (org.website) {
                            e.currentTarget.src = getGoogleFaviconUrl(org.website!);
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      org.website ? (
                        <img
                          src={getGoogleFaviconUrl(org.website)}
                          alt=""
                          className="w-full h-full rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null
                    )}
                  </div>
                )}

                {/* Left side organization info - Enhanced responsive layout */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  {/* Org name with better responsive handling */}
                  <div className="mb-1">
                    <h3 className="org-name-heading text-heading text-white break-words leading-tight min-w-0">
                      {org.org_name}
                    </h3>
                  </div>

                  {/* Country code and type of work */}
                  <div className="text-gray-300 text-sm break-words min-w-0">
                    {org.country_code}
                    {org.type_of_work && (
                      <>
                        <span className="text-gray-500"> • </span>
                        <span>{org.type_of_work}</span>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Right Cluster: Socials (middle) + Right Column, bottom-aligned and no gap */}
              <div className="flex items-end gap-0 min-w-0 max-w-[50%] flex-shrink">
                {/* Middle Column: Social icons (narrow), sits just left of the right-hand column */}
                {(isPublic || emails.length === 0) && (() => {
                  const socials: Array<{ key: keyof Org; icon: ReactNode; label: string }> = [
                    { key: 'instagram', icon: ClimateIcons.instagram, label: 'Instagram' },
                    { key: 'twitter', icon: ClimateIcons.twitter, label: 'X (Twitter)' },
                    { key: 'facebook', icon: ClimateIcons.facebook, label: 'Facebook' },
                    { key: 'tiktok', icon: ClimateIcons.tiktok, label: 'TikTok' },
                    { key: 'linkedin', icon: ClimateIcons.linkedin, label: 'LinkedIn' },
                    { key: 'youtube', icon: ClimateIcons.youtube, label: 'YouTube' },
                  ];
                  const items = socials.map((s, idx) => {
                    const val = org[s.key] as string | undefined;
                    if (!val) return null;
                    const info = createValidUrl(val);
                    const href = info?.isValid ? info.url : (val.startsWith('http') ? val : `https://${val}`);
                    return (
                      <a
                        key={`${s.key}-${idx}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title={s.label}
                      >
                        <span className="sr-only">{s.label}</span>
                        {s.icon}
                      </a>
                    );
                  }).filter(Boolean);
                  if ((items as ReactNode[]).length === 0) return null;
                  return (
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-fit justify-end mr-2">
                      {items as ReactNode[]}
                    </div>
                  );
                })()}

                {/* Right Column: Responsive, never overlapping */}
                <div className="flex flex-col items-end gap-1 min-w-0 flex-shrink ">
                {isPublic ? (
                  <>
                    {/* Years Active */}
                    {org.years_active && (
                      <div className="flex items-center gap-1 min-w-0 flex-shrink-0 mb-1">
                        <span className="text-yellow-400 flex-shrink-0">{ClimateIcons.calendar}</span>
                        <span
                          className="text-gray-300 leading-tight text-xs sm:text-sm truncate min-w-0 max-w-[100px] sm:max-w-[120px] md:max-w-[150px]"
                          title={org.years_active}
                        >
                          {org.years_active}
                        </span>
                      </div>
                    )}
                    {/* Website */}
                    {org.website && websiteInfo?.isValid && (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
                        <a
                          href={websiteInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0"
                          title={org.website}
                        >
                          {websiteInfo.hostname}
                        </a>
                      </div>
                    )}
                    {/* If website exists but is invalid */}
                    {org.website && !websiteInfo?.isValid && (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
                        <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>Invalid URL</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Row 1: Badges */}
                    {(() => {
                      const hasWebsite = !!org.website;
                      const hasEmail = emails.length > 0;
                      const hasYears = !!org.years_active;
                      if (!(hasWebsite && hasEmail && !hasYears) && !isPublic) {
                        return (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                              {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold capitalize whitespace-nowrap ${getStatusColor(org.approval_status)}`}>
                              {org.approval_status}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Row 2: Years Active */}
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

                    {/* Website and Email: Responsive, never overlapping */}
                    {(() => {
                      const hasWebsite = !!org.website;
                      const hasEmail = emails.length > 0;
                      const hasYears = !!org.years_active;

                      // Only website
                      if (hasWebsite && !hasEmail && !hasYears) {
                        return (
                          <div className="flex items-center gap-1 min-w-0 w-full">
                            <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
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
                              <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>Invalid URL</span>
                            )}
                          </div>
                        );
                      }

                      // Only email

                      if (!hasWebsite && hasEmail && !hasYears && !isPublic) {
                        const socials: Array<{ key: keyof Org; icon: ReactNode; label: string }> = [
                          { key: 'instagram', icon: ClimateIcons.instagram, label: 'Instagram' },
                          { key: 'twitter', icon: ClimateIcons.twitter, label: 'X (Twitter)' },
                          { key: 'facebook', icon: ClimateIcons.facebook, label: 'Facebook' },
                          { key: 'tiktok', icon: ClimateIcons.tiktok, label: 'TikTok' },
                          { key: 'linkedin', icon: ClimateIcons.linkedin, label: 'LinkedIn' },
                          { key: 'youtube', icon: ClimateIcons.youtube, label: 'YouTube' },
                        ];
                        const socialItems = socials.map((s, idx) => {
                          const val = org[s.key] as string | undefined;
                          if (!val) return null;
                          const info = createValidUrl(val);
                          const href = info?.isValid ? info.url : (val.startsWith('http') ? val : `https://${val}`);
                          return (
                            <a key={`${s.key}-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title={s.label}>
                              <span className="sr-only">{s.label}</span>
                              {s.icon}
                            </a>
                          );
                        }).filter(Boolean);
                        return (
                          <div className="flex items-center justify-end gap-2 min-w-0 w-full">
                            {socialItems.length > 0 && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {socialItems as ReactNode[]}
                              </div>
                            )}
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-green-400 flex-shrink-0">{ClimateIcons.email}</span>
                              <div className="flex flex-nowrap items-center gap-x-1 gap-y-0.5 min-w-0">
                                {emails.length <= 3 ? (
                                  emails.map((email, index) => (
                                    <span key={index} className="flex items-center min-w-0">
                                      <a
                                        href={`mailto:${email}`}
                                        className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-full sm:max-w-[120px] md:max-w-[200px]"
                                        title={email}
                                      >{email}</a>
                                      {index < emails.length - 1 && (
                                        <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                                    title={`All emails: ${emails.join(', ')}`}>{emails.length} emails</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Only years active (already rendered above)
                      if (!hasWebsite && !hasEmail && hasYears) {
                        return null;
                      }

                      // Website + Email (no years): badges above, website below on mobile; side by side on desktop
                      if (hasWebsite && hasEmail && !hasYears && !isPublic) {
                        return (
                          <>
                            <div className="flex flex-col sm:flex-row-reverse items-end gap-2 min-w-0 w-full">
                              {/* Badges group */}
                              <span className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                                  {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize whitespace-nowrap ${getStatusColor(org.approval_status)}`}>
                                  {org.approval_status}
                                </span>
                              </span>
                              {/* Website (icon + hostname together) */}
                              <span className="flex items-center gap-1 min-w-0 truncate">
                                <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
                                {websiteInfo?.isValid ? (
                                  <a
                                    href={websiteInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0 max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
                                    title={org.website}
                                  >
                                    {websiteInfo.hostname}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>Invalid URL</span>
                                )}
                              </span>
                            </div>
                            {/* Email under badges+website with socials to the left */}
                            <div className="flex items-center justify-end gap-2 min-w-0 mt-1 w-full">
                              {(() => {
                                const socials: Array<{ key: keyof Org; icon: ReactNode; label: string }> = [
                                  { key: 'instagram', icon: ClimateIcons.instagram, label: 'Instagram' },
                                  { key: 'twitter', icon: ClimateIcons.twitter, label: 'X (Twitter)' },
                                  { key: 'facebook', icon: ClimateIcons.facebook, label: 'Facebook' },
                                  { key: 'tiktok', icon: ClimateIcons.tiktok, label: 'TikTok' },
                                  { key: 'linkedin', icon: ClimateIcons.linkedin, label: 'LinkedIn' },
                                  { key: 'youtube', icon: ClimateIcons.youtube, label: 'YouTube' },
                                ];
                                const items = socials.map((s, idx) => {
                                  const val = org[s.key] as string | undefined;
                                  if (!val) return null;
                                  const info = createValidUrl(val);
                                  const href = info?.isValid ? info.url : (val.startsWith('http') ? val : `https://${val}`);
                                  return (
                                    <a key={`${s.key}-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title={s.label}>
                                      <span className="sr-only">{s.label}</span>
                                      {s.icon}
                                    </a>
                                  );
                                }).filter(Boolean);
                                if ((items as ReactNode[]).length === 0) return null;
                                return (
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {items as ReactNode[]}
                                  </div>
                                );
                              })()}
                              <div className="flex items-center gap-1 min-w-0 w-full">
                                <span className="text-green-400 flex-shrink-0">{ClimateIcons.email}</span>
                                <div className="flex flex-nowrap items-center gap-x-1 gap-y-0.5 min-w-0 w-full">
                                  {emails.length <= 4 ? (
                                    emails.map((email, index) => (
                                      <span key={index} className="flex items-center min-w-0 truncate">
                                        <a
                                          href={`mailto:${email}`}
                                          className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-full sm:max-w-[120px] md:max-w-[200px]"
                                          title={email}
                                        >{email}</a>
                                        {index < emails.length - 1 && (
                                          <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                                        )}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                                      title={`All emails: ${emails.join(', ')}`}>{emails.length} emails</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      }

                      // Website + Years: website left of badges, years under badges (already rendered)
                      if (hasWebsite && !hasEmail && hasYears) {
                        return (
                          <div className="flex items-center gap-1 min-w-0 website-row">
                            <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
                            {websiteInfo?.isValid ? (
                              <a
                                href={websiteInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0"
                                title={org.website}
                              >{websiteInfo.hostname}</a>
                            ) : (
                              <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>Invalid URL</span>
                            )}
                          </div>
                        );
                      }

                      // Email + Years: email left of years, years under badges (already rendered)
                      if (!hasWebsite && hasEmail && hasYears && !isPublic) {
                        const socials: Array<{ key: keyof Org; icon: ReactNode; label: string }> = [
                          { key: 'instagram', icon: ClimateIcons.instagram, label: 'Instagram' },
                          { key: 'twitter', icon: ClimateIcons.twitter, label: 'X (Twitter)' },
                          { key: 'facebook', icon: ClimateIcons.facebook, label: 'Facebook' },
                          { key: 'tiktok', icon: ClimateIcons.tiktok, label: 'TikTok' },
                          { key: 'linkedin', icon: ClimateIcons.linkedin, label: 'LinkedIn' },
                          { key: 'youtube', icon: ClimateIcons.youtube, label: 'YouTube' },
                        ];
                        const socialItems = socials.map((s, idx) => {
                          const val = org[s.key] as string | undefined;
                          if (!val) return null;
                          const info = createValidUrl(val);
                          const href = info?.isValid ? info.url : (val.startsWith('http') ? val : `https://${val}`);
                          return (
                            <a key={`${s.key}-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title={s.label}>
                              <span className="sr-only">{s.label}</span>
                              {s.icon}
                            </a>
                          );
                        }).filter(Boolean);
                        return (
                          <div className="flex items-center justify-end gap-2 min-w-0 email-row w-full">
                            {socialItems.length > 0 && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {socialItems as ReactNode[]}
                              </div>
                            )}
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-green-400 flex-shrink-0">{ClimateIcons.email}</span>
                              <div className="flex flex-nowrap items-center gap-x-1 gap-y-0.5 min-w-0">
                                {emails.length <= 3 ? (
                                  emails.map((email, index) => (
                                    <span key={index} className="flex items-center min-w-0">
                                      <a
                                        href={`mailto:${email}`}
                                        className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-full sm:max-w-[120px] md:max-w-[200px]"
                                        title={email}
                                      >{email}</a>
                                      {index < emails.length - 1 && (
                                        <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                                    title={`All emails: ${emails.join(', ')}`}>{emails.length} emails</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // All 3: website left of badges, years under badges, email left of years
                      if (hasWebsite && hasEmail && hasYears && !isPublic) {
                        const socials: Array<{ key: keyof Org; icon: ReactNode; label: string }> = [
                          { key: 'instagram', icon: ClimateIcons.instagram, label: 'Instagram' },
                          { key: 'twitter', icon: ClimateIcons.twitter, label: 'X (Twitter)' },
                          { key: 'facebook', icon: ClimateIcons.facebook, label: 'Facebook' },
                          { key: 'tiktok', icon: ClimateIcons.tiktok, label: 'TikTok' },
                          { key: 'linkedin', icon: ClimateIcons.linkedin, label: 'LinkedIn' },
                          { key: 'youtube', icon: ClimateIcons.youtube, label: 'YouTube' },
                        ];
                        const socialItems = socials.map((s, idx) => {
                          const val = org[s.key] as string | undefined;
                          if (!val) return null;
                          const info = createValidUrl(val);
                          const href = info?.isValid ? info.url : (val.startsWith('http') ? val : `https://${val}`);
                          return (
                            <a key={`${s.key}-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title={s.label}>
                              <span className="sr-only">{s.label}</span>
                              {s.icon}
                            </a>
                          );
                        }).filter(Boolean);
                        return (
                          <>
                            <div className="flex items-center gap-1 min-w-0 website-row">
                              <span className="text-blue-400 flex-shrink-0">{ClimateIcons.website}</span>
                              {websiteInfo?.isValid ? (
                                <a
                                  href={websiteInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0"
                                  title={org.website}
                                >{websiteInfo.hostname}</a>
                              ) : (
                                <span className="text-sm text-gray-400 truncate min-w-0" title={org.website}>Invalid URL</span>
                              )}
                            </div>
                            <div className="flex items-center justify-end gap-2 min-w-0 email-row w-full">
                              {socialItems.length > 0 && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {socialItems as ReactNode[]}
                                </div>
                              )}
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="text-green-400 flex-shrink-0">{ClimateIcons.email}</span>
                                <div className="flex flex-nowrap items-center gap-x-1 gap-y-0.5 min-w-0">
                                  {emails.length <= 3 ? (
                                    emails.map((email, index) => (
                                      <span key={index} className="flex items-center min-w-0">
                                        <a
                                          href={`mailto:${email}`}
                                          className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors truncate min-w-0 max-w-full sm:max-w-[120px] md:max-w-[200px]"
                                          title={email}
                                        >{email}</a>
                                        {index < emails.length - 1 && (
                                          <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
                                        )}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded cursor-help text-xs flex-shrink-0"
                                      title={`All emails: ${emails.join(', ')}`}>{emails.length} emails</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      }

                      return null;
                    })()}
                  </>
                )}
                </div>
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
                  <span className="text-gray-300 ml-2 break-words">{linkifyText(org.notable_success)}</span>
                </div>
              )}

              {org.cta_notes && (
                <div className="p-2 bg-blue-500/10 border-l-2 border-blue-500 rounded-r text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-200 font-medium flex-shrink-0 mt-0.5">
                      {ClimateIcons.announcement}
                    </span>
                    <div className="flex-1 min-w-0 text-gray-300 break-words">
                      {linkifyText(org.cta_notes)}
                    </div>
                    {(() => {
                      const url = extractFirstUrl(org.cta_notes);
                      if (!url) return null;
                      const label = deriveCtaLabel(org.cta_notes);
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-glass btn-glass-blue whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium hover:shadow-glow-blue flex items-center gap-1 flex-shrink-0"
                          title={label}
                        >
                          {ClimateIcons.website}
                          <span>{label}</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Status and Action Buttons */}
        {!isPublic && (
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
        )}
      </div>
    </div>
  );
}

export default OrganizationCard;