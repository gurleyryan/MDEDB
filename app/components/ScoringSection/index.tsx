'use client';
import { CustomDropdown } from '../CustomDropdown';
import { OrgScoring, SCORING_CRITERIA, calculateAlignmentScore } from '../../utils/scoring';
import { getScoringOptions } from '../../utils/selectOptions';
import { ClimateIcons } from '../Icons';

interface ScoringSectionProps {
  orgId: string;
  orgName: string;
  scores?: OrgScoring;
  isExpanded: boolean;
  savingScores: string | null;
  onScoreUpdate: (orgId: string, field: keyof OrgScoring, value: number | string) => void;
  onScoringSave: (orgId: string) => Promise<boolean>;
  onToggleExpanded: (orgId: string) => void;
}

export function ScoringSection({
  orgId,
  orgName,
  scores,
  isExpanded,
  savingScores,
  onScoreUpdate,
  onScoringSave,
}: ScoringSectionProps) {
  
  // Calculate total score
  const totalScore = scores ? calculateAlignmentScore(scores) : null;

  // Calculate scoring progress
  const scoredCriteria = SCORING_CRITERIA.filter(criterion => {
    const score = scores?.[criterion.key as keyof OrgScoring];
    return score !== undefined && score !== null;
  }).length;

  // Handle score save
  const handleSave = async () => {
    const success = await onScoringSave(orgId);
    if (success) {
      // Could add success feedback here if needed
    }
  };

  return (
    <div className="scoring-section" >
      {isExpanded && (
        <div
          className="panel-glass border-t p-6 rounded-b-2xl backdrop-blur-md stained-glass overflow-hidden transition-all duration-200 ease-out"
          style={{
            background: `linear-gradient(135deg, 
              rgba(5, 5, 5, 0.98), 
              rgba(15, 15, 15, 0.95), 
              rgba(8, 8, 8, 0.97)
            )`,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Compact Header with Progress and Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {ClimateIcons.scoring}
                <h4 className="text-lg font-bold text-white">Scoring: {orgName}</h4>
              </div>
              
              {/* Compact Progress Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>{scoredCriteria}/{SCORING_CRITERIA.length}</span>
                <div className="w-16 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${(scoredCriteria / SCORING_CRITERIA.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Score Display with Save Button */}
            <div className="flex items-center gap-3">
              {totalScore !== null && (
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm border ${
                    totalScore >= 21 ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                    totalScore >= 13 ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' : 
                    'bg-red-500/20 text-red-200 border-red-500/30'
                  }`}>
                    {totalScore}/26 ({Math.round((totalScore / 26) * 100)}%)
                  </div>
                  
                  {/* Recommendation Badge */}
                  {totalScore > 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      totalScore >= 21 ? 'bg-green-500/10 text-green-300' :
                      totalScore >= 13 ? 'bg-orange-500/10 text-orange-300' : 
                      'bg-red-500/10 text-red-300'
                    }`}>
                      {totalScore >= 21 ? ClimateIcons.strong : 
                       totalScore >= 13 ? ClimateIcons.promising : 
                       ClimateIcons.low}
                      <span className="hidden sm:inline ml-1">
                        {totalScore >= 21 ? 'Strong' : 
                         totalScore >= 13 ? 'Promising' : 
                         'Low Priority'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={savingScores === orgId}
                className="btn-glass btn-glass-purple px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 hover:translate-y-[-1px]"
              >
                {savingScores === orgId ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    {ClimateIcons.save}
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Compact Scoring Guide */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ClimateIcons.guide}
                <span className="text-blue-200 font-medium text-sm">Scoring Guide:</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-red-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">0</span>
                  <span className="text-gray-300">No</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-yellow-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-gray-300">Unclear</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-green-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-gray-300">Yes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs mt-2 text-gray-400">
              <span>21-26: Strong • 13-20: Promising • 0-12: Low Priority</span>
            </div>
          </div>
          
          {/* Enhanced Grid: Criteria + Comments Section */}
          <div className="scoring-criteria-grid grid gap-3 mb-4">
            {/* First 10 Criteria - Regular spacing */}
            {SCORING_CRITERIA.slice(0, 10).map((criterion, index) => {
              const currentScore = scores?.[criterion.key as keyof OrgScoring] as number | undefined;
              
              return (
                <div
                  key={criterion.key}
                  className={`scoring-criterion-card bg-gray-800/50 rounded-lg p-3 border transition-all duration-200 ${
                    currentScore !== undefined 
                      ? currentScore === 2 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : currentScore === 1
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ 
                    position: 'relative',
                    zIndex: SCORING_CRITERIA.length - index + 1000,
                    overflow: 'visible'
                  }}
                >
                  {/* Enhanced Header with Full Text */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                          {index + 1}
                        </span>
                        <h5 className="font-medium text-white text-sm">
                          {criterion.label}
                        </h5>
                      </div>
                      {/* Full description without truncation */}
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {criterion.description}
                      </p>
                    </div>
                    
                    {/* Compact Scoring Dropdown */}
                    <div 
                      className="flex flex-col items-end gap-1 flex-shrink-0"
                      style={{ 
                        position: 'relative',
                        zIndex: SCORING_CRITERIA.length - index + 2000,
                        overflow: 'visible'
                      }}
                    >
                      <CustomDropdown
                        value={currentScore?.toString() || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? undefined : parseInt(value);
                          onScoreUpdate(orgId, criterion.key as keyof OrgScoring, numValue ?? '');
                        }}
                        options={getScoringOptions()}
                        colorCoded={true}
                        className="min-w-[70px] text-center font-mono text-xs"
                      />
                      
                      {/* Compact Score Indicator */}
                      {currentScore !== undefined && (
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          currentScore === 0 ? 'text-red-200 bg-red-800/50' :
                          currentScore === 1 ? 'text-yellow-200 bg-yellow-800/50' : 
                          'text-green-200 bg-green-800/50'
                        }`}>
                          {currentScore}/2
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 11th and 12th Criteria in their own row */}
            {SCORING_CRITERIA.slice(10, 12).map((criterion, index) => {
              const actualIndex = index + 10;
              const currentScore = scores?.[criterion.key as keyof OrgScoring] as number | undefined;
              
              return (
                <div
                  key={criterion.key}
                  className={`scoring-criterion-card bg-gray-800/50 rounded-lg p-3 border transition-all duration-200 ${
                    currentScore !== undefined 
                      ? currentScore === 2 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : currentScore === 1
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ 
                    position: 'relative',
                    zIndex: SCORING_CRITERIA.length - actualIndex + 1000,
                    overflow: 'visible'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                          {actualIndex + 1}
                        </span>
                        <h5 className="font-medium text-white text-sm">
                          {criterion.label}
                        </h5>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {criterion.description}
                      </p>
                    </div>
                    
                    <div 
                      className="flex flex-col items-end gap-1 flex-shrink-0"
                      style={{ 
                        position: 'relative',
                        zIndex: SCORING_CRITERIA.length - actualIndex + 2000,
                        overflow: 'visible'
                      }}
                    >
                      <CustomDropdown
                        value={currentScore?.toString() || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? undefined : parseInt(value);
                          onScoreUpdate(orgId, criterion.key as keyof OrgScoring, numValue ?? '');
                        }}
                        options={getScoringOptions()}
                        colorCoded={true}
                        className="min-w-[70px] text-center font-mono text-xs"
                      />
                      
                      {currentScore !== undefined && (
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          currentScore === 0 ? 'text-red-200 bg-red-800/50' :
                          currentScore === 1 ? 'text-yellow-200 bg-yellow-800/50' : 
                          'text-green-200 bg-green-800/50'
                        }`}>
                          {currentScore}/2
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Additional Notes - Spans 2 columns under 11th and 12th criteria */}
            <div className="comments-section bg-gray-800/30 rounded-lg p-3 border border-gray-600/50 hover:border-gray-500/50 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                {ClimateIcons.comments}
                <label className="text-sm font-medium text-gray-300">
                  Additional Notes
                </label>
                <span className="text-xs text-gray-500 ml-auto">
                  {scores?.comments?.length || 0}/1000
                </span>
              </div>
              
              <textarea
                value={scores?.comments || ''}
                onChange={(e) => onScoreUpdate(orgId, 'comments', e.target.value)}
                className="w-full p-2.5 bg-gray-700/70 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none h-20 resize-none transition-all duration-200 text-xs leading-relaxed"
                placeholder="Add any additional notes, observations, or context about this organization's evaluation..."
                maxLength={1000}
              />
              
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  Optional evaluation notes
                </div>
                <div className={`text-xs ${
                  (scores?.comments?.length || 0) > 900 ? 'text-orange-400' :
                  (scores?.comments?.length || 0) > 800 ? 'text-yellow-400' :
                  'text-gray-500'
                }`}>
                  {1000 - (scores?.comments?.length || 0)} remaining
                </div>
              </div>
            </div>

            {/* 13th Criterion - In its own position */}
            {SCORING_CRITERIA.slice(12, 13).map((criterion) => {
              const actualIndex = 12;
              const currentScore = scores?.[criterion.key as keyof OrgScoring] as number | undefined;
              
              return (
                <div
                  key={criterion.key}
                  className={`scoring-criterion-card bg-gray-800/50 rounded-lg p-3 border transition-all duration-200 ${
                    currentScore !== undefined 
                      ? currentScore === 2 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : currentScore === 1
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ 
                    position: 'relative',
                    zIndex: SCORING_CRITERIA.length - actualIndex + 1000,
                    overflow: 'visible'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                          {actualIndex + 1}
                        </span>
                        <h5 className="font-medium text-white text-sm">
                          {criterion.label}
                        </h5>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {criterion.description}
                      </p>
                    </div>
                    
                    <div 
                      className="flex flex-col items-end gap-1 flex-shrink-0"
                      style={{ 
                        position: 'relative',
                        zIndex: SCORING_CRITERIA.length - actualIndex + 2000,
                        overflow: 'visible'
                      }}
                    >
                      <CustomDropdown
                        value={currentScore?.toString() || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? undefined : parseInt(value);
                          onScoreUpdate(orgId, criterion.key as keyof OrgScoring, numValue ?? '');
                        }}
                        options={getScoringOptions()}
                        colorCoded={true}
                        className="min-w-[70px] text-center font-mono text-xs"
                      />
                      
                      {currentScore !== undefined && (
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          currentScore === 0 ? 'text-red-200 bg-red-800/50' :
                          currentScore === 1 ? 'text-yellow-200 bg-yellow-800/50' : 
                          'text-green-200 bg-green-800/50'
                        }`}>
                          {currentScore}/2
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoringSection;