import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with standard AI Studio telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const PRIMARY_GEMINI_MODEL = 'gemini-3.8-flash';
const BACKUP_GEMINI_MODEL = 'gemini-3.1-flash-lite';

interface ModelExecutionResult {
  text: string;
  modelUsed: string;
}

/**
 * Executes a structured prompt with automatic failover between valid models.
 * If the primary model encounters a temporary 503 high-demand spike or outage,
 * it immediately fails over to the backup model (gemini-3.1-flash-lite).
 * Diagnostic logs are emitted without exposing API keys, secrets, or prompt texts.
 */
async function generateWithResilientModelFallback(
  prompt: string,
  contextTag: string
): Promise<ModelExecutionResult> {
  if (!ai) {
    throw new Error('GoogleGenAI client not initialized');
  }

  const candidateModels = [PRIMARY_GEMINI_MODEL, BACKUP_GEMINI_MODEL];
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const isBackup = i > 0;
    const startTime = Date.now();

    console.log(
      `[Phoenix Diagnostic] [${contextTag}] ${
        isBackup ? 'Failover attempt' : 'Primary attempt'
      } calling model: "${model}"`
    );

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '';
      if (!text) {
        throw new Error(`Empty response received from ${model}`);
      }

      const elapsed = Date.now() - startTime;
      console.log(
        `[Phoenix Diagnostic] [${contextTag}] Model "${model}" call SUCCEEDED in ${elapsed}ms`
      );

      return { text, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const elapsed = Date.now() - startTime;
      const status = err?.status || err?.code || (String(err?.message || '').includes('503') ? 503 : 'ERR');
      const safeMessage = String(err?.message || 'Unknown error').replace(/[a-zA-Z0-9_-]{35,}/g, '[REDACTED]').slice(0, 160);

      console.warn(
        `[Phoenix Diagnostic] [${contextTag}] Model "${model}" failed after ${elapsed}ms (Status: ${status}). Reason: ${safeMessage}`
      );
    }
  }

  throw lastError || new Error('All candidate Gemini models failed execution');
}

// Health & Status endpoint
app.get('/api/phoenix/health', (req: Request, res: Response) => {
  const isKeyConfigured = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY';
  res.json({
    hasApiKey: isKeyConfigured,
    model: PRIMARY_GEMINI_MODEL,
    backupModel: BACKUP_GEMINI_MODEL,
    provider: 'Google GenAI SDK (@google/genai)',
    statusMessage: isKeyConfigured
      ? 'Gemini intelligence online (primary: gemini-3.8-flash, backup: gemini-3.1-flash-lite)'
      : 'No GEMINI_API_KEY configured; running on local deterministic evidence engine',
  });
});

// Analyze Decision endpoint
app.post('/api/phoenix/analyze', async (req: Request, res: Response) => {
  const { decision, evidencePack } = req.body;

  if (!decision || !evidencePack || !Array.isArray(evidencePack)) {
    return res.status(400).json({ error: 'Missing decision or evidencePack in request body' });
  }

  // Graceful fallback if no Gemini client configured
  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: false,
      fallbackRequired: true,
      reason: 'GEMINI_API_KEY not configured or placeholder detected',
    });
  }

  const validEvidenceIds: string[] = evidencePack.map((e: any) => e.id);

  const prompt = `
You are the intelligence engine of PHOENIX — Engineering Experience Intelligence for NovaStack.
Phoenix is an evidence-grounded hindsight system, NOT a generic AI chatbot.

Evaluate the following proposed engineering decision using ONLY the provided NovaStack organizational memory evidence pack.
Do NOT invent fictional company history, teams, incidents, ADR numbers, or statistics.
If the evidence pack is insufficient to evaluate an aspect, explicitly state that in "unknowns".

=== PROPOSED DECISION ===
ID: ${decision.id}
Question: "${decision.question}"
Scope: ${decision.scope}
Target Throughput: ${decision.targetThroughput}
Impacted Services: ${decision.impactedServices?.join(', ') || 'N/A'}
Proposed Technology: ${decision.proposedTech || 'N/A'}
Current Technology: ${decision.currentTech || 'N/A'}
Precedent IDs linked: ${decision.precedentIds?.join(', ') || 'N/A'}

=== RETRIEVED ORGANIZATIONAL EVIDENCE PACK ===
${JSON.stringify(evidencePack, null, 2)}

=== INSTRUCTIONS ===
1. Analyze what happened before in NovaStack history when similar systems, migrations, or technologies were attempted.
2. Formulate a Phoenix Reflection explaining:
   - What happened before
   - What the organization believed at the time
   - What actually happened in production
   - What was learned
   - Why that history matters specifically to this proposed decision
3. Distinguish verifiable historical fact from AI inference in "explainability".
4. Identify real contradictions or trade-offs (e.g. high throughput capability demonstrated in benchmarks vs. integration delays and consumer lag blindspots observed in production).
5. All referenced evidence IDs in "evidenceIds" MUST be selected ONLY from: [${validEvidenceIds.join(', ')}].

Return strict JSON adhering to this structure:
{
  "decisionSummary": "Short recap of what is being decided",
  "verdictSummary": "2-3 sentences synthesizing evidence-grounded perspective without removing human agency",
  "primaryRisk": "Primary historical risk signal derived directly from past incidents or slip",
  "confidence": 88,
  "relevantExperiences": [
    {
      "experienceId": "ID from evidence pack",
      "title": "Title from evidence pack",
      "relevanceToDecision": "Why this specific precedent applies"
    }
  ],
  "recurringPatterns": [
    "Pattern 1 observed across past records"
  ],
  "contradictions": [
    "Identified contradiction or architectural trade-off"
  ],
  "historicalRisks": [
    "Concrete risk derived from evidence"
  ],
  "lessons": [
    "Extractable organizational lesson"
  ],
  "unknowns": [
    "What the historical memory does NOT cover and remains uncertain"
  ],
  "recommendedSafeguards": [
    "Specific mandatory guardrail derived from past post-mortems"
  ],
  "evidenceIds": ["IDs actually cited"],
  "reflection": {
    "whatHappenedBefore": "Historical context from evidence pack",
    "whatOrganizationBelieved": "The original expectation / optimism",
    "whatActuallyHappened": "The production reality / failure mode",
    "whatWasLearned": "Extracted institutional insight",
    "whyHistoryMattersNow": "Direct implication for this decision"
  },
  "explainability": {
    "evidenceRecordsUsed": [
      {
        "id": "ID",
        "title": "Title",
        "whyRelevant": "Relevance explanation",
        "groundedExcerpt": "Brief factual citation"
      }
    ],
    "recurringPatternDetected": "Primary systemic pattern",
    "contradictionsConsidered": ["Contradiction 1"],
    "evidenceVsInference": [
      {
        "historicalFact": "Direct empirical fact recorded in NovaStack history",
        "aiInference": "Synthesized foresight or risk projection for the proposed decision"
      }
    ]
  }
}
`;

  try {
    const { text, modelUsed } = await generateWithResilientModelFallback(
      prompt,
      'analyzeDecision'
    );

    const parsed = JSON.parse(text);

    // Sanitize evidenceIds so NO hallucinated IDs leak through
    const sanitizedEvidenceIds = Array.isArray(parsed.evidenceIds)
      ? parsed.evidenceIds.filter((id: string) => validEvidenceIds.includes(id))
      : validEvidenceIds.slice(0, 3);

    // Also sanitize explainability records
    if (parsed.explainability && Array.isArray(parsed.explainability.evidenceRecordsUsed)) {
      parsed.explainability.evidenceRecordsUsed = parsed.explainability.evidenceRecordsUsed.filter((r: any) =>
        validEvidenceIds.includes(r.id)
      );
    }

    res.json({
      success: true,
      data: {
        ...parsed,
        evidenceIds: sanitizedEvidenceIds,
        modelUsed,
        isAiGenerated: true,
        sourceEngine: 'gemini',
      },
    });
  } catch (err: any) {
    const safeError = String(err?.message || 'Gemini processing failure')
      .replace(/[a-zA-Z0-9_-]{35,}/g, '[REDACTED]')
      .slice(0, 200);
    console.error(
      '[Phoenix Diagnostic] [analyzeDecision] All models failed. Triggering deterministic fallback. Error:',
      safeError
    );
    res.json({
      success: false,
      fallbackRequired: true,
      error: safeError,
    });
  }
});

// Pre-Mortem Synthesis endpoint
app.post('/api/phoenix/pre-mortem', async (req: Request, res: Response) => {
  const { decision, evidencePack } = req.body;

  if (!decision || !evidencePack || !Array.isArray(evidencePack)) {
    return res.status(400).json({ error: 'Missing decision or evidencePack in request body' });
  }

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: false,
      fallbackRequired: true,
      reason: 'GEMINI_API_KEY not configured or placeholder detected',
    });
  }

  const validEvidenceIds: string[] = evidencePack.map((e: any) => e.id);

  const prompt = `
You are the Pre-Mortem Simulation Module of PHOENIX for NovaStack.
Given the proposed engineering decision and retrieved NovaStack organizational history, predict plausible failure patterns grounded specifically in previous NovaStack experiences.

Do NOT produce generic invented failure scenarios. Every failure mode must cite a real precedent from the evidence pack.
Allowed precedent IDs: [${validEvidenceIds.join(', ')}].

=== PROPOSED DECISION ===
ID: ${decision.id}
Question: "${decision.question}"
Scope: ${decision.scope}
Target Throughput: ${decision.targetThroughput}
Impacted Services: ${decision.impactedServices?.join(', ') || 'N/A'}
Proposed Technology: ${decision.proposedTech || 'N/A'}

=== EVIDENCE PACK ===
${JSON.stringify(evidencePack, null, 2)}

Return strict JSON adhering to this schema:
{
  "scenarios": [
    {
      "id": "SCEN-01",
      "failureMode": "Specific failure mechanism during burst or cutover",
      "historicalIncidentProof": "Direct match or correlation with specific record in evidence pack",
      "precedentId": "Exact ID from evidence pack",
      "probability": "High",
      "earlyWarningIndicator": "Concrete metric or telemetry signal in Prometheus, Datadog, or logs",
      "requiredMitigationBeforeCutover": "Actionable technical guardrail",
      "affectedArea": "Affected service or subsystem",
      "suggestedSafeguard": "Short safeguard title",
      "confidence": 91
    }
  ]
}
`;

  try {
    const { text, modelUsed } = await generateWithResilientModelFallback(
      prompt,
      'generatePreMortem'
    );

    const parsed = JSON.parse(text);
    const scenarios = Array.isArray(parsed.scenarios) ? parsed.scenarios : [];

    // Ensure all precedentIds exist in validEvidenceIds
    const sanitizedScenarios = scenarios.map((s: any, idx: number) => {
      const validPrecedent = validEvidenceIds.includes(s.precedentId)
        ? s.precedentId
        : validEvidenceIds[0] || 'ADR-017';

      return {
        ...s,
        id: s.id || `SCEN-0${idx + 1}`,
        precedentId: validPrecedent,
        modelUsed,
        isAiGenerated: true,
        sourceEngine: 'gemini',
        mitigationStatus: 'unmitigated',
      };
    });

    res.json({
      success: true,
      scenarios: sanitizedScenarios,
    });
  } catch (err: any) {
    const safeError = String(err?.message || 'Gemini pre-mortem processing failure')
      .replace(/[a-zA-Z0-9_-]{35,}/g, '[REDACTED]')
      .slice(0, 200);
    console.error(
      '[Phoenix Diagnostic] [generatePreMortem] All models failed. Triggering deterministic fallback. Error:',
      safeError
    );
    res.json({
      success: false,
      fallbackRequired: true,
      error: safeError,
    });
  }
});

// Start Full-Stack Server
async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Phoenix full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer();
