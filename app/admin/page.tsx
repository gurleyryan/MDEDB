'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { getScoringProgress } from '../utils/scoring';

// Hooks
// Make sure the file exists at app/hooks/useOrganizations.ts or adjust the import path if needed.
import { useOrganizations } from '../hooks/useOrganizations';
import { useScoring } from '../hooks/useScoring';
import { useAutoWebsiteMetadata } from '../hooks/useWebsiteMetadata';

// Components
import AdminHeader from '../components/AdminHeader';
import OrganizationCard from '../components/OrganizationCard';
import AddOrganizationModal from '../components/AddOrganizationModal';
import ScoringSection from '../components/ScoringSection';
import type { OrgWithScore } from '../../models/orgWithScore';

export default function AdminOrgs() {
  const router = useRouter();
  
  // Hooks
  const {
    orgs,
    loading,
    error,
    updatingId,
    updateStatus,
    addOrganization,
    updateOrganization,
    getFilteredOrgs,
    getOrgCounts
  } = useOrganizations();

  const {
    orgScores,
    savingScores,
    updateScoringField,
    saveScoring,
    fetchOrgScoring
  } = useScoring();

  const { 
    websiteMetadata, 
    loadingMetadata, 
    error: metadataError,
    retryAttempts 
  } = useAutoWebsiteMetadata(orgs);

  // Enhanced local state for organizational tools
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showRejected, setShowRejected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // New organizational tool states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOptions, setSortOptions] = useState<{
    field: 'name' | 'score' | 'status' | 'country' | 'recent' | 'website';
    direction: 'asc' | 'desc';
  }>({ field: 'name', direction: 'asc' });
  
  const [filterOptions, setFilterOptions] = useState<{
    status: 'all' | 'pending' | 'approved' | 'rejected';
    continent: string;
    scoreRange: string;
    hasWebsite: boolean | null;
  }>({
    status: 'all',
    continent: 'all',
    scoreRange: 'all',
    hasWebsite: null,
  });

  // Calculate metadata loading progress
  const orgsWithWebsites = orgs.filter(org => org.website);
  const loadingCount = Object.values(loadingMetadata).filter(Boolean).length;
  const loadedCount = orgsWithWebsites.filter(org => websiteMetadata[org.id]).length;
  const totalCount = orgsWithWebsites.length;
  const progressPercentage = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 100;

  // Enhanced filtering and sorting logic
  const getProcessedOrgs = () => {
    let processed = [...orgs];

    // Apply status filter
    if (filter !== 'all') {
      processed = processed.filter(org => org.approval_status === filter);
    }

    // Hide rejected orgs unless specifically showing them
    if (!showRejected && filter !== 'rejected') {
      processed = processed.filter(org => org.approval_status !== 'rejected');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      processed = processed.filter(org => 
        org.org_name.toLowerCase().includes(query) ||
        org.country_code.toLowerCase().includes(query) ||
        org.type_of_work?.toLowerCase().includes(query) ||
        org.mission_statement?.toLowerCase().includes(query) ||
        org.website?.toLowerCase().includes(query) ||
        org.email?.toLowerCase().includes(query)
      );
    }

    // Apply continent filter
    if (filterOptions.continent !== 'all') {
      processed = processed.filter(org => {
        const continent = getOrgContinent(org.country_code);
        return continent === filterOptions.continent;
      });
    }

    // Apply score range filter
    if (filterOptions.scoreRange !== 'all') {
      processed = processed.filter(org => {
        const score = org.alignment_score;
        switch (filterOptions.scoreRange) {
          case 'strong':
            return score !== null && score >= 21;
          case 'promising':
            return score !== null && score >= 13 && score <= 20;
          case 'low':
            return score !== null && score <= 12;
          case 'unscored':
            return score === null || score === undefined;
          default:
            return true;
        }
      });
    }

    // Apply website filter
    if (filterOptions.hasWebsite !== null) {
      processed = processed.filter(org => 
        filterOptions.hasWebsite ? !!org.website : !org.website
      );
    }

    // Apply sorting
    processed.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'name':
          comparison = a.org_name.localeCompare(b.org_name);
          break;
        case 'score':
          const scoreA = a.alignment_score || 0;
          const scoreB = b.alignment_score || 0;
          comparison = scoreA - scoreB;
          break;
        case 'status':
          const statusOrder = { pending: 0, approved: 1, rejected: 2, under_review: 3 };
          comparison = statusOrder[a.approval_status] - statusOrder[b.approval_status];
          break;
        case 'country':
          comparison = a.country_code.localeCompare(b.country_code);
          break;
        case 'recent':
          // Use a fallback if created_at does not exist
          const dateA = new Date((a as any).created_at || 0);
          const dateB = new Date((b as any).created_at || 0);
          comparison = dateB.getTime() - dateA.getTime();
          break;
        case 'website':
          const hasWebsiteA = !!a.website;
          const hasWebsiteB = !!b.website;
          comparison = hasWebsiteA === hasWebsiteB ? 0 : hasWebsiteA ? -1 : 1;
          break;
        default:
          comparison = 0;
      }
      
      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    return processed;
  };

  // Helper function to get continent from country code
  const getOrgContinent = (countryCode: string): string => {
    const continentMap: Record<string, string> = {
      'US': 'North America', 'CA': 'North America', 'MX': 'North America',
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America',
      'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'NL': 'Europe',
      'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'KR': 'Asia', 'TH': 'Asia', 'VN': 'Asia',
      'NG': 'Africa', 'ZA': 'Africa', 'KE': 'Africa', 'GH': 'Africa', 'EG': 'Africa', 'MA': 'Africa',
      'AE': 'Middle East', 'SA': 'Middle East', 'IL': 'Middle East', 'TR': 'Middle East',
      'AU': 'Oceania', 'NZ': 'Oceania'
    };
    
    return continentMap[countryCode] || 'Unknown';
  };

  // Get processed organizations
  const filteredOrgs = getProcessedOrgs();
  const orgCounts = getOrgCounts();

  // Update filter options when main filter changes
  useEffect(() => {
    setFilterOptions(prev => ({ ...prev, status: filter }));
  }, [filter]);

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      router.push('/login');
    }
  };

  // Handle organization expansion for scoring
  const handleExpandOrg = async (orgId: string) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      // Fetch scoring data if not already loaded
      if (!orgScores[orgId]) {
        await fetchOrgScoring(orgId);
      }
    }
  };

  // Handle scoring save
  const handleScoringSave = async (orgId: string): Promise<boolean> => {
    return await saveScoring(orgId);
  };

  // Handle organization save (editing)
  const handleOrganizationSave = async (orgId: string, data: any): Promise<boolean> => {
    const success = await updateOrganization(orgId, data);
    if (success) {
      setEditingOrg(null);
    }
    return success;
  };

  // Handle adding new organization
  const handleAddOrganization = async (orgData: any): Promise<boolean> => {
    return await addOrganization(orgData);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Organizations</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  function handleEditOrg(org: OrgWithScore): void {
    setEditingOrg(org.id);
  }

  async function handleSaveOrg(orgId: string, data: Partial<OrgWithScore>): Promise<boolean> {
    return await handleOrganizationSave(orgId, data);
  }

  function handleCancelEdit(): void {
    setEditingOrg(null);
  }

  async function handleStatusUpdate(orgId: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
    await updateOrganization(orgId, { approval_status: status });
    if (editingOrg === orgId) {
      setEditingOrg(null);
    }
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Stained glass background overlay */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 10, 0.98))
          `
        }}
      />
      
      {/* Content with glass panels */}
      <div className="relative z-10">
        {/* Enhanced Admin Header */}
        <AdminHeader
          filter={filter}
          onFilterChange={setFilter}
          showRejected={showRejected}
          onToggleRejected={() => setShowRejected(!showRejected)}
          onAddNew={() => setShowAddForm(true)}
          onLogout={handleLogout}
          orgCounts={orgCounts}
          isLoading={loading}
          metadataProgress={{
            loaded: loadedCount,
            total: totalCount,
            loading: loadingCount,
            percentage: progressPercentage
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOptions={sortOptions}
          onSortChange={setSortOptions}
          filterOptions={filterOptions}
          onFilterOptionsChange={setFilterOptions}
          filteredCount={filteredOrgs.length}
          totalOrgs={orgs.length}
        />

        {/* Metadata Error Banner */}
        {metadataError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-600/20 border-b border-orange-500/30 p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-orange-400">⚠️</span>
                <span className="text-sm text-orange-200">{metadataError}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-orange-300 hover:text-orange-100 underline"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="p-4 max-w-7xl mx-auto">
          {/* Organization Cards without Framer Motion */}
          <div className="space-y-6 relative">
            {filteredOrgs.map((org, index) => (
              <div
                key={org.id}
                className="will-change-auto relative"
                style={{ 
                  zIndex: Math.max(1, 100 - index),
                  animation: `fadeIn 0.2s ease-out ${index * 0.02}s both`
                }}
              >
                <div className="space-y-0">
                  {/* Organization Card */}
                  <OrganizationCard
                    org={org}
                    metadata={websiteMetadata[org.id]}
                    scores={orgScores[org.id]}
                    isExpanded={expandedOrg === org.id}
                    isEditing={editingOrg === org.id}
                    updatingId={updatingId}
                    savingScores={savingScores}
                    onExpand={handleExpandOrg}
                    onEdit={handleEditOrg}
                    onSave={handleSaveOrg}
                    onCancel={handleCancelEdit}
                    onStatusUpdate={handleStatusUpdate}
                    onScoreUpdate={updateScoringField}
                    onScoringSave={handleScoringSave}
                  />
                  
                  {/* Separate Scoring Section */}
                  <ScoringSection
                    orgId={org.id}
                    orgName={org.org_name}
                    scores={orgScores[org.id]}
                    isExpanded={expandedOrg === org.id}
                    savingScores={savingScores}
                    onScoreUpdate={updateScoringField}
                    onScoringSave={handleScoringSave}
                    onToggleExpanded={handleExpandOrg}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOrgs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">
                {searchQuery ? '🔍' : filter === 'all' ? '📋' : 
                 filter === 'pending' ? '⏳' : 
                 filter === 'approved' ? '✅' : '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                {searchQuery ? `No results for "${searchQuery}"` : 
                 `No ${filter === 'all' ? '' : filter} organizations found`}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search terms or filters.' :
                 filter === 'all' 
                  ? 'Get started by adding your first organization.'
                  : `There are no ${filter} organizations to display.`
                }
              </p>
              
              {/* Quick Actions for Empty State */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {filter === 'all' && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors"
                  >
                    ➕ Add Your First Organization
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Enhanced Quick Stats */}
          {filteredOrgs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-200">
                📊 Results Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{filteredOrgs.length}</div>
                  <div className="text-gray-400">Showing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {filteredOrgs.filter(org => org.website).length}
                  </div>
                  <div className="text-gray-400">With Websites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {filteredOrgs.filter(org => org.alignment_score !== null && org.alignment_score !== undefined).length}
                  </div>
                  <div className="text-gray-400">Scored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {filteredOrgs.filter(org => org.alignment_score && org.alignment_score >= 21).length}
                  </div>
                  <div className="text-gray-400">Strong Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {loadedCount}/{totalCount}
                  </div>
                  <div className="text-gray-400">Metadata Loaded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {new Set(filteredOrgs.map(org => getOrgContinent(org.country_code))).size}
                  </div>
                  <div className="text-gray-400">Continents</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Organization Modal */}
        <AddOrganizationModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddOrganization}
          isSubmitting={updatingId === 'new'}
        />

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}
