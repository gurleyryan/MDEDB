'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';

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

  const filteredOrgs = filter === 'all'
    ? orgs
    : orgs.filter(org => org.approval_status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-200 bg-green-800';
      case 'rejected': return 'text-red-200 bg-red-800';
      case 'pending': return 'text-yellow-200 bg-yellow-800';
      default: return 'text-gray-200 bg-gray-800';
    }
  };

  if (loading) return <div className="p-4 bg-gray-900 text-white min-h-screen">Loading orgs…</div>;
  if (error) return <div className="p-4 bg-gray-900 text-red-400 min-h-screen">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header with logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin: Manage Organizations</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
          >
            Logout
          </button>
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
        <div className="space-y-4">
          {filteredOrgs.map((org) => (
            <div key={org.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
              {/* Main org info */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white break-words">{org.org_name}</h3>
                    <p className="text-gray-300 text-sm sm:text-base">{org.country_code} • {org.type_of_work}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Alignment Score Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                      Score: {org.alignment_score !== undefined && org.alignment_score !== null ? org.alignment_score : 'N/A'}
                    </span>
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(org.approval_status)}`}>
                      {org.approval_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">Website</p>
                    <p className="text-sm text-white break-words">{org.website || 'Not provided'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">Contact Email</p>
                    <p className="text-sm text-white break-words">{org.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Years Active</p>
                    <p className="text-sm text-white">{org.years_active || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p className="text-sm text-white">{org.capacity || 'Not provided'}</p>
                  </div>
                </div>

                {org.mission_statement && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Mission Statement</p>
                    <p className="text-sm text-white break-words">{org.mission_statement}</p>
                  </div>
                )}

                {org.notable_success && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Notable Success</p>
                    <p className="text-sm text-white break-words">{org.notable_success}</p>
                  </div>
                )}

                {org.cta_notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">CTA Notes</p>
                    <p className="text-sm text-white break-words">{org.cta_notes}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={updatingId === org.id || org.approval_status === 'approved'}
                      onClick={() => updateStatus(org.id, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                    >
                      {updatingId === org.id ? '...' : 'Approve'}
                    </button>
                    <button
                      disabled={updatingId === org.id || org.approval_status === 'rejected'}
                      onClick={() => updateStatus(org.id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                    >
                      {updatingId === org.id ? '...' : 'Reject'}
                    </button>
                    <button
                      disabled={updatingId === org.id || org.approval_status === 'pending'}
                      onClick={() => updateStatus(org.id, 'pending')}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                      {updatingId === org.id ? '...' : 'Pending'}
                    </button>
                  </div>
                  <button
                    onClick={() => handleExpandOrg(org.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {expandedOrg === org.id ? 'Hide Scoring' : 'Edit Scoring'}
                  </button>
                </div>
              </div>

              {/* Expanded scoring section */}
              {expandedOrg === org.id && (
                <div className="border-t border-gray-700 bg-gray-800 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">Scoring & Evaluation</h4>
                    {/* Current alignment score display */}
                    <div className="text-sm text-gray-300">
                      Current Score: 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getAlignmentScoreColor(org.alignment_score ?? undefined)}`}>
                        {org.alignment_score !== undefined && org.alignment_score !== null ? `${org.alignment_score}/26` : 'Not scored'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">
                    <strong>Scoring Scale:</strong> 0 = Does not meet criteria, 1 = Unclear/questionable, 2 = Clearly meets criteria
                    <br />
                    <strong>Score Ranges:</strong> 
                    <span className="text-red-300 ml-2">0-12 (Low)</span>
                    <span className="text-orange-300 ml-2">13-20 (Medium)</span>
                    <span className="text-green-300 ml-2">21-26 (High)</span>
                  </p>
                  
                  {orgScores[org.id] ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scoringCriteria.map(({ key, label, description }, index) => {
                        // Calculate tooltip position based on column position
                        const isLastColumn = (index % 3) === 2; // For lg screens (3 cols)
                        const isSecondColumn = (index % 3) === 1;
                        const isLastColumnMd = (index % 2) === 1; // For md screens (2 cols)
                        
                        return (
                          <div key={key} className="relative">
                            <label className="block text-sm font-medium text-white mb-1">
                              {label}
                              <span className="ml-1 text-gray-400 cursor-help group relative">
                                ℹ️
                                {/* Smart tooltip positioning */}
                                <div className={`absolute z-50 invisible group-hover:visible bg-gray-700 text-white text-xs rounded p-3 shadow-xl border border-gray-600 w-64 ${
                                  // Desktop positioning (3 columns)
                                  isLastColumn ? 'lg:right-0 lg:left-auto' : 
                                  isSecondColumn ? 'lg:left-1/2 lg:transform lg:-translate-x-1/2' : 'lg:left-0'
                                } ${
                                  // Tablet positioning (2 columns)
                                  isLastColumnMd ? 'md:right-0 md:left-auto' : 'md:left-0'
                                } ${
                                  // Mobile positioning (always left)
                                  'left-0'
                                } top-full mt-1`}>
                                  {description}
                                  {/* Tooltip arrow */}
                                  <div className={`absolute bottom-full left-4 ${
                                    isLastColumn ? 'lg:left-auto lg:right-4' : ''
                                  } ${
                                    isLastColumnMd ? 'md:left-auto md:right-4' : ''
                                  }`}>
                                    <div className="border-4 border-transparent border-b-gray-700"></div>
                                  </div>
                                </div>
                              </span>
                            </label>
                            
                            <select
                              value={orgScores[org.id][key as keyof OrgScoring] ?? ''}
                              onChange={(e) => updateScoringField(org.id, key as keyof OrgScoring, parseInt(e.target.value))}
                              className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="">Select score</option>
                              <option value="0">0 - Does not meet</option>
                              <option value="1">1 - Unclear/questionable</option>
                              <option value="2">2 - Clearly meets</option>
                            </select>
                          </div>
                        );
                      })}
                      
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-white mb-1">
                          Comments
                        </label>
                        <textarea
                          value={orgScores[org.id].comments || ''}
                          onChange={(e) => updateScoringField(org.id, 'comments', e.target.value)}
                          className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-vertical"
                          rows={3}
                          placeholder="Additional comments or notes..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-300">Loading scoring data...</div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      disabled={savingScores === org.id}
                      onClick={() => saveScoring(org.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {savingScores === org.id ? 'Saving...' : 'Save Scores'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No organizations found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
