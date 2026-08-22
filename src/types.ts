export type SprintDay = 1 | 2 | 3 | 4 | 5;

export type SimulationPhase =
  | 'solo_recon'      // Day 1-2
  | 'original_build'  // Day 3
  | 'the_pivot'       // Day 4
  | 'refactor_review';// Day 5

export interface UnfamiliarToolTrack {
  id: string;
  name: string;
  category: string;
  badge: string;
  difficulty: 'Medium' | 'Hard' | 'Advanced';
  description: string;
  industryRelevance: string;
  defaultConfig: {
    secretKey?: string;
    endpoint?: string;
    backoffBaseMs?: number;
    maxRetries?: number;
    concurrency?: number;
  };
  sampleCode: string;
  pivotUsefulness: string;
}

export interface BlockerEntry {
  id: string;
  timestamp: string;
  day: number;
  phase: string;
  errorOrObstacle: string;
  deadEndTried: string;
  rootCause: string;
  resolutionOrWorkaround: string;
  timeBoxAllocatedMin: number;
  actualTimeSpentMin: number;
  status: 'resolved' | 'workaround' | 'unresolved';
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  warehouseStock: number;
  cachedStock: number;
  reservedStock: number;
  lastWarehouseUpdate: string;
  lastCacheSync: string;
  isStale: boolean;
  unitPrice: number;
}

export interface WebhookEventLog {
  id: string;
  timestamp: string;
  eventType: 'stock.updated' | 'stock.reserved' | 'stock.replenished' | 'batch.sync';
  sku: string;
  previousStock: number;
  newStock: number;
  signature: string;
  verified: boolean;
  deliveryLatencyMs: number;
  processingStatus: 'success' | 'failed' | 'retrying' | 'rejected_signature';
  retryAttempt?: number;
}

export interface PollingLog {
  id: string;
  timestamp: string;
  status: '200_OK' | '304_NOT_MODIFIED' | '429_RATE_LIMIT' | '500_TIMEOUT';
  itemsFetched: number;
  durationMs: number;
  stalenessLagSec: number;
  apiCostUnits: number;
}

export interface ScopeDeltaItem {
  id: string;
  type: 'DROPPED' | 'MODIFIED' | 'ADDED';
  title: string;
  description: string;
  rationale: string;
  impactScore: 'High' | 'Medium' | 'Low';
  architecturalLayer: 'Ingress' | 'Storage/Cache' | 'Worker' | 'Client API';
  replacesOrDeprecates?: string;
}

export interface PeerEvaluation {
  id: string;
  targetTeammate: string;
  role: string;
  avatar: string;
  composureScore: number;      // 1-5 (Remained calm when pivot hit)
  communicationScore: number;  // 1-5 (Clear, transparent, zero quiet avoidance)
  flexibilityScore: number;    // 1-5 (Willingness to ditch old polling code)
  contributionScore: number;   // 1-5 (Hands-on code output & unblocking peers)
  rehireRating: 'Strong Yes' | 'Yes' | 'Hesitant' | 'No';
  qualitativeFeedback: string;
  submittedAt?: string;
}

export interface RubricScore {
  // Assignment 1 (Solo Recon)
  a1FunctionalCorrectness: number; // max 40
  a1TroubleshootingDocs: number;  // max 40
  a1TimeToCompletion: number;      // max 20
  
  // Assignment 2 (Adaptation & Scope Delta)
  a2AdaptationCompleteness: number; // max 40
  a2ArchitecturalIntegrity: number; // max 30
  a2TradeoffDocumentation: number;  // max 30
  
  // Assignment 3 (Adaptability Index)
  a3PeerCompositeScore: number;     // max 100
}

export interface TechStackConfig {
  backendLanguage: 'TypeScript / Node.js' | 'Go (Golang)' | 'Python / FastAPI' | 'Java / Spring Boot';
  webFramework: 'Express / Fastify' | 'Fiber / Gin' | 'FastAPI / AsyncIO' | 'Spring WebFlux';
  queueSystem: 'BullMQ / Redis' | 'RabbitMQ / AMQP' | 'Apache Kafka' | 'AWS SQS / GCP PubSub';
  cacheStore: 'Redis In-Memory' | 'Memcached' | 'KeyDB' | 'Local LRU / Cache-Manager';
  signatureAlgorithm: 'HMAC-SHA256' | 'ED25519' | 'RSA-SHA256';
  notes: string;
}
