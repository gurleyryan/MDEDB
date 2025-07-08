'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

// Hooks
// Make sure the file exists at app/hooks/useOrganizations.ts or adjust the import path if needed.
import { useOrganizations } from '../hooks/useOrganizations';
import { useScoring } from '../hooks/useScoring';
import { useAutoWebsiteMetadata } from '../hooks/useWebsiteMetadata';

// Components
import AdminHeader from '../components/AdminHeader';
import OrganizationCard from '../components/OrganizationCard';
import AddOrganizationModal from '../components/AddOrganizationModal';

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

  const { websiteMetadata } = useAutoWebsiteMetadata(orgs);

  // Local state
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showRejected, setShowRejected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Get filtered organizations and counts
  const filteredOrgs = getFilteredOrgs(filter, showRejected);
  const orgCounts = getOrgCounts();

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Header */}
      <AdminHeader
        filter={filter}
        onFilterChange={setFilter}
        showRejected={showRejected}
        onToggleRejected={() => setShowRejected(!showRejected)}
        onAddNew={() => setShowAddForm(true)}
        onLogout={handleLogout}
        orgCounts={orgCounts}
        isLoading={loading}
      />

      {/* Main Content */}
      <div className="p-4 max-w-7xl mx-auto">
        {/* Organization Cards */}
        <div className="space-y-6">
          {filteredOrgs.map((org, index) => (
            <OrganizationCard
              key={org.id}
              org={org}
              metadata={websiteMetadata[org.id]}
              scores={orgScores[org.id]}
              isExpanded={expandedOrg === org.id}
              isEditing={editingOrg === org.id}
              updatingId={updatingId}
              savingScores={savingScores}
              onExpand={handleExpandOrg}
              onEdit={(org) => setEditingOrg(org.id)}
              onSave={handleOrganizationSave}
              onCancel={() => setEditingOrg(null)}
              onStatusUpdate={updateStatus}
              onScoreUpdate={updateScoringField}
              onScoringSave={handleScoringSave}
            />
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
              {filter === 'all' ? '📋' : 
               filter === 'pending' ? '⏳' : 
               filter === 'approved' ? '✅' : '❌'}
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              No {filter === 'all' ? '' : filter} organizations found
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Get started by adding your first organization.'
                : `There are no ${filter} organizations to display.`
              }
              {!showRejected && filter !== 'rejected' && orgCounts.rejected > 0 && (
                <> You can also show rejected organizations using the toggle above.</>
              )}
            </p>
            {filter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-500 transition-colors shadow-lg"
              >
                ➕ Add Your First Organization
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Quick Stats */}
        {filteredOrgs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              📊 Quick Stats for {filter === 'all' ? 'All Organizations' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Organizations`}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  {Object.keys(orgScores).length}
                </div>
                <div className="text-gray-400">Scored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {filteredOrgs.filter(org => org.alignment_score && org.alignment_score >= 21).length}
                </div>
                <div className="text-gray-400">Strong Candidates</div>
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
  );
}
