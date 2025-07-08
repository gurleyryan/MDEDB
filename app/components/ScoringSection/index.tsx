'use client';
import { motion } from 'framer-motion';
import { OrgScoring, SCORING_CRITERIA, getScoreRecommendation, calculateAlignmentScore } from '../../utils/scoring';
import { getAlignmentScoreColor } from '../../utils/orgUtils';

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
  onToggleExpanded
}: ScoringSectionProps) {
  
  // Calculate total score
  const totalScore = scores ? calculateAlignmentScore(scores) : null;
  const recommendation = getScoreRecommendation(totalScore);

  // Calculate scoring progress
  const scoredCriteria = SCORING_CRITERIA.filter(criterion => {
    const score = scores?.[criterion.key as keyof OrgScoring];
    return score !== undefined && score !== null;
  }).length;
  
  const progressPercentage = Math.round((scoredCriteria / SCORING_CRITERIA.length) * 100);

  // Handle score save
  const handleSave = async () => {
    const success = await onScoringSave(orgId);
    if (success) {
      // Could add success feedback here if needed
    }
  };

  return (
    <div className="border-t border-gray-700">
      {/* Scoring Toggle Button */}
      <div className="bg-gray-800/50 p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggleExpanded(orgId)}
          className="w-full flex items-center justify-between text-left bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg transition-colors shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <div>
              <span className="font-medium">
                {isExpanded ? 'Hide Scoring' : 'Edit Scoring'}
              </span>
              {!isExpanded && scores && (
                <div className="text-sm text-purple-200 mt-1">
                  Progress: {progressPercentage}% • Score: {totalScore ?? 'N/A'}
                  {recommendation.category !== 'none' && (
                    <span className="ml-2">{recommendation.emoji}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>
      </div>

      {/* Expanded Scoring Interface */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/90 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              🎯 Scoring Criteria for {orgName}
            </h4>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-300">
                {scoredCriteria}/{SCORING_CRITERIA.length} criteria
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    progressPercentage === 100 
                      ? 'bg-green-500' 
                      : progressPercentage >= 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-400">{progressPercentage}%</span>
            </div>
          </div>
          
          {/* Scoring Guide */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h5 className="text-blue-200 font-medium mb-3 flex items-center gap-2">
              📋 Scoring Guide
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">0</span>
                    <span className="text-gray-300">Does not meet the criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">1</span>
                    <span className="text-gray-300">Unclear/questionable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded text-center text-xs font-bold flex items-center justify-center">2</span>
                    <span className="text-gray-300">Clearly meets the criteria</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-lg">🟢</span>
                    <span className="text-green-200 font-medium">21–26: Strong Candidate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-lg">🟡</span>
                    <span className="text-orange-200 font-medium">13–20: Promising, Needs Follow-Up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-lg">🔴</span>
                    <span className="text-red-200 font-medium">0–12: Low Priority / Not Suitable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scoring Criteria Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {SCORING_CRITERIA.map((criterion, index) => {
              const currentScore = scores?.[criterion.key as keyof OrgScoring] as number | undefined;
              
              return (
                <motion.div
                  key={criterion.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-200 ${
                    currentScore !== undefined 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-white text-sm flex items-center gap-2">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      {criterion.label}
                    </h5>
                    
                    <select
                      value={currentScore ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                        onScoreUpdate(orgId, criterion.key as keyof OrgScoring, value ?? '');
                      }}
                      className={`border rounded px-3 py-2 text-white text-sm min-w-[90px] transition-colors ${
                        currentScore === undefined
                          ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          : currentScore === 0
                          ? 'bg-red-700 border-red-500'
                          : currentScore === 1
                          ? 'bg-yellow-700 border-yellow-500'
                          : 'bg-green-700 border-green-500'
                      }`}
                    >
                      <option value="">N/A</option>
                      <option value={0}>0 - No</option>
                      <option value={1}>1 - Unclear</option>
                      <option value={2}>2 - Yes</option>
                    </select>
                  </div>
                  
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {criterion.description}
                  </p>
                  
                  {/* Score indicator */}
                  {currentScore !== undefined && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className={`text-xs font-medium ${
                        currentScore === 0 ? 'text-red-300' :
                        currentScore === 1 ? 'text-yellow-300' : 'text-green-300'
                      }`}>
                        Score: {currentScore}/2
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Comments Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              💬 Comments & Additional Notes
            </label>
            <textarea
              value={scores?.comments || ''}
              onChange={(e) => onScoreUpdate(orgId, 'comments', e.target.value)}
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-32 resize-none transition-colors"
              placeholder="Add any additional notes, observations, or comments about this organization's evaluation..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {scores?.comments?.length || 0}/1000 characters
            </div>
          </div>

          {/* Score Summary */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-300 font-medium">Calculated Alignment Score:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getAlignmentScoreColor(totalScore)}`}>
                    {totalScore ?? 'N/A'}/26
                  </span>
                </div>
                
                <div className="text-xs text-gray-400">
                  Maximum possible score: 26 (13 criteria × 2 points each)
                </div>
                
                {/* Progress Bar */}
                {totalScore !== null && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(totalScore / 26) * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${
                          totalScore >= 21 ? 'bg-green-500' :
                          totalScore >= 13 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totalScore / 26) * 100)}% of maximum score
                    </div>
                  </div>
                )}
              </div>
              
              {/* Recommendation */}
              {totalScore !== null && totalScore > 0 && (
                <div className="text-right">
                  <div className={`text-sm font-medium flex items-center gap-2 ${recommendation.color}`}>
                    <span className="text-lg">{recommendation.emoji}</span>
                    <span>{recommendation.text}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 max-w-xs">
                    {recommendation.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Set all scores to 2 (maximum)
                  SCORING_CRITERIA.forEach(criterion => {
                    onScoreUpdate(orgId, criterion.key as keyof OrgScoring, 2);
                  });
                }}
                className="bg-green-600/20 text-green-300 border border-green-500/30 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-colors"
              >
                ✨ Set All to Max
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Clear all scores
                  SCORING_CRITERIA.forEach(criterion => {
                    onScoreUpdate(orgId, criterion.key as keyof OrgScoring, '');
                  });
                  onScoreUpdate(orgId, 'comments', '');
                }}
                className="bg-red-600/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors"
              >
                🗑️ Clear All
              </motion.button>
            </div>
            
            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={savingScores === orgId}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors shadow-lg flex items-center gap-2"
            >
              {savingScores === orgId ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Scoring
                </>
              )}
            </motion.button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400">
              💡 <strong>Pro tip:</strong> Use Tab to navigate between score dropdowns quickly. 
              Score meanings: 0 = No, 1 = Unclear/Maybe, 2 = Yes/Strong
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ScoringSection;