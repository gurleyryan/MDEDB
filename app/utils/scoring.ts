// Scoring criteria with descriptions
export const SCORING_CRITERIA = [
  { 
    key: 'impact_track_record', 
    label: 'Impact Track Record',
    description: 'Tangible, verifiable outcomes in their community or issue area. Does the org have a history of successful campaigns, legislative wins, or media presence indicating credibility?'
  },
  { 
    key: 'local_legitimacy', 
    label: 'Local Legitimacy',
    description: 'Community-led, trusted, and not extractive. Are they embedded in and accountable to the communities they serve?'
  },
  { 
    key: 'transparency', 
    label: 'Transparency',
    description: 'Are financials, leadership, mission, and decision-making processes clearly communicated and publicly available?'
  },
  { 
    key: 'scalability', 
    label: 'Scalability',
    description: 'Can they absorb increased attention, donations, or volunteer traffic without bottlenecks or collapse?'
  },
  { 
    key: 'digital_presence', 
    label: 'Digital Presence',
    description: 'Do they maintain an up-to-date website and/or social media presence? Are there clear channels for contact or involvement?'
  },
  { 
    key: 'alignment', 
    label: 'Alignment',
    description: 'Does their mission align with climate justice and nonviolent organizing, especially in accordance with UN SDG 13 (Climate Action)?'
  },
  { 
    key: 'urgency_relevance', 
    label: 'Urgency & Relevance',
    description: 'Are they addressing a timely and critical ecological or justice-related issue?'
  },
  { 
    key: 'clear_actionable_cta', 
    label: 'Clear, Actionable CTA',
    description: 'Is there an immediate, specific action to take (e.g., donate, sign up, text-to-join)? Is it feasible for a general audience?'
  },
  { 
    key: 'show_ready_cta', 
    label: 'Show-Ready CTA',
    description: 'Is the CTA executable in real-time at events (concerts, festivals), e.g., QR code, text-to-join, or mobile-optimized sign-up?'
  },
  { 
    key: 'scalable_impact', 
    label: 'Scalable Impact',
    description: 'Is the organization contributing to systemic change, and not just symbolic or hyper-local wins?'
  },
  { 
    key: 'accessibility', 
    label: 'Accessibility',
    description: 'Are their materials mobile-friendly, readable by non-experts, and available in multiple languages or formats?'
  },
  { 
    key: 'global_regional_fit', 
    label: 'Global or Regional Fit',
    description: 'Does their geography and issue area provide international or underserved-region representation for AMPLIFY?'
  },
  { 
    key: 'volunteer_pipeline', 
    label: 'Volunteer Pipeline',
    description: 'Does involvement lead to deeper, ongoing engagement, and not just a one-off action?'
  }
] as const;

// Scoring interface
export interface OrgScoring {
  id?: string;
  org_id: string;
  impact_track_record?: number;
  local_legitimacy?: number;
  transparency?: number;
  scalability?: number;
  digital_presence?: number;
  alignment?: number;
  urgency_relevance?: number;
  clear_actionable_cta?: number;
  show_ready_cta?: number;
  scalable_impact?: number;
  accessibility?: number;
  global_regional_fit?: number;
  volunteer_pipeline?: number;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

// Scoring constants
export const SCORING_CONSTANTS = {
  MIN_SCORE: 0,
  MAX_SCORE: 2,
  MAX_TOTAL_SCORE: 26, // 13 criteria × 2 points each
  CRITERIA_COUNT: 13,
  
  // Score thresholds
  STRONG_CANDIDATE_THRESHOLD: 21,
  PROMISING_CANDIDATE_THRESHOLD: 13,
  
  // Score ranges
  STRONG_RANGE: { min: 21, max: 26 },
  PROMISING_RANGE: { min: 13, max: 20 },
  LOW_PRIORITY_RANGE: { min: 0, max: 12 }
} as const;

// Score recommendation types
export type ScoreCategory = 'strong' | 'promising' | 'low' | 'none';

export interface ScoreRecommendation {
  text: string;
  color: string;
  category: ScoreCategory;
  description: string;
}

// Get alignment score color for display
export const getAlignmentScoreColor = (score?: number | null): string => {
  if (score === undefined || score === null) return 'text-gray-200 bg-gray-700';
  if (score >= SCORING_CONSTANTS.STRONG_CANDIDATE_THRESHOLD) return 'text-green-200 bg-green-800';
  if (score >= SCORING_CONSTANTS.PROMISING_CANDIDATE_THRESHOLD) return 'text-orange-200 bg-orange-800';
  return 'text-red-200 bg-red-800';
};

// Get score recommendation based on total score
export const getScoreRecommendation = (score: number | null): ScoreRecommendation => {
  if (score === null || score === 0) {
    return {
      text: 'Not Scored',
      color: 'text-gray-300',
      category: 'none',
      description: 'This organization has not been scored yet.'
    };
  }
  
  if (score >= SCORING_CONSTANTS.STRONG_CANDIDATE_THRESHOLD) {
    return {
      text: 'Strong Candidate',
      color: 'text-green-300',
      category: 'strong',
      description: 'This organization meets most criteria and is ready for partnership.'
    };
  } else if (score >= SCORING_CONSTANTS.PROMISING_CANDIDATE_THRESHOLD) {
    return {
      text: 'Promising, Needs Follow-Up',
      color: 'text-orange-300',
      category: 'promising',
      description: 'This organization shows potential but requires additional evaluation.'
    };
  } else {
    return {
      text: 'Low Priority / Not Suitable',
      color: 'text-red-300',
      category: 'low',
      description: 'This organization does not currently meet the minimum criteria.'
    };
  }
};

// Calculate total alignment score from scoring object
export const calculateAlignmentScore = (scores: OrgScoring): number | null => {
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

// Validate individual score value
export const isValidScore = (score: unknown): score is number => {
  return typeof score === 'number' && 
         score >= SCORING_CONSTANTS.MIN_SCORE && 
         score <= SCORING_CONSTANTS.MAX_SCORE;
};

// Validate complete scoring object
export const validateScoring = (scores: Partial<OrgScoring>): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!scores.org_id) {
    errors.push('Organization ID is required');
  }
  
  // Check individual scores
  const scoreFields = SCORING_CRITERIA.map(c => c.key);
  let scoredCount = 0;
  
  scoreFields.forEach(field => {
    const score = scores[field as keyof OrgScoring] as number;
    if (score !== undefined && score !== null) {
      if (!isValidScore(score)) {
        errors.push(`Invalid score for ${field}: must be between ${SCORING_CONSTANTS.MIN_SCORE} and ${SCORING_CONSTANTS.MAX_SCORE}`);
      } else {
        scoredCount++;
      }
    }
  });
  
  // Warnings for incomplete scoring
  if (scoredCount === 0) {
    warnings.push('No criteria have been scored');
  } else if (scoredCount < SCORING_CONSTANTS.CRITERIA_COUNT) {
    warnings.push(`Only ${scoredCount} of ${SCORING_CONSTANTS.CRITERIA_COUNT} criteria have been scored`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Get scoring progress (how many criteria have been scored)
export const getScoringProgress = (scores: OrgScoring): {
  scored: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} => {
  if (!scores) {
    return { scored: 0, total: SCORING_CONSTANTS.CRITERIA_COUNT, percentage: 0, isComplete: false };
  }
  
  const scoreFields = SCORING_CRITERIA.map(c => c.key);
  const scoredCount = scoreFields.filter(field => {
    const score = scores[field as keyof OrgScoring];
    return score !== undefined && score !== null;
  }).length;
  
  const percentage = Math.round((scoredCount / SCORING_CONSTANTS.CRITERIA_COUNT) * 100);
  
  return {
    scored: scoredCount,
    total: SCORING_CONSTANTS.CRITERIA_COUNT,
    percentage,
    isComplete: scoredCount === SCORING_CONSTANTS.CRITERIA_COUNT
  };
};

// Get score distribution for analytics
export const getScoreDistribution = (scores: OrgScoring): {
  [key: number]: number;
} => {
  if (!scores) return {};
  
  const distribution: { [key: number]: number } = { 0: 0, 1: 0, 2: 0 };
  
  SCORING_CRITERIA.forEach(criterion => {
    const score = scores[criterion.key as keyof OrgScoring] as number;
    if (score !== undefined && score !== null && isValidScore(score)) {
      distribution[score]++;
    }
  });
  
  return distribution;
};

// Create empty scoring object for new organizations
export const createEmptyScoring = (orgId: string): OrgScoring => ({
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
});

// Format score for display
export const formatScore = (score?: number | null): string => {
  if (score === undefined || score === null) return 'N/A';
  return score.toString();
};

// Format total score with context
export const formatTotalScore = (score?: number | null): string => {
  if (score === undefined || score === null) return 'N/A';
  return `${score}/${SCORING_CONSTANTS.MAX_TOTAL_SCORE}`;
};

// Get scoring criteria by key
export const getScoringCriterion = (key: string) => {
  return SCORING_CRITERIA.find(criterion => criterion.key === key);
};

// Get all scoring criteria keys
export const getScoringCriteriaKeys = (): string[] => {
  return SCORING_CRITERIA.map(criterion => criterion.key);
};

// Export scoring field type for type safety
export type ScoringField = typeof SCORING_CRITERIA[number]['key'];

// Helper to check if a field is a valid scoring field
export const isScoringField = (field: string): field is ScoringField => {
  return SCORING_CRITERIA.some(criterion => criterion.key === field);
};

// Get scoring summary for display
export const getScoringSummary = (scores: OrgScoring): {
  totalScore: number | null;
  progress: ReturnType<typeof getScoringProgress>;
  recommendation: ScoreRecommendation;
  distribution: ReturnType<typeof getScoreDistribution>;
  validation: ReturnType<typeof validateScoring>;
} => {
  const totalScore = calculateAlignmentScore(scores);
  const progress = getScoringProgress(scores);
  const recommendation = getScoreRecommendation(totalScore);
  const distribution = getScoreDistribution(scores);
  const validation = validateScoring(scores);
  
  return {
    totalScore,
    progress,
    recommendation,
    distribution,
    validation
  };
};