'use client';
import { CustomDropdown } from '../CustomDropdown';
import { ClimateIcons } from '../Icons';
import { 
  getContinentOptions, 
  getSortFieldOptions 
} from '../../utils/selectOptions';
import { useRouter } from 'next/navigation';
import { useUser } from '../../hooks/useUser';
import Image from 'next/image';

interface FilterOptions {
  continent: string;
}

interface SortOptions {
  field: 'name' | 'country' | 'recent' | 'website';
  direction: 'asc' | 'desc';
}

interface MetadataProgress {
  loaded: number;
  total: number;
  loading: number;
  percentage: number;
  isActive?: boolean;
}

interface PublicHeaderProps {
  isLoading?: boolean;
  metadataProgress?: MetadataProgress;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOptions: SortOptions;
  onSortChange: (options: SortOptions) => void;
  filterOptions: FilterOptions;
  onFilterOptionsChange: (options: FilterOptions) => void;
  isSearching?: boolean;
}

export function PublicHeader({
  metadataProgress,
  searchQuery,
  onSearchChange,
  sortOptions,
  onSortChange,
  filterOptions,
  onFilterOptionsChange,
  isSearching = false
}: PublicHeaderProps) {
  const router = useRouter();
  const { user, role, logout } = useUser(); // role: 'admin' | 'artist' | 'org' | undefined

  const clearAllFilters = () => {
    onSearchChange('');
    onFilterOptionsChange({
      continent: 'all',
    });
    onSortChange({ field: 'name', direction: 'asc' });
  };

  const hasActiveFilters = !!searchQuery || filterOptions.continent !== 'all';

  // Helper function to get appropriate sort toggle label
  const getSortToggleLabel = (field: string, direction: 'asc' | 'desc') => {
    switch (field) {
      case 'name':
        return direction === 'asc' ? 'A-Z' : 'Z-A';
      case 'country':
        return direction === 'asc' ? 'A-Z' : 'Z-A';
      case 'recent':
        return direction === 'asc' ? 'Old-New' : 'New-Old';
      case 'website':
        return direction === 'asc' ? 'No-Yes' : 'Yes-No';
      default:
        return direction === 'asc' ? 'A-Z' : 'Z-A';
    }
  };

  return (
    <div className="header sticky top-0 z-50 backdrop-blur-2xl border-b border-gray-700/50 shadow-2xl">
      <div className="w-full mx-auto px-4 py-2">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AMPLIFY: Climate Org Directory"
              width={40}
              height={40}
            />
            <h1 className="text-2xl font-bold text-white">
              AMPLIFY: Climate Org Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => {
                    if (role === 'artist') router.push('/artist');
                    else if (role === 'admin') router.push('/admin');
                    else if (role === 'org') router.push('/org');
                  }}
                  className="btn-glass px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {role === 'artist' ? 'Artist' : role === 'admin' ? 'Admin' : 'Org'} Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="btn-glass text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:text-white transition-colors flex items-center gap-2"
                >
                  {ClimateIcons.logout}
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="btn-glass px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {ClimateIcons.login}
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar with Loading Indicators */}
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {isSearching ? (
              <div className="animate-spin">
                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              ClimateIcons.search
            )}
          </div>
          
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 panel-glass border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
          
          {/* Search Loading Bar */}
          {isSearching && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700 rounded-b-lg overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 search-progress-bar animate-pulse rounded-b-lg"></div>
            </div>
          )}

          {/* Metadata Loading Bar */}
          {metadataProgress && metadataProgress.loading > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700 rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out rounded-b-lg"
                style={{ 
                  width: `${metadataProgress.percentage}%`,
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
                }}
              />
            </div>
          )}
          
          {/* Metadata Progress Text */}
          {metadataProgress && metadataProgress.loading > 0 && (
            <div className="absolute -bottom-6 right-0 text-xs text-gray-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Loading metadata: {metadataProgress.loaded}/{metadataProgress.total}</span>
            </div>
          )}
        </div>

        {/* Consolidated Status Buttons and Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left: Status Filter Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-glass text-gray-400 hover:text-white px-3 py-2 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ml-2"
              >
                {ClimateIcons.cancel}
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          {/* Right: Filter and Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Continent Filter */}
            <div className="min-w-[160px]">
              <CustomDropdown
                options={getContinentOptions()}
                value={filterOptions.continent}
                onChange={(value) => onFilterOptionsChange({
                  ...filterOptions,
                  continent: value
                })}
                placeholder="Filter by continent..."
                colorCoded={true}
                className="w-full"
                portal={false}
              />
            </div>

            {/* Sort Options with Direction Toggle */}
            <div className="flex gap-2">
              {/* Sort Field Dropdown */}
              <div className="min-w-[140px]">
                <CustomDropdown
                  options={getSortFieldOptions().filter(opt => opt.value !== 'score' && opt.value !== 'status')}
                  value={sortOptions.field}
                  onChange={(value) => onSortChange({
                    ...sortOptions,
                    field: value as SortOptions['field']
                  })}
                  placeholder="Sort by..."
                  colorCoded={true}
                  className="w-full"
                  portal={false}
                />
              </div>
              
              {/* Sort Direction Toggle */}
              <button
                onClick={() => onSortChange({
                  ...sortOptions,
                  direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
                })}
                className={`btn-glass px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 min-w-[80px] justify-center ${
                  sortOptions.direction === 'asc' 
                    ? 'btn-glass-blue text-blue-300' 
                    : 'btn-glass-purple text-purple-300'
                }`}
                title={`Currently sorting ${sortOptions.direction === 'asc' ? 'ascending' : 'descending'}. Click to toggle.`}
              >
                {sortOptions.direction === 'asc' ? (
                  <>
                    {ClimateIcons.sortAsc}
                    <span className="hidden sm:inline text-xs">
                      {getSortToggleLabel(sortOptions.field, 'asc')}
                    </span>
                  </>
                ) : (
                  <>
                    {ClimateIcons.sortDesc}
                    <span className="hidden sm:inline text-xs">
                      {getSortToggleLabel(sortOptions.field, 'desc')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicHeader;