'use client';
import { motion } from 'framer-motion';

interface OrgCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
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
  metadataProgress
}: AdminHeaderProps) {
  
  const filterButtons = [
    { key: 'all' as const, label: 'All', count: orgCounts.all },
    { key: 'pending' as const, label: 'Pending', count: orgCounts.pending },
    { key: 'approved' as const, label: 'Approved', count: orgCounts.approved },
    { key: 'rejected' as const, label: 'Rejected', count: orgCounts.rejected },
  ];

  return (
    <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Admin: Manage Organizations
            </h1>
            {isLoading && (
              <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddNew}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors shadow-lg flex items-center gap-2"
            >
              <span className="text-lg">➕</span>
              <span className="hidden sm:inline">Add New Org</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleRejected}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center gap-2 ${
                showRejected 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{showRejected ? '🙈' : '👁️'}</span>
              <span className="hidden sm:inline">
                {showRejected ? 'Hide Rejected' : 'Show Rejected'}
              </span>
              <span className="sm:hidden">
                {showRejected ? 'Hide' : 'Show'}
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-lg flex items-center gap-2"
            >
              <span className="text-lg">🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Buttons Row */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterButtons.map((button) => (
            <motion.button
              key={button.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(button.key)}
              className={`px-3 py-2 rounded-lg capitalize text-sm sm:text-base font-medium transition-all duration-200 ${
                filter === button.key
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                {/* Status Icons */}
                {button.key === 'pending' && <span className="text-yellow-400">⏳</span>}
                {button.key === 'approved' && <span className="text-green-400">✅</span>}
                {button.key === 'rejected' && <span className="text-red-400">❌</span>}
                {button.key === 'all' && <span className="text-blue-400">📋</span>}
                
                {/* Button Text */}
                <span>{button.label}</span>
                
                {/* Count Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === button.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-600 text-gray-200'
                }`}>
                  {button.count}
                </span>
              </span>
            </motion.button>
          ))}
        </div>

        {/* Status Summary */}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{orgCounts.approved} Approved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{orgCounts.pending} Pending Review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{orgCounts.rejected} Rejected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{orgCounts.all} Total Organizations</span>
          </div>
        </div>

        {/* Quick Stats */}
        {orgCounts.all > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Approval Rate: {Math.round((orgCounts.approved / orgCounts.all) * 100)}% • 
            Pending: {Math.round((orgCounts.pending / orgCounts.all) * 100)}%
            {orgCounts.rejected > 0 && (
              <> • Rejected: {Math.round((orgCounts.rejected / orgCounts.all) * 100)}%</>
            )}
            {metadataProgress && metadataProgress.total > 0 && (
              <> • Metadata: {metadataProgress.percentage}%</>
            )}
          </div>
        )}

        {/* Filter Notice */}
        {!showRejected && filter !== 'rejected' && orgCounts.rejected > 0 && (
          <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
            💡 {orgCounts.rejected} rejected organization{orgCounts.rejected !== 1 ? 's' : ''} hidden. 
            Use "Show Rejected" to view them.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHeader;