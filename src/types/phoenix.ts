export type ExperienceType = 'ADR' | 'EXP' | 'INC' | 'DEC' | 'POST_MORTEM' | 'PR';

export type SourceFilter = 'all' | 'prs' | 'postmortems' | 'adrs' | 'experiments' | 'incidents';

export type SignalStrength = 'Strong historical signal' | 'Moderate historical signal' | 'Emerging signal';

export interface Experience {
  id: string; // e.g., 'ADR-017', 'INC-011'
  type: ExperienceType;
  title: string;
  system: string;
  domain: string;
  expectedOutcome?: string;
  outcome: string;
  reflection?: string;
  lesson: string;
  date: string;
  team: string;
  authors: string[];
  severity?: 'critical' | 'high' | 'moderate' | 'low';
  impactDuration?: string;
  tags: string[];
  evidenceSummary: string;
  artifacts?: {
    label: string;
    ref: string;
  }[];
  keyMetrics?: {
    label: string;
    value: string;
  }[];
}

export interface LearnedObservation {
  id: string; // '01', '02', '03'
  title: string;
  signalStrength: SignalStrength;
  basedOn: string; // e.g. '4 migrations · 3 projects'
  summary: string;
  supportingExperienceIds: string[];
  keyRisk: string;
  recommendedPractice: string;
}

export interface DecisionContext {
  id: string;
  question: string;
  scope: string;
  targetThroughput: string;
  impactedServices: string[];
  precedentIds: string[];
  proposedTech: string;
  currentTech: string;
  submittedBy: string;
  timestamp: string;
  status?: 'active_rfc' | 'adopted' | 'superseded' | 'under_review';
}

export interface PhoenixReflection {
  whatHappenedBefore: string;
  whatOrganizationBelieved: string;
  whatActuallyHappened: string;
  whatWasLearned: string;
  whyHistoryMattersNow: string;
}

export interface EvidenceRecordRef {
  id: string;
  title: string;
  whyRelevant: string;
  groundedExcerpt: string;
}

export interface EvidenceVsInferenceItem {
  historicalFact: string;
  aiInference: string;
}

export interface ExplainabilityDossier {
  evidenceRecordsUsed: EvidenceRecordRef[];
  recurringPatternDetected: string;
  contradictionsConsidered: string[];
  evidenceVsInference: EvidenceVsInferenceItem[];
}

export interface DecisionAnalysisResult {
  confidenceScore: number;
  verdictSummary: string;
  primaryRisk: string;
  historicalPrecedents: {
    experienceId: string;
    title: string;
    similarity: string;
    historicalOutcome: string;
    takeaway: string;
  }[];
  recommendedGuardrails: string[];
  blindspotsIdentified: string[];
  // Phase 2 Gemini intelligence fields
  isAiGenerated?: boolean;
  modelUsed?: string;
  sourceEngine?: 'gemini' | 'local_fallback';
  reflection?: PhoenixReflection;
  recurringPatterns?: string[];
  contradictions?: string[];
  unknowns?: string[];
  explainability?: ExplainabilityDossier;
  evidenceIds?: string[];
  rawGeminiError?: string;
}

export interface PreMortemScenario {
  id: string;
  failureMode: string;
  historicalIncidentProof: string;
  precedentId: string;
  probability: 'High' | 'Moderate' | 'Low';
  earlyWarningIndicator: string;
  requiredMitigationBeforeCutover: string;
  mitigationStatus?: 'unmitigated' | 'in_progress' | 'mitigated';
  // Phase 2 Gemini intelligence fields
  affectedArea?: string;
  suggestedSafeguard?: string;
  confidence?: number;
  isAiGenerated?: boolean;
  sourceEngine?: 'gemini' | 'local_fallback';
  modelUsed?: string;
  evidenceIds?: string[];
}

export interface AiEngineStatus {
  hasApiKey: boolean;
  model: string;
  provider: string;
  statusMessage: string;
}
