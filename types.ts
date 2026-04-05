
export enum ElementStatus {
  CLEAR = 'CLEAR',
  BROAD = 'BROAD',
  MISSING = 'MISSING',
}

export type ModelMode = 'reasoning' | 'quick';
export type AnalysisPipeline = 'lens' | 'term' | 'plain';

export interface AnalysisElement {
  content: string;
  status: ElementStatus;
  reasoning: string;
}

export interface Assumption {
  assumption: string;
  flaw: string;
  reality: string;
}

export interface VerificationRequirement {
  requirement: string;
  gap: string;
}

export interface WorstLine {
  text: string;
  flaw: string;
}

export interface RhetoricDensity {
  binding_count: number;
  rhetorical_count: number;
  rhetorical_percentage: number;
}

export interface RiskProfile {
  tier_1_count: number;
  tier_2_count: number;
  tier_3_count: number;
  unverifiable_claim_count: number;
  worst_lines: WorstLine[];
}

export interface StatementAnalysis {
  original_text: string;
  highlighted_text: string;
  debate_reason: string;
  risk_profile: RiskProfile;
  rhetoric_density: RhetoricDensity;
  assumptions_to_avoid: Assumption[];
  verification_requirements: VerificationRequirement[];
  elements: {
    who: AnalysisElement;
    action: AnalysisElement;
    object: AnalysisElement;
    measure: AnalysisElement;
    when: AnalysisElement;
    premise: AnalysisElement;
  };
}

export interface FullAnalysisResponse {
  statement_analysis: StatementAnalysis;
  literal_translation: string;
}

// --- Klariterm Types ---

export interface ClauseImpactScores {
  asymmetry: number; // A
  unilateral: number; // U
  rights: number; // R
  scope: number; // S
  latent: number; // L
  total_cis: number;
}

export interface DecoderClause {
  excerpt: string;
  description: string;
  scores: ClauseImpactScores;
  impact_classification: 'Low' | 'Moderate' | 'High';
}

export interface DecoderMetrics {
  hicr: number; // High-Impact Clause Ratio
  isi: number; // Impact Skew Index
  exposure_domains: string[];
}

export interface KlaritermResponse {
  overview: string;
  attention_clauses: DecoderClause[];
  structural_exposure: string[];
  metrics: DecoderMetrics;
}

// --- KlariPlain Types ---

export interface KlariPlainResponse {
  commitments: string[];
  explicitly_stated: string[];
  not_specified: string[];
}

export enum KlaritexLevel {
  LEVEL_1 = 'Level 1 (Solid)',
  LEVEL_2 = 'Level 2 (Hazy)',
  LEVEL_3 = 'Level 3 (Empty)',
}

export interface CalculatedScore {
  rawPenaltyScore: number;
  finalAmbiguityScore: number;
  tier: KlaritexLevel;
  missingCount: number;
  criticalFailure: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  score?: CalculatedScore;
  analysis: FullAnalysisResponse | KlaritermResponse | KlariPlainResponse;
  pipeline: AnalysisPipeline;
}
