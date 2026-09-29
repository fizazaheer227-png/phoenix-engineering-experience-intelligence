import { Experience, LearnedObservation, DecisionContext, PreMortemScenario } from '../types/phoenix';

export const SUMMARY_METRICS = {
  experiencesRetained: 262,
  decisions: 147,
  experiments: 38,
  incidents: 23,
  learnedObservations: 54,
  organizationsActive: 'NovaStack Core Platform',
  coverageWindow: '2023 – 2026',
};

export const AVAILABLE_DECISIONS: DecisionContext[] = [
  {
    id: 'DEC-089',
    question: 'Should we migrate our notification service from RabbitMQ to Kafka?',
    scope: 'Distributed Messaging',
    targetThroughput: '120k msg/s',
    impactedServices: ['billing-service', 'push-router'],
    precedentIds: ['EXP-018', 'INC-009', 'ADR-017', 'INC-011'],
    proposedTech: 'Apache Kafka 3.7 (Strimzi Operator / Managed Cluster)',
    currentTech: 'RabbitMQ 3.12 (AMQP 0-9-1 cluster)',
    submittedBy: 'Platform Architecture Guild',
    timestamp: '2 days ago',
    status: 'active_rfc',
  },
  {
    id: 'DEC-090',
    question: 'Should we deploy PgBouncer connection pooling sidecars for the User Store?',
    scope: 'User Data Store & Auth',
    targetThroughput: '45k queries/s',
    impactedServices: ['auth-service', 'account-ledger', 'api-gateway'],
    precedentIds: ['ADR-031', 'INC-009'],
    proposedTech: 'PgBouncer in Transaction Mode (HA sidecars)',
    currentTech: 'Direct PostgreSQL connections from microservice pools',
    submittedBy: 'Database Operations',
    timestamp: '4 days ago',
    status: 'under_review',
  },
  {
    id: 'DEC-091',
    question: 'Should we migrate product catalog search from Elasticsearch to OpenSearch 2.12?',
    scope: 'Discovery & Catalog Indexing',
    targetThroughput: '85k search req/s',
    impactedServices: ['catalog-api', 'recommendation-engine'],
    precedentIds: ['ADR-026', 'INC-004'],
    proposedTech: 'OpenSearch 2.12 Managed Cluster with Vector Search',
    currentTech: 'Self-hosted Elasticsearch 7.17 cluster',
    submittedBy: 'Search & Relevance Guild',
    timestamp: '1 week ago',
    status: 'under_review',
  },
  {
    id: 'DEC-092',
    question: 'Should we replace Redis Pub/Sub with persistent Kafka topics for session synchronization?',
    scope: 'Session & Streaming Fabric',
    targetThroughput: '220k events/s',
    impactedServices: ['session-gateway', 'realtime-presence'],
    precedentIds: ['EXP-018', 'EXP-024'],
    proposedTech: 'Apache Kafka compacted topics',
    currentTech: 'Redis Cluster Pub/Sub (ephemeral)',
    submittedBy: 'Edge Services',
    timestamp: '2 weeks ago',
    status: 'under_review',
  },
];

export const CURRENT_DECISION: DecisionContext = AVAILABLE_DECISIONS[0];

export const LEARNED_OBSERVATIONS: LearnedObservation[] = [
  {
    id: '01',
    title: 'Integration effort is consistently underestimated',
    signalStrength: 'Strong historical signal',
    basedOn: '4 migrations · 3 projects',
    summary: 'Across our last four data transport migrations, client SDK wiring, consumer group balancing, and downstream idempotency took 2.4x longer than core cluster provisioning.',
    supportingExperienceIds: ['ADR-017', 'ADR-026', 'EXP-018'],
    keyRisk: 'Teams allocate estimation budget to the messaging engine rather than edge integration, backpressure semantics, and consumer rebalances.',
    recommendedPractice: 'Mandate a 72-hour zero-traffic integration dry run with mock downstream consumers before scheduling production cutover.',
  },
  {
    id: '02',
    title: 'Managed infrastructure performs better when operational ownership is explicit',
    signalStrength: 'Strong historical signal',
    basedOn: '5 experiences · 4 teams',
    summary: 'Managed services only reduced operational burden when partition management, rebalancing runbooks, and broker alerting had a designated team on-call rotation.',
    supportingExperienceIds: ['ADR-017', 'INC-009', 'EXP-024'],
    keyRisk: 'Assuming cloud-managed services eliminate runbooks leads to delayed response times during consumer group lag spikes.',
    recommendedPractice: 'Define partition topology and tier-1 alert thresholds in service-level agreements prior to production traffic deployment.',
  },
  {
    id: '03',
    title: 'Observability is frequently introduced too late',
    signalStrength: 'Moderate historical signal',
    basedOn: '3 incidents · 2 migrations',
    summary: 'Consumer lag metrics, partition skew detection, and end-to-end trace propagation were added after production cutovers, resulting in severe visibility gaps during initial degradations.',
    supportingExperienceIds: ['INC-011', 'INC-004'],
    keyRisk: 'Silent consumer stagnation where messages accumulate undetected until downstream customer timeouts trip alerts.',
    recommendedPractice: 'Require consumer lag telemetry and distributed trace context propagation as hard gating criteria for production readiness reviews.',
  },
];

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 'ADR-017',
    type: 'ADR',
    title: 'Kafka Migration — Billing Platform',
    system: 'Billing Platform',
    domain: 'Financial Transactions & Ledgers',
    expectedOutcome: 'Expected clean drop-in transport upgrade completed within 14 engineering days with zero ledger interruption.',
    outcome: 'Completed 11 days late',
    reflection: 'We budgeted time for Kafka broker setup and Terraform scripts, but drastically underestimated the subtle work required to adapt 14 legacy ledger microservices to Kafka partition commit semantics and dead-letter queues.',
    lesson: 'Integration and operational complexity were underestimated.',
    date: 'Oct 2024',
    team: 'Billing Infrastructure',
    authors: ['E. Chen', 'M. Kowalski'],
    severity: 'high',
    tags: ['Kafka', 'RabbitMQ', 'Billing', 'Data Migration'],
    evidenceSummary: 'Core cluster setup took 4 days, but consumer backpressure calibration and dead-letter queue integration with legacy ledger microservices required 11 unexpected engineering days.',
    artifacts: [
      { label: 'Architecture Decision Record', ref: 'adr/017-kafka-billing-cutover.md' },
      { label: 'Post-Migration Review', ref: 'retros/2024-q4-billing-transport.pdf' }
    ],
    keyMetrics: [
      { label: 'Initial Estimate', value: '14 days' },
      { label: 'Actual Delivery', value: '25 days' },
      { label: 'Consumer Lag P99', value: '18ms' }
    ]
  },
  {
    id: 'EXP-024',
    type: 'EXP',
    title: 'Kafka Event Streaming Benchmark',
    system: 'Event Fabric',
    domain: 'Core Platform Engineering',
    expectedOutcome: 'Validate if a 3-broker Apache Kafka cluster can handle at least 100k events/sec without broker CPU saturation.',
    outcome: 'Sustained 4.2M events/day',
    reflection: 'Partition log throughput scaled smoothly with minimal GC pauses when batch size was configured to 64KB and LZ4 compression was enabled. Exceeded production throughput targets with 66% headroom.',
    lesson: 'Kafka throughput exceeded production requirements.',
    date: 'Dec 2024',
    team: 'Core Platform',
    authors: ['A. Vance', 'S. Lindqvist'],
    severity: 'low',
    tags: ['Kafka', 'Benchmarking', 'Throughput', 'Performance'],
    evidenceSummary: 'Load harness tested 3-broker cluster against synthetic 180k msg/s peak bursts. Partitioning strategy scaled linearly with zero dropped frames across 72 hours continuous stress.',
    artifacts: [
      { label: 'Benchmark Notebook', ref: 'benchmarks/kafka-3broker-perf.ipynb' },
      { label: 'Grafana Dashboard Snapshot', ref: 'dashboards/perf-harness-run-08' }
    ],
    keyMetrics: [
      { label: 'Sustained Rate', value: '4.2M ev/day' },
      { label: 'Peak Burst', value: '184k msg/s' },
      { label: 'Broker CPU Load', value: '34%' }
    ]
  },
  {
    id: 'INC-011',
    type: 'INC',
    title: 'Consumer Monitoring Blindspot',
    system: 'Data Pipeline Core',
    domain: 'Event Ingestion',
    expectedOutcome: 'Notification workers were supposed to transparently rebalance partitions upon node scale-out.',
    outcome: '47-minute customer impact',
    reflection: 'Because consumer lag metrics and partition skew exporters were deferred to Phase 2 of rollout, a rebalancing loop stalled notification dispatch for 38 minutes before anyone noticed customer support escalation tickets.',
    lesson: 'Observability should exist before production cutover.',
    date: 'Jan 2025',
    team: 'Observability & SRE',
    authors: ['R. Patel', 'D. Sorenson'],
    severity: 'critical',
    impactDuration: '47m',
    tags: ['Incident', 'Observability', 'Kafka', 'Consumer Lag'],
    evidenceSummary: 'A rebalancing storm halted message delivery on consumer group notification-workers. Because Prometheus consumer-lag exporter was scheduled for Phase 2, detection was delayed until user complaints.',
    artifacts: [
      { label: 'Incident Post-Mortem', ref: 'incidents/2025-01-14-consumer-stagnation.md' },
      { label: 'Root Cause Analysis', ref: 'rca/rca-inc-011-lag-blindspot.pdf' }
    ],
    keyMetrics: [
      { label: 'MTTD (Detection)', value: '38 minutes' },
      { label: 'MTTR (Recovery)', value: '9 minutes' },
      { label: 'Unprocessed Queue', value: '840k msgs' }
    ]
  },
  {
    id: 'ADR-026',
    type: 'ADR',
    title: 'Search Infrastructure Migration',
    system: 'Search Service',
    domain: 'Discovery & Catalog',
    expectedOutcome: 'Complete index rebuild and client switchover within a 3-week sprint.',
    outcome: 'Integration estimate exceeded',
    reflection: 'The indexing engine was migrated quickly, but client compatibility layers across 6 upstream services exceeded initial schedule by 180%. Re-emphasized systemic underestimation of edge consumer changes.',
    lesson: 'Validate infrastructure migration estimates against previous projects.',
    date: 'Mar 2025',
    team: 'Search & Relevance',
    authors: ['T. Morales', 'K. Jansen'],
    severity: 'moderate',
    tags: ['Search', 'OpenSearch', 'Elasticsearch', 'Data Migration'],
    evidenceSummary: 'Reindexing pipelines ran smoothly, but client compatibility layers across 6 upstream services exceeded initial schedule by 180%. Re-emphasized systemic underestimation of edge consumer changes.',
    artifacts: [
      { label: 'ADR-026 Record', ref: 'adr/026-opensearch-reindex.md' },
      { label: 'Client SDK Migration Guide', ref: 'docs/search-sdk-v3-upgrade.md' }
    ],
    keyMetrics: [
      { label: 'Schedule Variance', value: '+85%' },
      { label: 'Client Upgrades', value: '6 services' }
    ]
  },
  {
    id: 'INC-004',
    type: 'INC',
    title: 'Delayed Telemetry Incident',
    system: 'Telemetry Ingestion Service',
    domain: 'Observability',
    expectedOutcome: 'Rolling gateway update expected to maintain full telemetry ingress without packet drop.',
    outcome: 'Detection delay of 52 minutes',
    reflection: 'Monitoring introduced after rollout increases detection delay. Rolling update introduced a silent connection timeout on gRPC receivers; dashboards had not yet mapped the new gateway pods.',
    lesson: 'Monitoring introduced after rollout increases detection delay.',
    date: 'Jul 2024',
    team: 'Telemetry Platform',
    authors: ['L. Gomez', 'N. Okafor'],
    severity: 'high',
    impactDuration: '52m',
    tags: ['Incident', 'Telemetry', 'Prometheus', 'Monitoring'],
    evidenceSummary: 'Rolling update to the ingestion gateway introduced a silent connection timeout on gRPC receivers. Telemetry dashboards had not yet mapped the new gateway pods, delaying alerting.',
    artifacts: [
      { label: 'Incident Timeline', ref: 'incidents/2024-07-22-telemetry-gateway.md' }
    ],
    keyMetrics: [
      { label: 'Detection Lag', value: '52 minutes' },
      { label: 'Dropped Ingestion Packets', value: '1.2%' }
    ]
  },
  {
    id: 'DEC-089',
    type: 'DEC',
    title: 'Notification Service → Kafka Migration',
    system: 'Notification Gateway',
    domain: 'Push & Messaging',
    outcome: 'Status: Current decision under organizational analysis',
    lesson: 'Subject to historical evaluation against ADR-017, EXP-024, and INC-011.',
    date: 'Active',
    team: 'Notification Guild',
    authors: ['Platform Architecture Guild'],
    severity: 'moderate',
    tags: ['Kafka', 'RabbitMQ', 'Notification', 'Architecture Decision'],
    evidenceSummary: 'Evaluating replacement of legacy RabbitMQ cluster with Kafka to support planned 120k msg/s peak during holiday sale notification delivery.',
    artifacts: [
      { label: 'Draft Proposal', ref: 'rfc/rfc-089-kafka-notification.md' }
    ],
    keyMetrics: [
      { label: 'Target Peak', value: '120k msg/s' },
      { label: 'Current RabbitMQ Peak', value: '28k msg/s' }
    ]
  },
  {
    id: 'EXP-018',
    type: 'EXP',
    title: 'Redis vs Kafka Spike',
    system: 'Session & Streaming Fabric',
    domain: 'Core Platform Engineering',
    expectedOutcome: 'Determine if in-memory Redis Pub/Sub could suffice for cross-service push notifications without operating Kafka clusters.',
    outcome: 'Kafka selected for multi-consumer durability',
    reflection: 'Redis sub-millisecond dispatch was impressive, but transient client disconnects dropped messages irrecoverably. For business-critical notifications, durable log replay is non-negotiable.',
    lesson: 'Redis Pub/Sub proved lightweight for ephemeral feeds but lacked consumer replay and persistence needed for financial and user-facing notifications.',
    date: 'Aug 2024',
    team: 'Platform Architecture',
    authors: ['A. Vance', 'M. Kowalski'],
    severity: 'low',
    tags: ['Redis', 'Kafka', 'PubSub', 'Streaming', 'Benchmark'],
    evidenceSummary: 'Comparative analysis demonstrated that while Redis Pub/Sub has sub-millisecond dispatch, consumer reconnection resulted in missed events. Kafka partition replay provided the required safety guarantee.',
    artifacts: [
      { label: 'Spike Evaluation Matrix', ref: 'spikes/spike-018-redis-vs-kafka.md' }
    ],
    keyMetrics: [
      { label: 'Redis Replay Loss', value: '100% on disconnect' },
      { label: 'Kafka Replay Offset', value: 'Deterministic' }
    ]
  },
  {
    id: 'INC-009',
    type: 'INC',
    title: 'Connection Pool Exhaustion',
    system: 'Push Router & RabbitMQ Gateway',
    domain: 'Messaging & Dispatch',
    expectedOutcome: 'Push router expected to gracefully queue messages during transient 2-second network blips.',
    outcome: 'Connection storm throttled push-router',
    reflection: 'Reconnection loops had a hardcoded 50ms fixed delay rather than exponential backoff with jitter. When the broker briefly restarted, 40 pods opened 14k simultaneous connections, locking the broker daemon.',
    lesson: 'Unbounded connection retry logic during broker blips cascades into upstream thread exhaustion.',
    date: 'Nov 2024',
    team: 'Edge Services',
    authors: ['D. Sorenson', 'E. Chen'],
    severity: 'high',
    impactDuration: '31m',
    tags: ['Incident', 'RabbitMQ', 'ConnectionPool', 'Backpressure'],
    evidenceSummary: 'Network partition between Kubernetes nodes caused 40 instances of push-router to aggressively reconnect without exponential jitter, overwhelming the RabbitMQ broker connection daemon.',
    artifacts: [
      { label: 'Post-Mortem INC-009', ref: 'incidents/2024-11-03-connection-exhaustion.md' }
    ],
    keyMetrics: [
      { label: 'Connection Surge', value: '14,000 conns/sec' },
      { label: 'Broker CPU', value: '100% pinned' }
    ]
  },
  {
    id: 'ADR-031',
    type: 'ADR',
    title: 'PostgreSQL Connection Pooling with PgBouncer',
    system: 'User Data Store',
    domain: 'Persistence',
    expectedOutcome: 'Reduce backend database process contention across 80 Kubernetes pods.',
    outcome: 'P99 latency stabilized at 4.2ms',
    reflection: 'Switching to PgBouncer in transaction mode dropped active database connections from 1,200 to 48 without any query semantics breakage.',
    lesson: 'Dedicated connection poolers must be deployed as sidecars or HA topologies to avoid single-point failure.',
    date: 'Apr 2025',
    team: 'Database Operations',
    authors: ['K. Jansen', 'R. Patel'],
    severity: 'low',
    tags: ['Database', 'PostgreSQL', 'PgBouncer', 'Pooling'],
    evidenceSummary: 'Resolved thread contention across 80 microservice replicas by introducing dedicated transaction-mode pooling.',
    artifacts: [
      { label: 'Architecture Doc', ref: 'adr/031-pgbouncer-ha.md' }
    ],
    keyMetrics: [
      { label: 'Active DB Conns', value: 'Dropped 96%' },
      { label: 'P99 Query Latency', value: '4.2ms' }
    ]
  },
  {
    id: 'POST_MORTEM-014',
    type: 'POST_MORTEM',
    title: 'Cross-AZ Network Cost & Latency Disparity',
    system: 'Distributed Ingestion',
    domain: 'Cloud Infrastructure',
    expectedOutcome: 'Standard multi-AZ deployment was assumed to incur negligible inter-zone data transfer costs.',
    outcome: '$14.2k cloud invoice anomaly resolved',
    reflection: 'Kafka consumers in us-east-1a were pulling from partition leaders in us-east-1b without rack-awareness enabled, incurring cross-AZ egress costs and adding 3.8ms round-trip latency.',
    lesson: 'Partition reassignment across availability zones without locality-aware routing introduces significant data transfer egress fees.',
    date: 'May 2025',
    team: 'Cloud Platform FinOps',
    authors: ['S. Lindqvist', 'L. Gomez'],
    severity: 'moderate',
    tags: ['Cloud', 'Networking', 'AWS', 'Egress', 'Cost'],
    evidenceSummary: 'Kafka consumers in us-east-1a were pulling from partition leaders in us-east-1b without rack-awareness enabled, incurring cross-AZ egress costs and adding 3.8ms round-trip latency.',
    artifacts: [
      { label: 'FinOps Post-Mortem', ref: 'finops/2025-05-cross-az-leak.md' }
    ],
    keyMetrics: [
      { label: 'Inter-AZ Egress Reduction', value: '78%' },
      { label: 'Monthly Cost Delta', value: '-$14,200' }
    ]
  }
];

export const PRE_MORTEM_SCENARIOS: PreMortemScenario[] = [
  {
    id: 'SCEN-01',
    failureMode: 'Consumer Group Rebalance Cascade during notification burst',
    historicalIncidentProof: 'Direct match with INC-011 where partition rebalances blocked message dispatch for 47 minutes.',
    precedentId: 'INC-011',
    probability: 'High',
    earlyWarningIndicator: 'Sudden spike in HeartbeatRequest timeouts and consumer rejoin frequency in push-router pods.',
    requiredMitigationBeforeCutover: 'Configure cooperative sticky assignor (CooperativeStickyAssignor) and tune max.poll.interval.ms before handling live notification traffic.',
    mitigationStatus: 'unmitigated',
  },
  {
    id: 'SCEN-02',
    failureMode: 'Edge client migration schedule slips by 2x due to deserialization and schema validation',
    historicalIncidentProof: 'Identified in ADR-017 (Billing Platform) and ADR-026 (Search Migration), where client SDK updates took 2.4x longer than infrastructure.',
    precedentId: 'ADR-017',
    probability: 'High',
    earlyWarningIndicator: 'billing-service and push-router teams lagging on protobuf/avro schema registry integration 10 days before target date.',
    requiredMitigationBeforeCutover: 'Implement dual-write proxy with shadow consumer validation in staging before decommissioning RabbitMQ exchanges.',
    mitigationStatus: 'in_progress',
  },
  {
    id: 'SCEN-03',
    failureMode: 'Connection storm upon broker restarts overwhelming edge proxies',
    historicalIncidentProof: 'Direct historical precedent in INC-009 where reconnect retries without jitter pinned broker CPU at 100%.',
    precedentId: 'INC-009',
    probability: 'Moderate',
    earlyWarningIndicator: 'TCP connection count exponential derivative during rolling broker upgrades in test staging.',
    requiredMitigationBeforeCutover: 'Enforce reconnect.backoff.ms with randomized exponential jitter across all Go and Node.js consumer clients.',
    mitigationStatus: 'unmitigated',
  }
];
