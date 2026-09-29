/**
 * Primary service boundary for Phoenix Engineering Experience Intelligence.
 *
 * Implements the 10-step intelligence pipeline:
 * 1. Proposed User Decision
 * 2. Evidence Pack Retrieval from NovaStack Memory
 * 3. Compact Structured Grounding
 * 4. Gemini Analysis via server-side endpoint (/api/phoenix/analyze)
 * 5. Phoenix Reflection (what happened before, what was believed, production reality, lessons)
 * 6. Evidence-grounded Pre-Mortem Synthesis (/api/phoenix/pre-mortem)
 * 7. Explainability ("Why does Phoenix think this?")
 * 8. Graceful Fallback with clear provenance labeling
 * 9. Polished loading & error telemetry
 * 10. Verified demo scenario: Notification Service -> Kafka
 */

import {
  Experience,
  SourceFilter,
  DecisionContext,
  DecisionAnalysisResult,
  PreMortemScenario,
  AiEngineStatus,
} from '../types/phoenix';
import { MOCK_EXPERIENCES, PRE_MORTEM_SCENARIOS } from '../data/mockMemory';

/**
 * Checks the status of the server-side Gemini intelligence engine.
 */
export async function checkEngineStatus(): Promise<AiEngineStatus> {
  try {
    const res = await fetch('/api/phoenix/health');
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    const data = await res.json();
    return {
      hasApiKey: !!data.hasApiKey,
      model: data.model || 'gemini-3.8-flash',
      provider: data.provider || 'Google GenAI SDK (@google/genai)',
      statusMessage: data.statusMessage || (data.hasApiKey ? 'Gemini 3.8 Flash Online' : 'Local Deterministic Fallback Active'),
    };
  } catch (err: any) {
    return {
      hasApiKey: false,
      model: 'gemini-3.8-flash',
      provider: 'Local Memory Engine',
      statusMessage: 'Local deterministic evidence engine (server offline or standalone mode)',
    };
  }
}

/**
 * Searches and ranks the most relevant historical NovaStack experiences to construct
 * a compact, highly focused evidence pack for Gemini reasoning.
 */
export function constructEvidencePack(
  decision: DecisionContext,
  allExperiences: Experience[] = MOCK_EXPERIENCES
): Experience[] {
  const queryTokens = [
    decision.question,
    decision.scope,
    decision.proposedTech,
    decision.currentTech,
    ...(decision.impactedServices || []),
    ...(decision.precedentIds || []),
  ].join(' ').toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  // Score each experience in memory based on relevance
  const scored = allExperiences.map((exp) => {
    let score = 0;

    // Explicit precedent ID match
    if (decision.precedentIds?.includes(exp.id)) {
      score += 10;
    }

    // Direct technology keywords
    const expText = [
      exp.id,
      exp.title,
      exp.system,
      exp.domain,
      exp.expectedOutcome || '',
      exp.outcome,
      exp.reflection || '',
      exp.lesson,
      exp.evidenceSummary,
      ...exp.tags,
    ].join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (expText.includes(token)) {
        score += 2;
      }
    }

    // High signal boost for Kafka / RabbitMQ when question is messaging related
    const isMessaging = decision.question.toLowerCase().includes('kafka') ||
      decision.question.toLowerCase().includes('rabbitmq') ||
      decision.scope.toLowerCase().includes('messaging');

    if (isMessaging && ['ADR-017', 'INC-011', 'EXP-024', 'EXP-018', 'INC-009'].includes(exp.id)) {
      score += 8;
    }

    return { exp, score };
  });

  // Sort descending and select top 5 distinct records
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((s) => s.exp);
}

/**
 * Retrieves past experiences matching a freeform query and optional source filter.
 */
export async function retrieveRelevantExperiences(
  query: string,
  filter: SourceFilter = 'all'
): Promise<Experience[]> {
  const normalizedQuery = query.toLowerCase().trim();

  return MOCK_EXPERIENCES.filter((item) => {
    if (filter === 'prs' && item.type !== 'PR') return false;
    if (filter === 'postmortems' && item.type !== 'POST_MORTEM' && item.type !== 'INC') return false;
    if (filter === 'adrs' && item.type !== 'ADR') return false;
    if (filter === 'experiments' && item.type !== 'EXP') return false;
    if (filter === 'incidents' && item.type !== 'INC') return false;

    if (!normalizedQuery) return true;

    const searchCorpus = [
      item.id,
      item.title,
      item.system,
      item.domain,
      item.expectedOutcome || '',
      item.outcome,
      item.reflection || '',
      item.lesson,
      item.evidenceSummary,
      ...item.tags,
    ].join(' ').toLowerCase();

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    return terms.some((term) => searchCorpus.includes(term));
  });
}

/**
 * Core Decision Evaluation Pipeline.
 * Attempts server-side Gemini 3.8 Flash evaluation first.
 * If Gemini is not configured, quota is exceeded, or API call fails, seamlessly falls back
 * to deterministic local evidence evaluation while transparently labeling the source engine.
 */
export async function analyzeDecision(
  decision: DecisionContext,
  experiences: Experience[] = MOCK_EXPERIENCES,
  onProgress?: (stage: string) => void
): Promise<DecisionAnalysisResult> {
  onProgress?.('Retrieving organizational memory…');
  const evidencePack = constructEvidencePack(decision, experiences);

  onProgress?.('Cross-referencing previous decisions & post-mortems…');

  // Attempt server-side Gemini API call
  try {
    const res = await fetch('/api/phoenix/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, evidencePack }),
    });

    if (res.ok) {
      const payload = await res.json();

      if (payload.success && payload.data) {
        onProgress?.('Synthesizing hindsight from Gemini…');

        const geminiData = payload.data;
        const validIds = evidencePack.map((e) => e.id);

        // Sanitize and map historical precedents
        const historicalPrecedents = Array.isArray(geminiData.relevantExperiences)
          ? geminiData.relevantExperiences
              .filter((re: any) => validIds.includes(re.experienceId))
              .map((re: any) => {
                const matchedExp = evidencePack.find((e) => e.id === re.experienceId);
                return {
                  experienceId: re.experienceId,
                  title: re.title || matchedExp?.title || 'Historical Precedent',
                  similarity: re.relevanceToDecision || 'Direct historical match',
                  historicalOutcome: matchedExp?.outcome || 'Outcome recorded in ledger',
                  takeaway: matchedExp?.lesson || 'Lesson extracted in memory',
                };
              })
          : [];

        // If Gemini returned an empty list, default to top evidence pack items
        const finalPrecedents = historicalPrecedents.length > 0
          ? historicalPrecedents
          : evidencePack.slice(0, 3).map((exp) => ({
              experienceId: exp.id,
              title: exp.title,
              similarity: 'Direct architectural precedent in evidence pack',
              historicalOutcome: exp.outcome,
              takeaway: exp.lesson,
            }));

        return {
          confidenceScore: typeof geminiData.confidence === 'number' ? geminiData.confidence : 89,
          verdictSummary: geminiData.verdictSummary || 'Synthesis completed from NovaStack memory.',
          primaryRisk: geminiData.primaryRisk || 'Integration complexity and consumer lag blindspot.',
          historicalPrecedents: finalPrecedents,
          recommendedGuardrails: Array.isArray(geminiData.recommendedSafeguards)
            ? geminiData.recommendedSafeguards
            : [
                'Pre-deploy consumer lag exporters and alert thresholds to staging 14 days before cutover.',
                'Mandate a 72-hour zero-traffic soak test with downstream dependencies.',
              ],
          blindspotsIdentified: Array.isArray(geminiData.unknowns) && geminiData.unknowns.length > 0
            ? geminiData.unknowns
            : ['Target throughput under unexpected backpressure has not been stress tested.'],
          isAiGenerated: true,
          sourceEngine: 'gemini',
          modelUsed: geminiData.modelUsed || 'gemini-3.8-flash',
          reflection: geminiData.reflection,
          recurringPatterns: geminiData.recurringPatterns,
          contradictions: geminiData.contradictions,
          unknowns: geminiData.unknowns,
          explainability: geminiData.explainability,
          evidenceIds: Array.isArray(geminiData.evidenceIds) && geminiData.evidenceIds.length > 0
            ? geminiData.evidenceIds
            : evidencePack.slice(0, 3).map((e) => e.id),
        };
      }
    }
  } catch (err: any) {
    console.warn('Gemini API call failed, activating graceful deterministic local fallback:', err);
  }

  // Graceful Local Deterministic Fallback
  onProgress?.('Synthesizing hindsight (Local Memory Engine)…');
  return generateDeterministicFallback(decision, evidencePack);
}

/**
 * Deterministic local synthesis engine used when Gemini API is unavailable or offline.
 */
function generateDeterministicFallback(
  decision: DecisionContext,
  evidencePack: Experience[]
): DecisionAnalysisResult {
  const isMessaging =
    decision.question.toLowerCase().includes('kafka') ||
    decision.question.toLowerCase().includes('rabbitmq') ||
    decision.scope.toLowerCase().includes('messaging');

  const evidenceIds = evidencePack.map((e) => e.id);

  if (isMessaging) {
    return {
      confidenceScore: 92,
      verdictSummary:
        'Historical evidence confirms high throughput capability (EXP-024: 4.2M ev/day sustained), but strongly signals critical risk of integration schedule overrun (ADR-017: +11 days late) and post-cutover consumer lag blindspots (INC-011: 47m outage).',
      primaryRisk:
        'Underestimating downstream consumer backpressure integration, DLQ calibration, and rebalance stability.',
      historicalPrecedents: [
        {
          experienceId: 'ADR-017',
          title: 'Kafka Migration — Billing Platform',
          similarity: '96% architectural similarity',
          historicalOutcome: 'Completed 11 days late',
          takeaway: 'Integration and operational complexity were underestimated.',
        },
        {
          experienceId: 'INC-011',
          title: 'Consumer Monitoring Blindspot',
          similarity: '91% failure-mode similarity',
          historicalOutcome: '47-minute customer impact',
          takeaway: 'Observability should exist before production cutover.',
        },
        {
          experienceId: 'EXP-024',
          title: 'Kafka Event Streaming Benchmark',
          similarity: '88% throughput benchmark correlation',
          historicalOutcome: 'Sustained 4.2M events/day',
          takeaway: 'Kafka throughput exceeded production requirements.',
        },
      ],
      recommendedGuardrails: [
        'Pre-deploy consumer lag exporters and alert thresholds to staging 14 days before any live traffic shift (Derived from INC-011).',
        'Configure CooperativeStickyAssignor and tune max.poll.interval.ms on push-router to prevent rebalancing storms.',
        'Mandate shadow dual-writing with mock ledger consumers for 72 hours before decommissioning RabbitMQ exchanges (Derived from ADR-017).',
      ],
      blindspotsIdentified: [
        `Target throughput (${decision.targetThroughput || '120k msg/s'}) is supported by broker benchmarks, but push-router memory footprint under backpressure is untested.`,
        'Billing platform integration required custom dead-letter queue handlers; notification service has no documented DLQ recovery plan.',
      ],
      isAiGenerated: false,
      sourceEngine: 'local_fallback',
      modelUsed: 'NovaStack Local Memory Engine v2.4 (Deterministic Fallback)',
      evidenceIds: ['ADR-017', 'INC-011', 'EXP-024', 'EXP-018', 'INC-009'],
      reflection: {
        whatHappenedBefore:
          'In Q4 2024, the Billing team migrated from RabbitMQ to Apache Kafka to handle peak seasonal transaction volumes (ADR-017). Earlier benchmark EXP-024 validated that Kafka could comfortably sustain 4.2M events/day.',
        whatOrganizationBelieved:
          'The team estimated 14 engineering days, believing Kafka broker provisioning and Terraform scripts constituted the primary workload.',
        whatActuallyHappened:
          'Core cluster setup took only 4 days, but downstream client SDK adaptations, dead-letter queue routing, and consumer group rebalances slipped schedule by 11 days. Three months later, INC-011 caused a 47-minute outage because consumer lag monitoring was deferred.',
        whatWasLearned:
          'The messaging engine itself is rarely the bottleneck; the edge integration and observability gates are where 70% of organizational friction accumulates.',
        whyHistoryMattersNow:
          `For ${decision.question}, while Kafka satisfies the ${decision.targetThroughput} requirement, push-router and billing-service will face identical consumer commit and rebalance risks unless observability is deployed prior to cutover.`,
      },
      recurringPatterns: [
        'Infrastructure migrations consistently underestimate client SDK and edge consumer adaptation by 2.4x.',
        'Observability metrics (consumer lag, partition skew) are frequently deferred to post-launch phases, creating severe detection blindspots.',
      ],
      contradictions: [
        'EXP-024 proved Kafka throughput easily handles peak traffic with 66% headroom, yet ADR-017 delivered 11 days late due to consumer backpressure calibration.',
        'Redis Pub/Sub (EXP-018) offered lower dispatch latency (<1ms) but zero message durability, validating Kafka as the only compliant choice for notifications.',
      ],
      unknowns: [
        'Push-router heap allocation under sustained network partition is not benchmarked.',
        'Schema registry compatibility across Node.js push-router microservices has not been tested in staging.',
      ],
      explainability: {
        evidenceRecordsUsed: [
          {
            id: 'ADR-017',
            title: 'Kafka Migration — Billing Platform',
            whyRelevant: 'Direct architectural precedent of migrating messaging from RabbitMQ to Kafka.',
            groundedExcerpt: 'Core cluster setup took 4 days; consumer backpressure and DLQ calibration took 11 additional days.',
          },
          {
            id: 'INC-011',
            title: 'Consumer Monitoring Blindspot',
            whyRelevant: 'Demonstrates failure mode when observability is omitted before production cutover.',
            groundedExcerpt: 'Rebalancing storm halted message delivery on notification-workers for 47 minutes.',
          },
          {
            id: 'EXP-024',
            title: 'Kafka Event Streaming Benchmark',
            whyRelevant: 'Throughput capacity proof for target workload (>180k msg/s peak).',
            groundedExcerpt: 'Sustained 4.2M events/day across 72 hours continuous stress testing.',
          },
        ],
        recurringPatternDetected:
          'Underestimation of edge consumer backpressure calibration and post-cutover observability gaps.',
        contradictionsConsidered: [
          'High throughput capacity vs. high integration complexity slip.',
          'Ephemeral low-latency Redis dispatch vs. partition-durable Kafka replay.',
        ],
        evidenceVsInference: [
          {
            historicalFact: 'ADR-017 was delivered 11 days late due to consumer group rebalance tuning.',
            aiInference: 'Push-router and billing-service will face identical integration schedule slip without a shadow testing phase.',
          },
          {
            historicalFact: 'INC-011 detection took 38 minutes because Prometheus lag exporter was omitted.',
            aiInference: 'Deploying consumer lag alerts in staging is a mandatory blocking precondition for this decision.',
          },
        ],
      },
    };
  }

  // Generic fallback for custom decisions
  const topExp = evidencePack[0] || MOCK_EXPERIENCES[0];
  return {
    confidenceScore: 84,
    verdictSummary: `Evaluated against ${evidencePack.length} relevant historical precedents in NovaStack memory. Organizational memory indicates that operational complexity and telemetry calibration require explicit pre-cutover verification.`,
    primaryRisk: `Underestimating downstream service integration and operational ownership boundaries for ${decision.scope || 'new infrastructure'}.`,
    historicalPrecedents: evidencePack.slice(0, 3).map((exp, idx) => ({
      experienceId: exp.id,
      title: exp.title,
      similarity: `${86 - idx * 4}% historical signal match`,
      historicalOutcome: exp.outcome,
      takeaway: exp.lesson,
    })),
    recommendedGuardrails: [
      'Define clear service-level objectives and alert thresholds before production cutover (Derived from INC-011).',
      'Conduct a 72-hour zero-traffic soak test with downstream dependencies (Derived from ADR-017).',
      'Enforce exponential reconnect backoff with jitter across all client libraries (Derived from INC-009).',
    ],
    blindspotsIdentified: [
      'Operational runbooks for on-call rotation have not been established for off-hours incidents.',
      'Recovery time objective (RTO) under maximum failure conditions is unverified.',
    ],
    isAiGenerated: false,
    sourceEngine: 'local_fallback',
    modelUsed: 'NovaStack Local Memory Engine v2.4 (Deterministic Fallback)',
    evidenceIds,
    reflection: {
      whatHappenedBefore: `Past projects in ${decision.scope} (such as ${topExp.id}) encountered operational friction during cutover.`,
      whatOrganizationBelieved: 'The initial expectation was that standard service rollout would proceed without client disruption.',
      whatActuallyHappened: `Actual delivery faced ${topExp.outcome.toLowerCase()}, requiring post-launch remediation.`,
      whatWasLearned: topExp.lesson,
      whyHistoryMattersNow: `Applying ${topExp.id}'s lessons to ${decision.question} prevents repeating known architectural blindspots.`,
    },
    recurringPatterns: [
      'Operational ownership must be established before production deployment.',
      'Telemetry must be active in staging 14 days prior to cutover.',
    ],
    contradictions: [],
    unknowns: ['Detailed downstream latency impact under burst conditions.'],
    explainability: {
      evidenceRecordsUsed: evidencePack.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        whyRelevant: `Matches ${decision.scope} operational pattern.`,
        groundedExcerpt: e.evidenceSummary.slice(0, 100),
      })),
      recurringPatternDetected: 'Operational complexity underestimation during infrastructure changes.',
      contradictionsConsidered: [],
      evidenceVsInference: [
        {
          historicalFact: `${topExp.id} experienced: ${topExp.outcome}`,
          aiInference: `Similar risks will manifest in ${decision.id} if mitigations are omitted.`,
        },
      ],
    },
  };
}

/**
 * Pre-Mortem Simulation Pipeline.
 * Connects to Gemini endpoint or falls back gracefully to deterministic failure mode synthesis.
 */
export async function generatePreMortem(
  decision: DecisionContext,
  experiences: Experience[] = MOCK_EXPERIENCES,
  onProgress?: (stage: string) => void
): Promise<PreMortemScenario[]> {
  onProgress?.('Retrieving organizational memory…');
  const evidencePack = constructEvidencePack(decision, experiences);

  onProgress?.('Reconstructing failure patterns with Gemini…');

  try {
    const res = await fetch('/api/phoenix/pre-mortem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, evidencePack }),
    });

    if (res.ok) {
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.scenarios) && payload.scenarios.length > 0) {
        return payload.scenarios.map((s: any) => ({
          ...s,
          modelUsed: s.modelUsed || 'gemini-3.8-flash',
          isAiGenerated: true,
          sourceEngine: 'gemini',
        }));
      }
    }
  } catch (err) {
    console.warn('Gemini pre-mortem call failed, falling back to local simulation:', err);
  }

  // Graceful deterministic fallback
  onProgress?.('Reconstructing failure patterns (Local Memory Engine)…');
  return PRE_MORTEM_SCENARIOS.map((s) => ({
    ...s,
    isAiGenerated: false,
    sourceEngine: 'local_fallback',
    modelUsed: 'Local Memory Engine',
  }));
}

/**
 * Extracts concrete engineering lessons and operational axioms from an experience record.
 */
export async function extractLessons(
  experience: Experience
): Promise<{ primaryLesson: string; operationalAxiom: string }> {
  return {
    primaryLesson: experience.lesson,
    operationalAxiom: `In systems like ${experience.system}, prior incidents show: ${experience.evidenceSummary.slice(0, 100)}...`,
  };
}
