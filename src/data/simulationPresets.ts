import {
  UnfamiliarToolTrack,
  InventoryItem,
  BlockerEntry,
  ScopeDeltaItem,
  PeerEvaluation,
  TechStackConfig
} from '../types';

export const UNFAMILIAR_TRACKS: UnfamiliarToolTrack[] = [
  {
    id: 'webhook-hmac',
    name: 'Webhook Signature Verification (HMAC-SHA256)',
    category: 'Security & Ingress',
    badge: 'Security',
    difficulty: 'Medium',
    description: 'Verify cryptographic signatures on incoming warehouse payloads, enforce timestamp replay protection (5-min window), and reject forged/tampered notifications.',
    industryRelevance: 'Standard for Stripe, Shopify, GitHub, and enterprise warehouse hooks.',
    defaultConfig: {
      secretKey: 'whsec_northstar_retail_production_99x8',
      endpoint: '/api/v1/webhooks/warehouse-inventory',
    },
    sampleCode: `// HMAC-SHA256 Ingress Signature Verifier
import crypto from 'crypto';

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secretKey: string
): { isValid: boolean; timestamp: number; reason?: string } {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const sigPart = parts.find(p => p.startsWith('v1='));

  if (!timestampPart || !sigPart) {
    return { isValid: false, timestamp: 0, reason: 'Malformed signature header format' };
  }

  const timestamp = parseInt(timestampPart.replace('t=', ''), 10);
  const receivedSig = sigPart.replace('v1=', '');

  // Anti-Replay: 5-minute drift threshold
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return { isValid: false, timestamp, reason: 'Timestamp outside 300s replay window' };
  }

  const payloadToSign = \`\${timestamp}.\${rawBody}\`;
  const computedSig = crypto
    .createHmac('sha256', secretKey)
    .update(payloadToSign)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedSig, 'hex'),
    Buffer.from(computedSig, 'hex')
  );

  return { isValid, timestamp };
}`,
    pivotUsefulness: 'Directly powers the Day 4 pivot ingestion endpoint from Northstar Retail warehouse.'
  },
  {
    id: 'message-queue',
    name: 'Message Queues & Event Buffering (BullMQ / Redis)',
    category: 'Async Processing',
    badge: 'Throughput',
    difficulty: 'Hard',
    description: 'Decouple fast webhook ingestion from database/cache writes using an asynchronous persistent queue with concurrency control and backpressure dampening.',
    industryRelevance: 'Prevents database lock contention during Flash Sale inventory surges.',
    defaultConfig: {
      concurrency: 5,
      maxRetries: 3,
    },
    sampleCode: `// Asynchronous Event Worker Pipeline
import { Queue, Worker } from 'bullmq';

export const inventoryQueue = new Queue('inventory-sync-queue', {
  connection: { host: 'localhost', port: 6379 }
});

export const inventoryWorker = new Worker('inventory-sync-queue', async (job) => {
  const { sku, warehouseStock, syncSource } = job.data;
  console.log(\`[Worker] Processing sync for SKU \${sku} (qty: \${warehouseStock}) from \${syncSource}\`);
  
  // Update Cache Store atomically
  await redisClient.set(\`stock:\${sku}\`, warehouseStock);
  await redisClient.publish('stock-invalidation', JSON.stringify({ sku, warehouseStock }));
  
  return { status: 'synced', timestamp: Date.now() };
}, { concurrency: 5 });`,
    pivotUsefulness: 'Buffers bursty webhook push events so support query APIs never lag.'
  },
  {
    id: 'retry-circuit-breaker',
    name: 'Exponential Backoff & Circuit Breaker',
    category: 'Fault Tolerance',
    badge: 'Resilience',
    difficulty: 'Hard',
    description: 'Protect upstream warehouse APIs from cascading failures using jittered exponential backoff and 3-state Circuit Breaker (CLOSED, OPEN, HALF-OPEN).',
    industryRelevance: 'Essential when dependent APIs experience latency spikes or 429 Rate Limits.',
    defaultConfig: {
      backoffBaseMs: 500,
      maxRetries: 4,
    },
    sampleCode: `// Jittered Exponential Backoff with Circuit Breaker
export class ResilientSyncClient {
  private failureCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttemptTime = 0;

  async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit Breaker is OPEN: fast-failing request to protect upstream');
      }
      this.state = 'HALF_OPEN';
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        this.failureCount = 0;
        this.state = 'CLOSED';
        return result;
      } catch (err) {
        this.failureCount++;
        if (this.failureCount >= 3) {
          this.state = 'OPEN';
          this.nextAttemptTime = Date.now() + 15000; // 15s cooldown
        }
        if (attempt === maxRetries) throw err;
        
        // Jittered exponential delay: (2^attempt * 300) + random(0, 100)
        const delay = Math.pow(2, attempt) * 300 + Math.random() * 100;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error('Retries exhausted');
  }
}`,
    pivotUsefulness: 'Handles warehouse webhook redelivery retry acknowledgments and fallback caches.'
  },
  {
    id: 'graphql-subscriptions',
    name: 'GraphQL Real-time Subscriptions',
    category: 'API & Query Layer',
    badge: 'Real-time',
    difficulty: 'Hard',
    description: 'Expose live inventory diff streams to customer support client widgets over WebSocket connections instead of wasteful constant frontend polling.',
    industryRelevance: 'Power modern unified support desks with real-time push updates.',
    defaultConfig: {
      endpoint: 'wss://api.northstar-retail.internal/graphql',
    },
    sampleCode: `// GraphQL Real-time Inventory Subscription
import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const Subscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    stockUpdated: {
      type: StockType,
      args: { sku: { type: GraphQLString } },
      subscribe: () => pubsub.asyncIterator(['STOCK_UPDATED'])
    }
  }
});`,
    pivotUsefulness: 'Immediately informs customer support reps on live calls when stock changes.'
  },
  {
    id: 'serverless-edge-workers',
    name: 'Event-Driven Serverless Edge Workers',
    category: 'Cloud Infrastructure',
    badge: 'Scalability',
    difficulty: 'Medium',
    description: 'Deploy lightweight, sub-5ms cold start serverless workers to terminate warehouse push webhooks at the global edge and update distributed cache nodes.',
    industryRelevance: 'Cloudflare Workers, AWS Lambda@Edge, and Fastly Compute.',
    defaultConfig: {
      concurrency: 100,
    },
    sampleCode: `// Serverless Edge Webhook Ingestion Handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    const signature = request.headers.get('X-Northstar-Signature');
    const rawBody = await request.text();

    const isAuthorized = await verifyHmac(rawBody, signature, env.WEBHOOK_SECRET);
    if (!isAuthorized) {
      return new Response('Unauthorized Webhook Signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    await env.STOCK_KV.put(\`sku:\${event.sku}\`, JSON.stringify(event));

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
};`,
    pivotUsefulness: 'Eliminates server overhead during sporadic warehouse batch synchronizations.'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    sku: 'NSR-BOOT-441',
    name: 'VaporTrack All-Terrain Running Shoe',
    category: 'Footwear',
    warehouseStock: 24,
    cachedStock: 24,
    reservedStock: 2,
    lastWarehouseUpdate: '1 min ago',
    lastCacheSync: '1 min ago',
    isStale: false,
    unitPrice: 149.00
  },
  {
    sku: 'NSR-AUDIO-802',
    name: 'Quantum ANC Studio Headphones (Mk II)',
    category: 'Electronics',
    warehouseStock: 3,
    cachedStock: 18,
    reservedStock: 1,
    lastWarehouseUpdate: 'Just now (Stock Plummeted!)',
    lastCacheSync: '4 min ago (Old Polling window)',
    isStale: true,
    unitPrice: 289.00
  },
  {
    sku: 'NSR-PACK-109',
    name: 'Nomad Waxed Canvas Travel Backpack 30L',
    category: 'Accessories',
    warehouseStock: 42,
    cachedStock: 42,
    reservedStock: 5,
    lastWarehouseUpdate: '2 min ago',
    lastCacheSync: '2 min ago',
    isStale: false,
    unitPrice: 119.50
  },
  {
    sku: 'NSR-BREW-330',
    name: 'Artisan Titanium Pour-Over Coffee Dripper',
    category: 'Home & Kitchen',
    warehouseStock: 0,
    cachedStock: 8,
    reservedStock: 0,
    lastWarehouseUpdate: '30 sec ago (Sold Out!)',
    lastCacheSync: '4 min ago (Stale Polling)',
    isStale: true,
    unitPrice: 68.00
  },
  {
    sku: 'NSR-JACKET-705',
    name: 'SummitPro Thermal Gore-Tex Parka',
    category: 'Apparel',
    warehouseStock: 15,
    cachedStock: 15,
    reservedStock: 3,
    lastWarehouseUpdate: '3 min ago',
    lastCacheSync: '3 min ago',
    isStale: false,
    unitPrice: 340.00
  },
  {
    sku: 'NSR-WATCH-991',
    name: 'PulseMatrix Solar GPS Tactical Watch',
    category: 'Electronics',
    warehouseStock: 9,
    cachedStock: 9,
    reservedStock: 0,
    lastWarehouseUpdate: '1 min ago',
    lastCacheSync: '1 min ago',
    isStale: false,
    unitPrice: 225.00
  }
];

export const INITIAL_BLOCKERS: BlockerEntry[] = [
  {
    id: 'blk-1',
    timestamp: 'Day 1 - 11:30 AM',
    day: 1,
    phase: 'Solo Recon',
    errorOrObstacle: 'HMAC signature verification failed on valid payload in Node crypto module',
    deadEndTried: 'Attempted to parse JSON body before hashing, which stripped spaces and key ordering',
    rootCause: 'JSON.stringify(req.body) alters key order and spacing; signature must be computed on raw byte buffer',
    resolutionOrWorkaround: 'Configured express.raw({ type: "application/json" }) to capture untouched raw string buffer before parsing',
    timeBoxAllocatedMin: 60,
    actualTimeSpentMin: 85,
    status: 'resolved'
  },
  {
    id: 'blk-2',
    timestamp: 'Day 2 - 03:15 PM',
    day: 2,
    phase: 'Solo Recon',
    errorOrObstacle: 'Clock skew causing valid webhook requests to fail the 300-second anti-replay window',
    deadEndTried: 'Disabled timestamp check altogether (fails security rubric requirement)',
    rootCause: 'Local development clock was drifted by 12 seconds relative to mock warehouse NTP time',
    resolutionOrWorkaround: 'Added symmetric tolerance window of ±300 seconds and logged clock drift warnings',
    timeBoxAllocatedMin: 45,
    actualTimeSpentMin: 40,
    status: 'resolved'
  },
  {
    id: 'blk-3',
    timestamp: 'Day 4 - 02:40 PM',
    day: 4,
    phase: 'The Pivot',
    errorOrObstacle: 'Old cron job continued polling warehouse in parallel with new webhook listener, causing race conditions',
    deadEndTried: 'Left polling in parallel as "fallback" (violates strict sprint non-negotiable rule #4)',
    rootCause: 'Background interval timer was not cancelled on server reload, corrupting cache state',
    resolutionOrWorkaround: 'Explicitly marked PollingService as @deprecated, removed polling cron, and routed all updates through verified PushWebhookController',
    timeBoxAllocatedMin: 90,
    actualTimeSpentMin: 70,
    status: 'resolved'
  }
];

export const INITIAL_SCOPE_DELTAS: ScopeDeltaItem[] = [
  {
    id: 'sd-1',
    type: 'DROPPED',
    title: '5-Minute Periodic Warehouse Polling Cron Worker',
    description: 'Removed background setInterval and cron orchestrator that hit GET /api/warehouse/inventory/all every 300 seconds.',
    rationale: 'Client announced polling endpoint decommissioning. Eliminates redundant warehouse server CPU load and 5-minute inventory staleness lag.',
    impactScore: 'High',
    architecturalLayer: 'Worker',
    replacesOrDeprecates: 'src/services/WarehousePoller.ts'
  },
  {
    id: 'sd-2',
    type: 'ADDED',
    title: 'Push Webhook Ingestion Controller with HMAC-SHA256',
    description: 'Constructed POST /api/webhooks/warehouse-stock receiver with timing-safe signature check and replay-protection timestamp audit.',
    rationale: 'Required by Day 4 pivot to receive real-time push events within <100ms of warehouse shelf updates.',
    impactScore: 'High',
    architecturalLayer: 'Ingress'
  },
  {
    id: 'sd-3',
    type: 'MODIFIED',
    title: 'Cache Invalidation & Support Stock Query Layer',
    description: 'Shifted cache updates from batch overwrite to event-driven key invalidation + direct Redis hash writes with optimistic locking.',
    rationale: 'Customer support "Is this in stock?" query now reads 0ms stale data instead of up to 4m59s old stock counts.',
    impactScore: 'Medium',
    architecturalLayer: 'Storage/Cache',
    replacesOrDeprecates: 'BatchCacheUpdater.ts'
  },
  {
    id: 'sd-4',
    type: 'ADDED',
    title: 'Dead-Letter Queue & Exponential Backoff for Failed Webhooks',
    description: 'Added BullMQ retry handler with jittered backoff to store unverified or errored events for manual investigation without dropping stock events.',
    rationale: 'Prevents stock sync loss when network blips occur during warehouse bulk shipments.',
    impactScore: 'Medium',
    architecturalLayer: 'Worker'
  },
  {
    id: 'sd-5',
    type: 'DROPPED',
    title: 'Bulk Warehouse Delta Diff Engine',
    description: 'Removed the heavy in-memory diff algorithm that compared 10,000 polled warehouse items against existing cache.',
    rationale: 'Push events deliver point-in-time single item deltas directly, eliminating diff calculation overhead.',
    impactScore: 'Low',
    architecturalLayer: 'Client API'
  }
];

export const INITIAL_PEER_REVIEWS: PeerEvaluation[] = [
  {
    id: 'peer-1',
    targetTeammate: 'Sarah Chen',
    role: 'Tech Lead / Systems Architect',
    avatar: 'SC',
    composureScore: 5,
    communicationScore: 5,
    flexibilityScore: 4,
    contributionScore: 5,
    rehireRating: 'Strong Yes',
    qualitativeFeedback: 'When the Day 4 pivot arrived, Sarah immediately called a 10-minute huddle, clearly prioritized tearing out the polling loop, and kept the team calm and focused on shipping the webhook controller.',
    submittedAt: 'Day 5 - 10:15 AM'
  },
  {
    id: 'peer-2',
    targetTeammate: 'Kwame Mensah',
    role: 'Backend & Ingress Engineer',
    avatar: 'KM',
    composureScore: 4,
    communicationScore: 5,
    flexibilityScore: 5,
    contributionScore: 5,
    rehireRating: 'Strong Yes',
    qualitativeFeedback: 'Kwame utilized his Day 1-2 solo recon on HMAC verification to implement the replacement endpoint in under 3 hours without complaining about discarded polling code.',
    submittedAt: 'Day 5 - 11:30 AM'
  },
  {
    id: 'peer-3',
    targetTeammate: 'Maya Lin',
    role: 'Full Stack & Support Tool Lead',
    avatar: 'ML',
    composureScore: 5,
    communicationScore: 4,
    flexibilityScore: 4,
    contributionScore: 4,
    rehireRating: 'Yes',
    qualitativeFeedback: 'Quickly refactored the support tool UI to listen to push notifications and updated the regression tests to verify zero cache staleness.',
    submittedAt: 'Day 5 - 12:00 PM'
  },
  {
    id: 'peer-4',
    targetTeammate: 'Alex Rivera',
    role: 'DevOps & Reliability Engineer',
    avatar: 'AR',
    composureScore: 4,
    communicationScore: 4,
    flexibilityScore: 5,
    contributionScore: 4,
    rehireRating: 'Strong Yes',
    qualitativeFeedback: 'Helped isolate the old background polling cron and set up monitoring dashboards for webhook delivery latency.',
    submittedAt: 'Day 5 - 01:20 PM'
  }
];

export const DEFAULT_TECH_STACK_CONFIG: TechStackConfig = {
  backendLanguage: 'TypeScript / Node.js',
  webFramework: 'Express / Fastify',
  queueSystem: 'BullMQ / Redis',
  cacheStore: 'Redis In-Memory',
  signatureAlgorithm: 'HMAC-SHA256',
  notes: 'Optimized for high-throughput single-event webhook ingestion, cryptographic header verification, and sub-millisecond stock cache queries for customer support operators.'
};
