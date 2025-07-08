'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';
import { motion } from 'framer-motion';

// Add this interface for website metadata
interface WebsiteMetadata {
  image?: string;
  favicon?: string;
  title?: string;
  description?: string;
}

// Add this interface for scoring
interface OrgScoring {
  id?: string;
  org_id: string;
  impact_track_record?: number;
  local_legitimacy?: number;
  transparency?: number;
  scalability?: number;
  digital_presence?: number;
  alignment?: number;
  urgency_relevance?: number;
  clear_actionable_cta?: number;
  show_ready_cta?: number;
  scalable_impact?: number;
  accessibility?: number;
  global_regional_fit?: number;
  volunteer_pipeline?: number;
  comments?: string;
}

export default function AdminOrgs() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [orgScores, setOrgScores] = useState<Record<string, OrgScoring>>({});
  const [savingScores, setSavingScores] = useState<string | null>(null);
  const [websiteMetadata, setWebsiteMetadata] = useState<Record<string, WebsiteMetadata>>({});

  // New state variables for editing and adding organizations
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Org>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState<Partial<Org>>({
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
  const [showRejected, setShowRejected] = useState(false);

  // Scoring criteria with descriptions
  const scoringCriteria = [
    { 
      key: 'impact_track_record', 
      label: 'Impact Track Record',
      description: 'Tangible, verifiable outcomes in their community or issue area. Does the org have a history of successful campaigns, legislative wins, or media presence indicating credibility?'
    },
    { 
      key: 'local_legitimacy', 
      label: 'Local Legitimacy',
      description: 'Community-led, trusted, and not extractive. Are they embedded in and accountable to the communities they serve?'
    },
    { 
      key: 'transparency', 
      label: 'Transparency',
      description: 'Are financials, leadership, mission, and decision-making processes clearly communicated and publicly available?'
    },
    { 
      key: 'scalability', 
      label: 'Scalability',
      description: 'Can they absorb increased attention, donations, or volunteer traffic without bottlenecks or collapse?'
    },
    { 
      key: 'digital_presence', 
      label: 'Digital Presence',
      description: 'Do they maintain an up-to-date website and/or social media presence? Are there clear channels for contact or involvement?'
    },
    { 
      key: 'alignment', 
      label: 'Alignment',
      description: 'Does their mission align with climate justice and nonviolent organizing, especially in accordance with UN SDG 13 (Climate Action)?'
    },
    { 
      key: 'urgency_relevance', 
      label: 'Urgency & Relevance',
      description: 'Are they addressing a timely and critical ecological or justice-related issue?'
    },
    { 
      key: 'clear_actionable_cta', 
      label: 'Clear, Actionable CTA',
      description: 'Is there an immediate, specific action to take (e.g., donate, sign up, text-to-join)? Is it feasible for a general audience?'
    },
    { 
      key: 'show_ready_cta', 
      label: 'Show-Ready CTA',
      description: 'Is the CTA executable in real-time at events (concerts, festivals), e.g., QR code, text-to-join, or mobile-optimized sign-up?'
    },
    { 
      key: 'scalable_impact', 
      label: 'Scalable Impact',
      description: 'Is the organization contributing to systemic change, and not just symbolic or hyper-local wins?'
    },
    { 
      key: 'accessibility', 
      label: 'Accessibility',
      description: 'Are their materials mobile-friendly, readable by non-experts, and available in multiple languages or formats?'
    },
    { 
      key: 'global_regional_fit', 
      label: 'Global or Regional Fit',
      description: 'Does their geography and issue area provide international or underserved-region representation for AMPLIFY?'
    },
    { 
      key: 'volunteer_pipeline', 
      label: 'Volunteer Pipeline',
      description: 'Does involvement lead to deeper, ongoing engagement, and not just a one-off action?'
    }
  ];

  // Function to get website metadata
  const getWebsiteMetadata = async (url: string): Promise<WebsiteMetadata> => {
    try {
      // Validate URL first
      let validUrl: string;
      try {
        validUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(validUrl); // Validate URL format
      } catch (urlError) {
        console.error('Invalid URL:', url);
        return {
          title: url,
          description: 'Invalid URL format',
          image: `https://via.placeholder.com/1200x630/666666/ffffff?text=Invalid+URL`,
          favicon: 'https://via.placeholder.com/64x64/666666/ffffff?text=?',
        };
      }

      // Call our API route
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      
      const metadata = await response.json();
      
      return {
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        favicon: metadata.favicon,
      };
      
    } catch (error) {
      console.error('Error fetching metadata:', error);
      
      // Return fallback metadata
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      return {
        title: domain,
        description: 'Climate organization working for environmental justice',
        image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(domain)}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    }
  };

  // Function to get regional theme based on country code
  const getRegionalTheme = (countryCode: string) => {
    const regions = {
      // Africa - warm earth tones
      'NG': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
      'KE': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
      'ZA': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
      'GH': 'from-orange-500/20 via-yellow-500/10 to-red-500/20',
      
      // Europe - cool greens
      'DE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      'FR': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      'UK': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      'NL': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      'SE': 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      
      // Americas - blues and greens
      'US': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
      'CA': 'from-blue-500/20 via-cyan-500/10 to-green-500/20',
      'BR': 'from-green-600/20 via-yellow-500/10 to-blue-500/20',
      'MX': 'from-green-500/20 via-red-500/10 to-yellow-500/20',
      
      // Asia Pacific - ocean blues
      'AU': 'from-blue-600/20 via-teal-500/10 to-cyan-500/20',
      'JP': 'from-blue-500/20 via-purple-500/10 to-pink-500/20',
      'IN': 'from-orange-500/20 via-green-500/10 to-blue-500/20',
      'CN': 'from-red-500/20 via-yellow-500/10 to-green-500/20',
      
      // Default
      'default': 'from-emerald-500/20 via-green-500/10 to-teal-500/20'
    };
    
    return regions[countryCode as keyof typeof regions] || regions.default;
  };

  // Function to get accent color based on region
  const getAccentColor = (countryCode: string) => {
    const colors = {
      'NG': 'border-orange-500/30 hover:border-orange-400',
      'KE': 'border-orange-500/30 hover:border-orange-400',
      'ZA': 'border-orange-500/30 hover:border-orange-400',
      'DE': 'border-green-500/30 hover:border-green-400',
      'FR': 'border-green-500/30 hover:border-green-400',
      'UK': 'border-green-500/30 hover:border-green-400',
      'US': 'border-blue-500/30 hover:border-blue-400',
      'CA': 'border-blue-500/30 hover:border-blue-400',
      'BR': 'border-green-600/30 hover:border-green-500',
      'AU': 'border-blue-600/30 hover:border-blue-500',
      'default': 'border-emerald-500/30 hover:border-emerald-400'
    };
    
    return colors[countryCode as keyof typeof colors] || colors.default;
  };

  // 🔐 Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  // 🗂️ Fetch orgs
  useEffect(() => {
    fetchOrgs();
  }, []);

  // 🚪 Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError('Error logging out: ' + error.message);
    } else {
      router.push('/login');
    }
  };

  // Add function to get alignment score color
  const getAlignmentScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-gray-200 bg-gray-700';
    if (score <= 12) return 'text-red-200 bg-red-800';
    if (score <= 20) return 'text-orange-200 bg-orange-800';
    return 'text-green-200 bg-green-800';
  };

  // Update fetchOrgs to include alignment_score from the view
  async function fetchOrgs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('org_with_score') // Use the view that includes calculated alignment_score
      .select('*')
      .order('org_name');

    if (error) setError(error.message);
    else setOrgs(data || []);
    setLoading(false);
  }

  async function fetchOrgScoring(orgId: string) {
    const { data, error } = await supabase
      .from('org_scoring')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching scores:', error);
      return;
    }

    // If no scoring exists, create empty scoring object
    const scoring = data || {
      org_id: orgId,
      impact_track_record: undefined,
      local_legitimacy: undefined,
      transparency: undefined,
      scalability: undefined,
      digital_presence: undefined,
      alignment: undefined,
      urgency_relevance: undefined,
      clear_actionable_cta: undefined,
      show_ready_cta: undefined,
      scalable_impact: undefined,
      accessibility: undefined,
      global_regional_fit: undefined,
      volunteer_pipeline: undefined,
      comments: ''
    };

    setOrgScores(prev => ({ ...prev, [orgId]: scoring }));
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    setUpdatingId(id);
    const { error } = await supabase
      .from('org')
      .update({ approval_status: status })
      .eq('id', id);

    setUpdatingId(null);
    if (error) {
      setError(error.message);
    } else {
      setOrgs(prevOrgs =>
        prevOrgs.map(org =>
          org.id === id ? { ...org, approval_status: status } : org
        )
      );
    }
  }

  async function saveScoring(orgId: string) {
    setSavingScores(orgId);
    const scoring = orgScores[orgId];
    
    if (!scoring) return;

    const { error } = await supabase
      .from('org_scoring')
      .upsert({
        ...scoring,
        org_id: orgId,
        updated_at: new Date().toISOString()
      });

    setSavingScores(null);
    if (error) {
      setError('Error saving scores: ' + error.message);
    } else {
      // Refresh the scoring data
      await fetchOrgScoring(orgId);
    }
  }

  const handleExpandOrg = async (orgId: string) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      if (!orgScores[orgId]) {
        await fetchOrgScoring(orgId);
      }
    }
  };

  const updateScoringField = (orgId: string, field: keyof OrgScoring, value: number | string) => {
    setOrgScores(prev => ({
      ...prev,
      [orgId]: {
        ...prev[orgId],
        [field]: value
      }
    }));
  };

  // Update the filter logic to handle rejected orgs visibility:
  const filteredOrgs = (() => {
    let filtered = orgs;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(org => org.approval_status === filter);
    }
    
    // Hide rejected orgs unless specifically showing them
    if (!showRejected && filter !== 'rejected') {
      filtered = filtered.filter(org => org.approval_status !== 'rejected');
    }
    
    return filtered;
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-200 bg-green-800';
      case 'rejected': return 'text-red-200 bg-red-800';
      case 'pending': return 'text-yellow-200 bg-yellow-800';
      default: return 'text-gray-200 bg-gray-800';
    }
  };

  // Fetch metadata when component mounts
  useEffect(() => {
    const fetchAllMetadata = async () => {
      const metadataPromises = orgs
        .filter(org => org.website)
        .map(async (org) => {
          const metadata = await getWebsiteMetadata(org.website!);
          
          // ADD THIS DEBUG LOG
          if (org.org_name.includes('350 Canada')) {
            console.log('350 Canada metadata:', metadata);
          }
          
          return { id: org.id, metadata };
        });
      
      const results = await Promise.all(metadataPromises);
      const metadataMap = results.reduce((acc, { id, metadata }) => {
        acc[id] = metadata;
        return acc;
      }, {} as Record<string, WebsiteMetadata>);
      
      setWebsiteMetadata(metadataMap);
    };

    if (orgs.length > 0) {
      fetchAllMetadata();
    }
  }, [orgs]);

  // Function to start editing an org
  const startEdit = (org: OrgWithScore) => {
    setEditingOrg(org.id);
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
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingOrg(null);
    setEditForm({});
  };

  // Function to save edited org
  const saveEdit = async () => {
    if (!editingOrg) return;
    
    setUpdatingId(editingOrg);
    const { error } = await supabase
      .from('org')
      .update(editForm)
      .eq('id', editingOrg);

    setUpdatingId(null);
    if (error) {
      setError('Error updating organization: ' + error.message);
    } else {
      // Update local state
      setOrgs(prevOrgs =>
        prevOrgs.map(org =>
          org.id === editingOrg ? { ...org, ...editForm } : org
        )
      );
      setEditingOrg(null);
      setEditForm({});
    }
  };

  // Function to add new org
  const addNewOrg = async () => {
    if (!newOrgForm.org_name || !newOrgForm.country_code) {
      setError('Organization name and country are required');
      return;
    }

    setUpdatingId('new');
    const { data, error } = await supabase
      .from('org')
      .insert([newOrgForm])
      .select()
      .single();

    setUpdatingId(null);
    if (error) {
      setError('Error adding organization: ' + error.message);
    } else {
      // Add to local state
      setOrgs(prevOrgs => [{ ...data, alignment_score: null }, ...prevOrgs]);
      setShowAddForm(false);
      setNewOrgForm({
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
    }
  };

  // Function to handle form field changes
  const handleEditFieldChange = (field: keyof Org, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewOrgFieldChange = (field: keyof Org, value: string) => {
    setNewOrgForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-4 bg-gray-900 text-white min-h-screen">Loading orgs…</div>;
  if (error) return <div className="p-4 bg-gray-900 text-red-400 min-h-screen">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header with logout and controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin: Manage Organizations</h1>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors shadow-lg"
            >
              ➕ Add New Org
            </motion.button>
            <button
              onClick={() => setShowRejected(!showRejected)}
              className={`px-3 py-2 rounded text-sm ${
                showRejected 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors`}
            >
              {showRejected ? '🙈 Hide Rejected' : '👁️ Show Rejected'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded capitalize text-sm sm:text-base ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status} ({status === 'all' ? orgs.length : orgs.filter(org => org.approval_status === status).length})
            </button>
          ))}
        </div>

        {/* Organization Cards */}
        <div className="space-y-6">
          {filteredOrgs.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getRegionalTheme(org.country_code)} backdrop-blur-sm border ${getAccentColor(org.country_code)} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}
            >
              {/* Banner Image - only render if image exists and loads successfully */}
              {websiteMetadata[org.id]?.image && !websiteMetadata[org.id]?.image?.includes('placeholder') && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={websiteMetadata[org.id].image}
                    alt={`${org.org_name} banner`}
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      // Hide the banner container if image fails to load
                      const container = e.currentTarget.parentElement;
                      if (container) container.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                  
                  {/* Mission Statement Overlay - show full text with proper wrapping */}
                  {org.mission_statement && (
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
                {editingOrg === org.id ? (
                  // Edit mode - inline form
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={editForm.org_name || ''}
                        onChange={(e) => handleEditFieldChange('org_name', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-xl font-bold focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Website</label>
                        <input
                          type="url"
                          value={editForm.website || ''}
                          onChange={(e) => handleEditFieldChange('website', e.target.value)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Email</label>
                        <textarea
                          value={editForm.email || ''}
                          onChange={(e) => handleEditFieldChange('email', e.target.value)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                          placeholder="Multiple emails separated by commas or line breaks"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Country Code</label>
                        <input
                          type="text"
                          value={editForm.country_code || ''}
                          onChange={(e) => handleEditFieldChange('country_code', e.target.value.toUpperCase())}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                          maxLength={2}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Type of Work</label>
                        <input
                          type="text"
                          value={editForm.type_of_work || ''}
                          onChange={(e) => handleEditFieldChange('type_of_work', e.target.value)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Years Active</label>
                        <input
                          type="text"
                          value={editForm.years_active || ''}
                          onChange={(e) => handleEditFieldChange('years_active', e.target.value)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 2013–present, 2018–2023"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                        <input
                          type="text"
                          value={editForm.capacity || ''}
                          onChange={(e) => handleEditFieldChange('capacity', e.target.value)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mission Statement</label>
                      <textarea
                        value={editForm.mission_statement || ''}
                        onChange={(e) => handleEditFieldChange('mission_statement', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Notable Success</label>
                      <textarea
                        value={editForm.notable_success || ''}
                        onChange={(e) => handleEditFieldChange('notable_success', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">CTA Notes</label>
                      <textarea
                        value={editForm.cta_notes || ''}
                        onChange={(e) => handleEditFieldChange('cta_notes', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none h-20 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  // Normal display mode
                  <>
                    {/* Mission Statement as header if no banner - show full text */}
                    {org.mission_statement && (!websiteMetadata[org.id]?.image || websiteMetadata[org.id]?.image?.includes('placeholder')) && (
                      <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                        <blockquote className="text-blue-100 text-sm font-medium italic leading-relaxed">
                          "{org.mission_statement}"
                        </blockquote>
                      </div>
                    )}

                    {/* Header with favicon and badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Show favicon - be more permissive about what we display */}
                        {websiteMetadata[org.id]?.favicon && !websiteMetadata[org.id]?.favicon?.includes('placeholder') ? (
                          <img
                            src={websiteMetadata[org.id].favicon}
                            alt=""
                            className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 p-1"
                            onError={(e) => {
                              // Hide the favicon if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : org.website ? (
                          // Fallback to Google favicon service if no favicon found
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${(() => {
                              try {
                                return new URL(org.website.startsWith('http') ? org.website : `https://${org.website}`).hostname;
                              } catch {
                                return org.website.replace(/^https?:\/\//, '').split('/')[0];
                              }
                            })()}&sz=64`}
                            alt=""
                            className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-1 break-words">
                            {org.org_name}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {org.country_code} • {org.type_of_work}
                          </p>
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
                          {(() => {
                            try {
                              // Try to create a URL object to validate the URL
                              const url = new URL(org.website.startsWith('http') ? org.website : `https://${org.website}`);
                              return (
                                <a
                                  href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate"
                                >
                                  {url.hostname}
                                </a>
                              );
                            } catch (error) {
                              // If URL is invalid, just display the text without making it a link
                              return (
                                <span className="text-sm text-gray-400 truncate">
                                  {org.website} (invalid URL)
                                </span>
                              );
                            }
                          })()}
                        </div>
                      )}
                      
                      {org.email && (
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">📧</span>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            {org.email
                              .split(/[\s,\n\r]+/) // Split on whitespace, commas, and line breaks
                              .map(email => email.trim())
                              .filter(email => email && email.includes('@')) // Only keep valid-looking emails
                              .map((email, index) => (
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

                {/* Action Buttons - same as before */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    {editingOrg === org.id ? (
                      // Edit mode buttons
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={saveEdit}
                          disabled={updatingId === org.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors shadow-lg"
                        >
                          {updatingId === org.id ? 'Saving...' : '💾 Save'}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={cancelEdit}
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
                          onClick={() => updateStatus(org.id, 'approved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors shadow-lg"
                        >
                          {updatingId === org.id ? '...' : '✓ Approve'}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={updatingId === org.id || org.approval_status === 'rejected'}
                          onClick={() => updateStatus(org.id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors shadow-lg"
                        >
                          {updatingId === org.id ? '...' : '✗ Reject'}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={updatingId === org.id || org.approval_status === 'pending'}
                          onClick={() => updateStatus(org.id, 'pending')}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors shadow-lg"
                        >
                          {updatingId === org.id ? '...' : '⏳ Pending'}
                        </motion.button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingOrg !== org.id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startEdit(org)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors shadow-lg"
                      >
                        ✏️ Edit
                      </motion.button>
                    )}
                    
                    {org.website && editingOrg !== org.id && (() => {
                      try {
                        new URL(org.website.startsWith('http') ? org.website : `https://${org.website}`);
                        return (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg"
                          >
                            🔗 Visit Site
                          </motion.a>
                        );
                      } catch (error) {
                        return null;
                      }
                    })()}
                    
                    {editingOrg !== org.id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExpandOrg(org.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg"
                      >
                        {expandedOrg === org.id ? '📊 Hide Scoring' : '📊 Edit Scoring'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded scoring section - keep existing implementation */}
              {expandedOrg === org.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-700 bg-gray-900/90 p-6"
                >
                  {/* Your existing scoring implementation here */}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No organizations found for the selected filter.
          </div>
        )}
      </div>

      {/* Add New Org Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Organization</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newOrgForm.org_name || ''}
                    onChange={(e) => handleNewOrgFieldChange('org_name', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country Code *
                  </label>
                  <input
                    type="text"
                    value={newOrgForm.country_code || ''}
                    onChange={(e) => handleNewOrgFieldChange('country_code', e.target.value.toUpperCase())}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., US, CA, UK"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={newOrgForm.website || ''}
                    onChange={(e) => handleNewOrgFieldChange('website', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.org"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newOrgForm.email || ''}
                    onChange={(e) => handleNewOrgFieldChange('email', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="contact@example.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type of Work</label>
                  <input
                    type="text"
                    value={newOrgForm.type_of_work || ''}
                    onChange={(e) => handleNewOrgFieldChange('type_of_work', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Advocacy, Education, Direct Action"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Years Active</label>
                  <input
                    type="text"
                    value={newOrgForm.years_active || ''}
                    onChange={(e) => handleNewOrgFieldChange('years_active', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 2013–present, 2018–2023"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mission Statement</label>
                <textarea
                  value={newOrgForm.mission_statement || ''}
                  onChange={(e) => handleNewOrgFieldChange('mission_statement', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-24 resize-none"
                  placeholder="Enter the organization's mission statement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notable Success</label>
                <textarea
                  value={newOrgForm.notable_success || ''}
                  onChange={(e) => handleNewOrgFieldChange('notable_success', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                  placeholder="Describe a key achievement or success story"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addNewOrg}
                  disabled={updatingId === 'new' || !newOrgForm.org_name || !newOrgForm.country_code}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
                >
                  {updatingId === 'new' ? 'Adding...' : 'Add Organization'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
