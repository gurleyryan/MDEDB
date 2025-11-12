'use client';
import { useState } from 'react';
import { CustomDropdown } from '../CustomDropdown';
import { ClimateIcons } from '../Icons';
import {
  getContinentOptions,
  getSortFieldOptions
} from '../../utils/selectOptions';
import { useRouter } from 'next/navigation';
import { useUser } from '../../hooks/useUser';
import { useTheme } from '../../hooks/useTheme';
import { useIsEmbedded } from '../../hooks/useIsEmbedded';
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
  const { theme, toggleTheme } = useTheme();
  const isEmbedded = useIsEmbedded();
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

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
    <div className="header sticky top-0 z-[120] isolation-auto backdrop-blur-2xl">
      <div className="w-full mx-auto px-4 py-2">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image
              src="/logo.png"
              alt="AMPLIFY: Climate Org Directory"
              width={40}
              height={40}
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 hover:text-blue-500 dark:hover:text-blue-400">
              AMPLIFY: Climate Org Directory
            </h1>
          </div>
          {!isEmbedded && (
            <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0 max-w-[30%] sm:max-w-none mt-3 sm:mt-0">
              {/* Action buttons - 2x2 Grid on mobile, row on desktop */}
              {user ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-0 sm:flex sm:gap-2 sm:w-auto sm:h-auto flex-shrink-0">
                {/* Top-left: Dashboard */}
                <button
                  onClick={() => {
                    if (role === 'artist') router.push('/artist');
                    else if (role === 'admin') router.push('/admin');
                    else if (role === 'org') router.push('/org');
                  }}
                  className="btn-glass w-8 h-8 sm:w-auto sm:h-10 px-1 sm:px-3 py-1 sm:py-2 rounded-none rounded-tl-lg sm:rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {role === 'admin' ? ClimateIcons.approved : role === 'artist' ? ClimateIcons.trophy : ClimateIcons.guide}
                  <span className="hidden sm:inline">{role === 'artist' ? 'Artist' : role === 'admin' ? 'Admin' : 'Org'} Dashboard</span>
                </button>
                
                {/* Top-right: Hamburger */}
                <button
                  onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                  className="sm:hidden btn-glass w-8 h-8 rounded-none rounded-tr-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
                  title={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
                  aria-label={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
                >
                  {isMobileCollapsed ? ClimateIcons.menuOpen : ClimateIcons.close}
                </button>
                
                {/* Bottom-left: Theme */}
                <button
                  onClick={toggleTheme}
                  className="btn-glass w-8 h-8 sm:w-auto sm:h-10 px-1 sm:px-3 py-1 sm:py-2 rounded-none rounded-bl-lg sm:rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? ClimateIcons.moon : ClimateIcons.sun}
                  <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
                
                {/* Bottom-right: Logout */}
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="btn-glass text-gray-600 dark:text-gray-300 w-8 h-8 sm:w-auto sm:h-10 px-1 sm:px-3 py-1 sm:py-2 rounded-none rounded-br-lg sm:rounded-lg text-xs sm:text-sm font-medium hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center sm:gap-2"
                >
                  {ClimateIcons.logout}
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 grid-rows-2 gap-0 sm:flex sm:gap-2 sm:w-auto sm:h-auto flex-shrink-0">
                {/* Top-left: MDEUS Logo for logged-out users */}
                <div className="w-11 h-10 sm:w-auto sm:h-10 flex items-center justify-center sm:gap-2 rounded-none rounded-tl-lg sm:rounded-lg bg-transparent hover:bg-white/10 dark:hover:bg-black/10 transition-colors">
                  <a 
                    href="https://www.musicdeclares.net/us/campaigns/mde-us-amplify-program"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center sm:gap-2 w-full h-full"
                    title="Visit Music Declares Emergency US - AMPLIFY Program"
                  >
                    <Image
                      src="/MDEUS.png"
                      alt="MDEUS"
                      width={40}
                      height={40}
                      className="w-8 h-8 object-contain sm:w-8 sm:h-8"
                    />
                    <span className="hidden sm:inline text-sm sm:text-sm text-gray-700 dark:text-gray-300">MDEUS</span>
                  </a>
                </div>
                
                {/* Top-right: Hamburger */}
                <button
                  onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                  className="sm:hidden btn-glass w-8 h-8 rounded-none rounded-tr-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
                  title={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
                  aria-label={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
                >
                  {isMobileCollapsed ? ClimateIcons.menuOpen : ClimateIcons.close}
                </button>
                
                {/* Bottom-left: Theme */}
                <button
                  onClick={toggleTheme}
                  className="btn-glass w-8 h-8 sm:w-auto sm:h-10 px-1 sm:px-3 py-1 sm:py-2 rounded-none rounded-bl-lg sm:rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? ClimateIcons.moon : ClimateIcons.sun}
                  <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
                
                {/* Bottom-right: Login */}
                <button
                  onClick={() => router.push('/login')}
                  className="btn-glass w-8 h-8 sm:w-auto sm:h-10 px-1 sm:px-3 py-1 sm:py-2 rounded-none rounded-br-lg sm:rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {ClimateIcons.login}
                  <span className="hidden sm:inline">Login</span>
                </button>
              </div>
            )}
            
            {/* Desktop MDEUS Logo - only show when logged in */}
            {user && (
              <a 
                href="https://www.musicdeclares.net/us/campaigns/mde-us-amplify-program"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block"
                title="Visit Music Declares Emergency US - AMPLIFY Program"
              >
                <Image
                  src="/MDEUS.png"
                  alt="MDEUS"
                  width={40}
                  height={40}
                  className="opacity-80 hover:opacity-100 transition-opacity w-[60px] h-auto"
                />
              </a>
            )}
          </div>
          )}
          
          {/* Mobile hamburger for embedded mode */}
          {isEmbedded && (
            <button
              onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
              className="sm:hidden btn-glass w-8 h-8 rounded-lg text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center mt-3"
              title={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
              aria-label={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
            >
              {isMobileCollapsed ? ClimateIcons.menuOpen : ClimateIcons.close}
            </button>
          )}
        </div>

        {/* Collapsible Content - Hidden on mobile when collapsed */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isMobileCollapsed ? 'max-h-0 sm:max-h-none' : 'max-h-96'
        }`}>
          {/* Search Bar with Loading Indicators */}
          <div className="relative mb-3 sm:mb-6">
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
            className="w-full pl-10 pr-4 py-2 panel-glass border border-gray-600/50 dark:border-gray-600/50 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#f7ed6a]/70 focus:ring-1 focus:ring-[#f7ed6a]/30 transition-all duration-200"
          />

          {/* Search Loading Bar */}
          {isSearching && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700 rounded-b-lg overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 search-progress-bar animate-pulse rounded-b-lg"></div>
            </div>
          )}

          {/* Metadata Loading Bar */}
          {metadataProgress && metadataProgress.loading > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700 rounded-b-lg overflow-hidden">
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
            <div className="absolute -bottom-5 right-0 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
                className="btn-glass text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ml-2"
              >
                {ClimateIcons.cancel}
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Right: Filter and Sort Controls (flattened so each item wraps independently) */}
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end sm:justify-start ml-auto">
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
                portal={true}
              />
            </div>

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
                portal={true}
              />
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => onSortChange({
                ...sortOptions,
                direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
              })}
              className={`btn-glass px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 min-w-[80px] justify-center ${sortOptions.direction === 'asc'
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
        </div> {/* End of collapsible content */}
      </div>
    </div>
  );
}

export default PublicHeader;