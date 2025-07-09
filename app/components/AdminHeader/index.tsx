'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CustomDropdown } from '../CustomDropdown';
import { 
  getContinentOptions, 
  getScoreRangeOptions, 
  getWebsiteStatusOptions, 
  getSortFieldOptions 
} from '../../utils/selectOptions';
import { professionalTransition, snapTransition, expandTransition } from '../../utils/motion';

interface OrgCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface FilterOptions {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  continent: string;
  scoreRange: string;
  hasWebsite: boolean | null;
}

interface SortOptions {
  field: 'name' | 'score' | 'status' | 'country' | 'recent' | 'website';
  direction: 'asc' | 'desc';
}

interface AdminHeaderProps {
  filter: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterChange: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void;
  showRejected: boolean;
  onToggleRejected: () => void;
  onAddNew: () => void;
  onLogout: () => void;
  orgCounts: OrgCounts;
  isLoading?: boolean;
  metadataProgress?: {
    loaded: number;
    total: number;
    loading: number;
    percentage: number;
  };
  // New props for organizational tools
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOptions: SortOptions;
  onSortChange: (sort: SortOptions) => void;
  filterOptions: FilterOptions;
  onFilterOptionsChange: (filters: FilterOptions) => void;
  filteredCount: number;
  totalOrgs: number;
}

export function AdminHeader({
  filter,
  onFilterChange,
  showRejected,
  onToggleRejected,
  onAddNew,
  onLogout,
  orgCounts,
  isLoading = false,
  metadataProgress,
  searchQuery,
  onSearchChange,
  sortOptions,
  onSortChange,
  filterOptions,
  onFilterOptionsChange,
  filteredCount,
  totalOrgs
}: AdminHeaderProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filterButtons = [
    { key: 'all' as const, label: 'All', count: orgCounts.all },
    { key: 'pending' as const, label: 'Pending', count: orgCounts.pending },
    { key: 'approved' as const, label: 'Approved', count: orgCounts.approved },
    { key: 'rejected' as const, label: 'Rejected', count: orgCounts.rejected },
  ];

  const clearAllFilters = () => {
    onSearchChange('');
    onFilterOptionsChange({
      status: 'all',
      continent: 'all',
      scoreRange: 'all',
      hasWebsite: null,
    });
    onSortChange({ field: 'name', direction: 'asc' });
  };

  const hasActiveFilters = searchQuery || 
    filterOptions.continent !== 'all' || 
    filterOptions.scoreRange !== 'all' || 
    filterOptions.hasWebsite !== null;

  return (
    // Add the .admin-header class that the CSS targets
    <div className="admin-header">
      <div className="p-4 max-w-7xl mx-auto">
        
        {/* Top Row: Title, Count, Actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Title and Loading Indicator */}
          <div className="flex items-center gap-3">
            <h1 className="text-title font-heading text-gradient-ocean">
              Admin: Manage Organizations
            </h1>
            {isLoading && (
              <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            )}
          </div>
          
          {/* Results Counter - Centered */}
          <div className="text-sm text-gray-300 bg-gray-800/30 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-600/30">
            {filteredCount !== totalOrgs ? (
              <span>Showing {filteredCount} of {totalOrgs}</span>
            ) : (
              <span>{totalOrgs} total</span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddNew}
              className="btn-glass btn-glass-green px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <span className="text-lg">➕</span>
              <span className="hidden sm:inline">Add New Org</span>
              <span className="sm:hidden">Add</span>
            </button>
            
            <button
              onClick={onLogout}
              className="btn-glass btn-glass-red px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <span className="text-lg">🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search organizations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 panel-glass border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
            />
            
            {/* Progress bar for metadata loading */}
            {metadataProgress && metadataProgress.loading > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 ease-linear"
                  style={{ 
                    width: `${metadataProgress.percentage}%`,
                    boxShadow: '0 0 4px rgba(34, 197, 94, 0.4)'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Compact Controls Row: Filter Buttons, Advanced Filters Toggle, and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.key}
                onClick={() => onFilterChange(button.key)}
                className={`px-3 py-1.5 rounded-lg capitalize text-sm font-medium transition-all duration-200 ${
                  filter === button.key
                    ? 'btn-glass btn-glass-blue ring-2 ring-blue-400/30'
                    : 'btn-glass hover:border-gray-500/50'
                }`}
              >
                {button.label}
                <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-xs">
                  {button.count}
                </span>
              </button>
            ))}
          </div>

          {/* Advanced Filters Toggle and Sort */}
          <div className="flex items-center gap-4">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-100"
            >
              <span
                className="transition-transform duration-100 ease-out"
                style={{ 
                  transform: showAdvancedFilters ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
                ▶
              </span>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}

            {/* Sort Controls - Use CustomDropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort:</span>
              <div className="flex items-center gap-1">
                <div className="relative z-50">
                  <CustomDropdown
                    options={getSortFieldOptions()}
                    value={sortOptions.field}
                    onChange={(value) => onSortChange({ 
                      ...sortOptions, 
                      field: value as any
                    })}
                    placeholder="Sort by..."
                    className="min-w-[100px]"
                  />
                </div>
                
                <button
                  onClick={() => onSortChange({ 
                    ...sortOptions, 
                    direction: sortOptions.direction === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors btn-glass rounded border border-gray-600/50 hover:border-gray-500"
                  title={`Sort ${sortOptions.direction === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOptions.direction === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel - Use CustomDropdowns */}
        {showAdvancedFilters && (
          <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-4 border border-gray-700/50 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Continent Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🌍 Continent
                </label>
                <div className="relative z-40">
                  <CustomDropdown
                    options={getContinentOptions()}
                    value={filterOptions.continent}
                    onChange={(value) => onFilterOptionsChange({
                      ...filterOptions,
                      continent: value
                    })}
                    placeholder="Select continent..."
                  />
                </div>
              </div>

              {/* Score Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📊 Score Range
                </label>
                <div className="relative z-30">
                  <CustomDropdown
                    options={getScoreRangeOptions()}
                    value={filterOptions.scoreRange}
                    onChange={(value) => onFilterOptionsChange({
                      ...filterOptions,
                      scoreRange: value
                    })}
                    placeholder="Select score range..."
                  />
                </div>
              </div>

              {/* Website Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🌐 Website Status
                </label>
                <div className="relative z-20">
                  <CustomDropdown
                    options={getWebsiteStatusOptions()}
                    value={filterOptions.hasWebsite === null ? 'all' : filterOptions.hasWebsite ? 'yes' : 'no'}
                    onChange={(value) => onFilterOptionsChange({
                      ...filterOptions,
                      hasWebsite: value === 'all' ? null : value === 'yes'
                    })}
                    placeholder="Website status..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHeader;