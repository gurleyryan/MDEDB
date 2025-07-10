'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
// Import the interface from scoring.ts instead of defining it here
import { OrgScoring, SCORING_CRITERIA } from '../utils/scoring';
import { ClimateIcons } from '../components/Icons';

export function useScoring() {
  const supabase = createClient();
  const [orgScores, setOrgScores] = useState<Record<string, OrgScoring>>({});
  const [savingScores, setSavingScores] = useState<string | null>(null);
  const [loadingScores, setLoadingScores] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch scoring data for a specific organization
  const fetchOrgScoring = async (orgId: string) => {
    setLoadingScores(prev => ({ ...prev, [orgId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('org_scoring')
        .select('*')
        .eq('org_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching scores:', error);
        setError('Failed to fetch scoring data');
        return;
      }

      // If no scoring exists, create empty scoring object
      const scoring = data || {
        org_id: orgId,
        impact_track_record: undefined,
        local_legitimacy: undefined,
        transparency: undefined,
        scalability: undefined,
        digital_presence: undefined,
        alignment: undefined,
        urgency_relevance: undefined,
        clear_actionable_cta: undefined,
        show_ready_cta: undefined,
        scalable_impact: undefined,
        accessibility: undefined,
        global_regional_fit: undefined,
        volunteer_pipeline: undefined,
        comments: ''
      };

      setOrgScores(prev => ({ ...prev, [orgId]: scoring }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch scoring data');
      console.error('Error fetching scoring:', err);
    } finally {
      setLoadingScores(prev => ({ ...prev, [orgId]: false }));
    }
  };

  // Save scoring data for an organization
  const saveScoring = async (orgId: string) => {
    const scoring = orgScores[orgId];
    
    if (!scoring) {
      setError('No scoring data to save');
      return false;
    }

    setSavingScores(orgId);
    
    try {
      const { error } = await supabase
        .from('org_scoring')
        .upsert({
          ...scoring,
          org_id: orgId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        setError('Error saving scores: ' + error.message);
        return false;
      } else {
        // Refresh the scoring data to get the latest from DB
        await fetchOrgScoring(orgId);
        setError(null);
        return true;
      }
    } catch {
      setError('Failed to save scoring data');
      return false;
    } finally {
      setSavingScores(null);
    }
  };

  // Update a specific scoring field for an organization
  const updateScoringField = (orgId: string, field: keyof OrgScoring, value: number | string) => {
    setOrgScores(prev => ({
      ...prev,
      [orgId]: {
        ...prev[orgId],
        org_id: orgId, // Ensure org_id is always set
        [field]: value
      }
    }));
  };

  // Calculate total alignment score for an organization
  const calculateAlignmentScore = (orgId: string): number | null => {
    const scores = orgScores[orgId];
    if (!scores) return null;
    
    const numericScores = [
      scores.impact_track_record,
      scores.local_legitimacy,
      scores.transparency,
      scores.scalability,
      scores.digital_presence,
      scores.alignment,
      scores.urgency_relevance,
      scores.clear_actionable_cta,
      scores.show_ready_cta,
      scores.scalable_impact,
      scores.accessibility,
      scores.global_regional_fit,
      scores.volunteer_pipeline
    ].filter(score => score !== undefined && score !== null) as number[];
    
    return numericScores.length > 0 ? numericScores.reduce((sum, score) => sum + score, 0) : null;
  };

  // Get score recommendation based on total score
  const getScoreRecommendation = (orgId: string): { text: string; color: string; icon: React.ReactNode } | null => {
    const totalScore = calculateAlignmentScore(orgId);
    
    if (totalScore === null || totalScore === 0) return null;
    
    if (totalScore >= 21) {
      return {
        text: 'Strong Candidate',
        color: 'text-green-300',
        icon: ClimateIcons.strong
      };
    } else if (totalScore >= 13) {
      return {
        text: 'Promising, Needs Follow-Up',
        color: 'text-orange-300',
        icon: ClimateIcons.promising
      };
    } else {
      return {
        text: 'Low Priority / Not Suitable',
        color: 'text-red-300',
        icon: ClimateIcons.low
      };
    }
  };

  // Get alignment score color for display
  const getAlignmentScoreColor = (score?: number | null) => {
    if (score === undefined || score === null) return 'text-gray-200 bg-gray-700';
    if (score >= 21) return 'text-green-200 bg-green-800';
    if (score >= 13) return 'text-orange-200 bg-orange-800';
    return 'text-red-200 bg-red-800';
  };

  // Delete scoring data for an organization
  const deleteScoring = async (orgId: string) => {
    setSavingScores(orgId);
    
    try {
      const { error } = await supabase
        .from('org_scoring')
        .delete()
        .eq('org_id', orgId);

      if (error) {
        setError('Error deleting scores: ' + error.message);
        return false;
      } else {
        // Remove from local state
        setOrgScores(prev => {
          const newScores = { ...prev };
          delete newScores[orgId];
          return newScores;
        });
        setError(null);
        return true;
      }
    } catch {
      setError('Failed to delete scoring data');
      return false;
    } finally {
      setSavingScores(null);
    }
  };

  // Reset scoring data for an organization (clear all fields)
  const resetScoring = (orgId: string) => {
    setOrgScores(prev => ({
      ...prev,
      [orgId]: {
        org_id: orgId,
        impact_track_record: undefined,
        local_legitimacy: undefined,
        transparency: undefined,
        scalability: undefined,
        digital_presence: undefined,
        alignment: undefined,
        urgency_relevance: undefined,
        clear_actionable_cta: undefined,
        show_ready_cta: undefined,
        scalable_impact: undefined,
        accessibility: undefined,
        global_regional_fit: undefined,
        volunteer_pipeline: undefined,
        comments: ''
      }
    }));
  };

  // Bulk fetch scoring data for multiple organizations
  const fetchMultipleOrgScoring = async (orgIds: string[]) => {
    if (orgIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('org_scoring')
        .select('*')
        .in('org_id', orgIds);

      if (error) {
        console.error('Error fetching multiple scores:', error);
        setError('Failed to fetch scoring data');
        return;
      }

      // Convert array to record format
      const scoringRecord = data.reduce((acc, scoring) => {
        acc[scoring.org_id] = scoring;
        return acc;
      }, {} as Record<string, OrgScoring>);

      // Add empty scoring objects for orgs without scoring data
      orgIds.forEach(orgId => {
        if (!scoringRecord[orgId]) {
          scoringRecord[orgId] = {
            org_id: orgId,
            comments: ''
          };
        }
      });

      setOrgScores(prev => ({ ...prev, ...scoringRecord }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch scoring data');
      console.error('Error fetching multiple scoring:', err);
    }
  };

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    orgScores,
    savingScores,
    loadingScores,
    error,
    
    // Actions
    fetchOrgScoring,
    saveScoring,
    updateScoringField,
    deleteScoring,
    resetScoring,
    fetchMultipleOrgScoring,
    
    // Utilities
    calculateAlignmentScore,
    getScoreRecommendation,
    getAlignmentScoreColor,
    
    // Constants
    scoringCriteria: SCORING_CRITERIA,
    
    // Error handling
    setError,
  };
}