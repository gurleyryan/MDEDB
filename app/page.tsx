'use client';
import { useState, useEffect } from 'react';
import { useOrganizations } from './hooks/useOrganizations';
import { useAutoWebsiteMetadata } from './hooks/useWebsiteMetadata';
import OrganizationCard from './components/OrganizationCard';
import PublicHeader from './components/PublicHeader';

export default function HomePage() {
  const { orgs, loading, error } = useOrganizations({ forcePublic: true });
  const { websiteMetadata, loadingMetadata } = useAutoWebsiteMetadata(orgs);

  // State for search, sort, filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOptions, setSortOptions] = useState<{
    field: 'name' | 'country' | 'recent' | 'website';
    direction: 'asc' | 'desc';
  }>({ field: 'name', direction: 'asc' });
  const [filterOptions, setFilterOptions] = useState<{ continent: string }>({ continent: 'all' });
  const [isSearching, setIsSearching] = useState(false);

  // Progress for metadata loading
  const orgsWithWebsites = orgs.filter(org => org.website);
  const loadingCount = Object.values(loadingMetadata).filter(Boolean).length;
  const loadedCount = orgsWithWebsites.filter(org => websiteMetadata[org.id]).length;
  const totalCount = orgsWithWebsites.length;
  const progressPercentage = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 100;

  // Helper: get continent from country code
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

  // Filtering, searching, sorting (only approved orgs)
  const getProcessedOrgs = () => {
    let processed = [...orgs];

    // Search
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

    // Continent filter
    if (filterOptions.continent !== 'all') {
      processed = processed.filter(org => {
        const continent = getOrgContinent(org.country_code);
        return continent === filterOptions.continent;
      });
    }

    // Sorting
    processed.sort((a, b) => {
      let comparison = 0;
      switch (sortOptions.field) {
        case 'name':
          comparison = a.org_name.localeCompare(b.org_name);
          break;
        case 'country':
          comparison = a.country_code.localeCompare(b.country_code);
          break;
        case 'recent': {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
        }
        case 'website': {
          const hasWebsiteA = !!a.website;
          const hasWebsiteB = !!b.website;
          comparison = hasWebsiteA === hasWebsiteB ? 0 : hasWebsiteA ? 1 : -1;
          break;
        }
        default:
          comparison = 0;
      }
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return processed;
  };

  const filteredOrgs = getProcessedOrgs();

  // Search handler with loading indicator
  const handleSearchChange = (value: string) => {
    setIsSearching(true);
    setSearchQuery(value);
    setTimeout(() => setIsSearching(false), 300);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader
        isLoading={loading}
        metadataProgress={{
          loaded: loadedCount,
          total: totalCount,
          loading: loadingCount,
          percentage: progressPercentage
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortOptions={sortOptions}
        onSortChange={setSortOptions}
        filterOptions={filterOptions}
        onFilterOptionsChange={setFilterOptions}
        filteredCount={filteredOrgs.length}
        totalOrgs={orgs.length}
        isSearching={isSearching}
      />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {filteredOrgs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No organizations found.</div>
        ) : (
          <div className="space-y-6">
            {filteredOrgs.map(org => (
              <OrganizationCard
                key={org.id}
                org={org}
                metadata={websiteMetadata[org.id]}
                isExpanded={false}
                isEditing={false}
                updatingId={null}
                savingScores=""
                onExpand={() => {}}
                onEdit={() => {}}
                onSave={async (_orgId: string, _data: Partial<any>) => false}
                onCancel={() => {}}
                onStatusUpdate={() => {}}
                isPublic={true}
                onScoreUpdate={() => {}}
                onScoringSave={async () => false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}