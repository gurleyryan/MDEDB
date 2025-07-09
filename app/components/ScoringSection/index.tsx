'use client';
import { useState } from 'react';
import { CustomDropdown } from '../CustomDropdown';
import { OrgScoring, SCORING_CRITERIA, getScoreRecommendation, calculateAlignmentScore } from '../../utils/scoring';
import { getAlignmentScoreColor } from '../../utils/orgUtils';
import { getScoringOptions } from '../../utils/selectOptions';

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

  // Handle score save
  const handleSave = async () => {
    const success = await onScoringSave(orgId);
    if (success) {
      // Could add success feedback here if needed
    }
  };

  return (
    <div className="">
      {/* Simple CSS transition - no stretching */}
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
            animation: 'fadeIn 0.2s ease-out'
          }}
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
              
              {/* Progress bar */}
              <div className="w-24 h-2 bg-gray-800/60 backdrop-blur-sm rounded-full overflow-hidden border border-gray-600/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(scoredCriteria / SCORING_CRITERIA.length) * 100}%` }}
                />
              </div>
              
              {/* Score display */}
              {totalScore !== null && (
                <div className={`px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm border ${
                  totalScore >= 21 ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                  totalScore >= 13 ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' : 
                  'bg-red-500/20 text-red-200 border-red-500/30'
                }`}>
                  Total: {totalScore}/26
                </div>
              )}
            </div>
          </div>

          {/* Scoring Guide - no animation */}
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
          
          {/* Scoring Criteria Grid - no individual animations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {SCORING_CRITERIA.map((criterion, index) => {
              const currentScore = scores?.[criterion.key as keyof OrgScoring] as number | undefined;
              
              return (
                <div
                  key={criterion.key}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-200 ${
                    currentScore !== undefined 
                      ? currentScore === 2 
                        ? 'border-green-500/30 bg-green-500/5 shadow-green-500/10 shadow-lg' 
                        : currentScore === 1
                        ? 'border-yellow-500/30 bg-yellow-500/5 shadow-yellow-500/10 shadow-lg'
                        : 'border-red-500/30 bg-red-500/5 shadow-red-500/10 shadow-lg'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-white text-sm flex items-center gap-2">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded font-mono">
                        {index + 1}
                      </span>
                      {criterion.label}
                    </h5>
                    
                    {/* Scoring Dropdown */}
                    <div className="flex flex-col items-end gap-1">
                      <CustomDropdown
                        value={currentScore?.toString() || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? undefined : parseInt(value);
                          onScoreUpdate(orgId, criterion.key as keyof OrgScoring, numValue ?? '');
                        }}
                        options={getScoringOptions()}
                        colorCoded={true}
                        className="min-w-[100px] text-center font-mono"
                      />
                      
                      {/* Score indicator */}
                      {currentScore !== undefined && (
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                          currentScore === 0 ? 'text-red-200 bg-red-800/50' :
                          currentScore === 1 ? 'text-yellow-200 bg-yellow-800/50' : 
                          'text-green-200 bg-green-800/50'
                        }`}>
                          {currentScore}/2
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {criterion.description}
                  </p>
                </div>
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
                      <div
                        className={`h-full rounded-full transition-all duration-300 ease-linear ${
                          totalScore >= 21 ? 'bg-green-500' :
                          totalScore >= 13 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(totalScore / 26) * 100}%` }}
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

          {/* Action Buttons - Keep only Save button */}
          <div className="flex justify-end items-center">
            {/* Save Button - clean and minimal */}
            <button
              onClick={handleSave}
              disabled={savingScores === orgId}
              className="btn-glass btn-glass-purple px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2 hover:translate-y-[-1px]"
            >
              {savingScores === orgId ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Scoring</span>
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400">
              💡 <strong>Pro tip:</strong> Use Tab to navigate between score dropdowns quickly. 
              Score meanings: 0 = No, 1 = Unclear/Maybe, 2 = Yes/Strong
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoringSection;