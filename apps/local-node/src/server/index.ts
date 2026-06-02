// @arcana/local-node — Fastify server entry point.
//
// Runs on port 4000 in dev, port 4000 in production (Electron sets it
// the same). The Next.js UI runs on 3000 in dev; in production it's a
// static export loaded from the file:// protocol by Electron.
//
// Exposes:
//   GET  /api/health
//   GET  /api/roasts
//   GET  /api/roasts/:id
//   POST /api/roasts/import        (multipart, field=file)
//   POST /api/roasts/:id/analyze
//   GET  /api/roasts/:id/samples   (for the chart)
//   GET  /api/roasts/:id/analysis
//   --- live capture (v0.2) ---
//   GET  /api/live/source          info about the active temperature source
//   GET  /api/live/devices         list available devices
//   POST /api/live/connect         {deviceId}
//   POST /api/live/disconnect
//   POST /api/live/sessions/start  {greenLotId, operatorUserId?}  -> {sessionId}
//   POST /api/live/sessions/event  {type, value?}                 -> {t}
//   POST /api/live/sessions/stop                                 -> {roastId}
//   WS   /ws/live                  bi-directional: server pushes samples, client sends events
//   GET  /samples/sample-roast.json (serves the bundled sample file)

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import websocket from '@fastify/websocket';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '@arcana/db-local';
import { parseArtisanJson, parseArtisanCsv } from '@arcana/importers';
import type { RoastSessionImport, RoastEventType, RoastSample } from '@arcana/importers';
import liveSource from './phidget/index.js';
import { liveSession } from './live/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.LOCAL_NODE_PORT ?? 4000);
const HOST = process.env.LOCAL_NODE_HOST ?? '0.0.0.0';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:4001';
const SAMPLES_DIR = join(__dirname, '..', '..', 'public', 'samples');

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: { target: 'pino-pretty', options: { colorize: true } },
    },
  });

  await app.register(cors, { origin: true });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: SAMPLES_DIR,
    prefix: '/samples/',
    decorateReply: false,
  });
  await app.register(websocket, { options: { maxPayload: 1_048_576 } });

  // ----------------------------------------------------------
  // Live capture plumbing
  // ----------------------------------------------------------

  // Bridge the TemperatureSource into the LiveSessionStore + WebSocket.
  // We dedupe to ~10 Hz server-side so the UI doesn't drown in samples.
  const SAMPLE_BROADCAST_HZ = 10;
  const SAMPLE_MIN_INTERVAL_MS = Math.floor(1000 / SAMPLE_BROADCAST_HZ);
  type WsSocket = import('@fastify/websocket').WebSocket;
  const wsClients = new Set<WsSocket>();
  let lastBroadcastMs = 0;

  const offSample = liveSource.onSample((sample) => {
    liveSession.addSample(sample);
    const now = Date.now();
    if (now - lastBroadcastMs < SAMPLE_MIN_INTERVAL_MS) return;
    lastBroadcastMs = now;
    const payload = JSON.stringify({ type: 'sample', sample, sessionId: liveSession.get()?.id });
    for (const ws of wsClients) {
      if (ws.readyState === 1 /* OPEN */) ws.send(payload);
    }
  });

  const offError = liveSource.onError((err) => {
    app.log.error({ err }, 'temperature source error');
    const payload = JSON.stringify({ type: 'error', message: err.message });
    for (const ws of wsClients) {
      if (ws.readyState === 1) ws.send(payload);
    }
  });

  const offState = liveSource.onStateChange((state) => {
    app.log.info({ state }, 'temperature source state change');
    const payload = JSON.stringify({ type: 'state', state });
    for (const ws of wsClients) {
      if (ws.readyState === 1) ws.send(payload);
    }
  });

  const offSessionEvent = liveSession.on('event', ({ sessionId, event }) => {
    const payload = JSON.stringify({ type: 'event', sessionId, event });
    for (const ws of wsClients) {
      if (ws.readyState === 1) ws.send(payload);
    }
  });

  // Clean up on shutdown
  app.addHook('onClose', async () => {
    offSample();
    offError();
    offState();
    offSessionEvent;
    await liveSource.disconnect().catch(() => undefined);
  });

  // ----------------------------------------------------------
  // Health
  // ----------------------------------------------------------

  app.get('/api/health', async () => ({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    aiServiceUrl: AI_SERVICE_URL,
    timestamp: new Date().toISOString(),
  }));

  // ----------------------------------------------------------
  // List roasts
  // ----------------------------------------------------------

  app.get<{ Querystring: { limit?: string; offset?: string } }>('/api/roasts', async (req) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const offset = Number(req.query.offset ?? 0);

    const [rows, total] = await Promise.all([
      prisma.roastSession.findMany({
        orderBy: { roastDate: 'desc' },
        take: limit,
        skip: offset,
        include: {
          greenLot: { select: { id: true, name: true, code: true } },
          aiAnalyses: { select: { id: true, createdAt: true, provider: true, summaryText: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.roastSession.count(),
    ]);

    return { total, limit, offset, items: rows };
  });

  // ----------------------------------------------------------
  // Get one roast
  // ----------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/roasts/:id', async (req, reply) => {
    const roast = await prisma.roastSession.findUnique({
      where: { id: req.params.id },
      include: {
        greenLot: { select: { id: true, name: true, code: true } },
        events: { orderBy: { timestampMs: 'asc' } },
        samplePoints: { orderBy: { timestampMs: 'asc' } },
        aiAnalyses: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!roast) return reply.code(404).send({ error: 'Roast not found', code: 'NOT_FOUND' });
    return roast;
  });

  // ----------------------------------------------------------
  // Get one roast's samples (for the chart, no need to load events too)
  // ----------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/roasts/:id/samples', async (req, reply) => {
    const roast = await prisma.roastSession.findUnique({
      where: { id: req.params.id },
      select: { id: true, samplePoints: { orderBy: { timestampMs: 'asc' } } },
    });
    if (!roast) return reply.code(404).send({ error: 'Roast not found', code: 'NOT_FOUND' });
    return { id: roast.id, samples: roast.samplePoints };
  });

  // ----------------------------------------------------------
  // Import a roast from an Artisan JSON / CSV file
  // ----------------------------------------------------------

  app.post('/api/roasts/import', async (req, reply) => {
    const file = await req.file();
    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded (multipart field "file")', code: 'NO_FILE' });
    }

    const buffer = await file.toBuffer();
    const filename = file.filename ?? 'unknown.json';

    // Parse based on extension / MIME type
    let parsed: RoastSessionImport;
    try {
      if (filename.toLowerCase().endsWith('.json')) {
        parsed = parseArtisanJson(buffer, { sourceFile: filename });
      } else if (filename.toLowerCase().endsWith('.csv')) {
        parsed = parseArtisanCsv(buffer, { sourceFile: filename });
      } else {
        // try JSON as fallback
        parsed = parseArtisanJson(buffer, { sourceFile: filename });
      }
    } catch (err) {
      return reply.code(400).send({
        error: `Parse failed: ${(err as Error).message}`,
        code: 'PARSE_FAILED',
      });
    }

    // Look up a default tenant / location / machine / green lot.
    // For v0.1 we use the seeded "demo-roastery" + a single location + machine.
    // In v0.2+ this will be wired to auth and per-tenant state.
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-roastery' } });
    if (!tenant) {
      return reply.code(500).send({
        error: 'Demo tenant not found. Run `pnpm --filter @arcana/db-local seed` first.',
        code: 'NO_TENANT',
      });
    }

    const location = await prisma.location.findFirst({ where: { tenantId: tenant.id } });
    const machine = await prisma.machine.findFirst({ where: { tenantId: tenant.id } });
    if (!location || !machine) {
      return reply.code(500).send({
        error: 'Demo location/machine missing. Run `pnpm --filter @arcana/db-local seed`.',
        code: 'NO_LOCATION',
      });
    }

    // Create or find a green lot for this bean
    const greenLotName = parsed.notes ?? filename.replace(/\.[^.]+$/, '');
    const greenLot = await prisma.greenLot.upsert({
      where: { code: `IMPORT-${greenLotName.slice(0, 40)}` },
      update: {},
      create: {
        tenantId: tenant.id,
        code: `IMPORT-${greenLotName.slice(0, 40)}`,
        name: greenLotName,
        initialStockKg: parsed.greenWeightKg ?? 0,
        currentStockKg: parsed.greenWeightKg ?? 0,
        status: 'active',
      },
    });

    // Persist session + samples + events in a transaction
    const created = await prisma.$transaction(async (tx) => {
      const session = await tx.roastSession.create({
        data: {
          tenantId: tenant.id,
          machineId: machine.id,
          locationId: location.id,
          greenLotId: greenLot.id,
          greenWeightKg: parsed.greenWeightKg,
          roastedWeightKg: parsed.roastedWeightKg,
          roastDate: new Date(parsed.capturedAt),
          notes: parsed.notes,
          source: 'imported',
          sourceFile: filename,
          operatorUserId: null,
        },
      });

      // Bulk insert samples in chunks of 500
      const sampleRows = parsed.samples.map((s: RoastSample) => ({
        roastSessionId: session.id,
        timestampMs: Math.round(s.t * 1000),
        beanTempC: s.bt,
        exhaustTempC: s.et,
        ror: s.ror ?? null,
      }));
      for (let i = 0; i < sampleRows.length; i += 500) {
        await tx.roastSamplePoint.createMany({ data: sampleRows.slice(i, i + 500) });
      }

      await tx.roastEvent.createMany({
        data: parsed.events.map((e) => ({
          roastSessionId: session.id,
          eventType: e.type as RoastEventType,
          timestampMs: Math.round(e.t * 1000),
          value: e.value ?? null,
        })),
      });

      return session;
    });

    return reply.code(201).send({
      roastId: created.id,
      source: parsed.source,
      sampleCount: parsed.samples.length,
      eventCount: parsed.events.length,
      durationSec: parsed.durationSec,
    });
  });

  // ----------------------------------------------------------
  // Trigger AI analysis on an imported roast
  // ----------------------------------------------------------

  app.post<{ Params: { id: string } }>('/api/roasts/:id/analyze', async (req, reply) => {
    const roast = await prisma.roastSession.findUnique({
      where: { id: req.params.id },
      include: {
        samplePoints: { orderBy: { timestampMs: 'asc' } },
        events: { orderBy: { timestampMs: 'asc' } },
        greenLot: { select: { name: true } },
      },
    });
    if (!roast) return reply.code(404).send({ error: 'Roast not found', code: 'NOT_FOUND' });

    // Down-sample for the AI service (avoid token blow-up on long roasts)
    const allSamples = roast.samplePoints;
    const targetPoints = 200;
    const stride = Math.max(1, Math.floor(allSamples.length / targetPoints));
    const lite = allSamples
      .filter((_, i) => i % stride === 0)
      .map((s) => ({
        t: s.timestampMs / 1000,
        bt: s.beanTempC ?? 0,
        et: s.exhaustTempC ?? 0,
        ror: s.ror ?? undefined,
      }));

    const requestBody = {
      samples: lite,
      events: roast.events.map((e) => ({
        type: e.eventType as RoastEventType,
        t: e.timestampMs / 1000,
        value: e.value ?? undefined,
      })),
      greenWeightKg: roast.greenWeightKg ?? undefined,
      roastedWeightKg: roast.roastedWeightKg ?? undefined,
      durationSec:
        allSamples.length > 0
          ? (allSamples[allSamples.length - 1].timestampMs -
              allSamples[0].timestampMs) /
            1000
          : 0,
      notes: roast.notes ?? roast.greenLot.name,
    };

    let aiRes: {
      provider: string;
      modelName: string;
      summary: string;
      developmentPct: number;
      rorStabilityScore: number;
      issues: string[];
      recommendations: string[];
      tokensUsed?: { prompt?: number; completion?: number; total?: number };
    };
    try {
      const res = await fetch(`${AI_SERVICE_URL}/analyze/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errBody = await res.text();
        return reply.code(502).send({
          error: `AI service returned ${res.status}: ${errBody.slice(0, 500)}`,
          code: 'AI_SERVICE_ERROR',
        });
      }
      aiRes = (await res.json()) as typeof aiRes;
    } catch (err) {
      return reply.code(503).send({
        error: `AI service unreachable at ${AI_SERVICE_URL}: ${(err as Error).message}`,
        code: 'AI_SERVICE_DOWN',
      });
    }

    // Persist analysis
    const analysis = await prisma.aiAnalysisRoast.create({
      data: {
        roastSessionId: roast.id,
        tenantId: roast.tenantId,
        provider: aiRes.provider,
        modelName: aiRes.modelName,
        analysisJson: JSON.stringify({
          developmentPct: aiRes.developmentPct,
          rorStabilityScore: aiRes.rorStabilityScore,
          issues: aiRes.issues,
          recommendations: aiRes.recommendations,
        }),
        summaryText: aiRes.summary,
        tokensPrompt: aiRes.tokensUsed?.prompt ?? null,
        tokensCompletion: aiRes.tokensUsed?.completion ?? null,
      },
    });

    return reply.send({
      analysisId: analysis.id,
      ...aiRes,
    });
  });

  // ----------------------------------------------------------
  // Get latest analysis
  // ----------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/roasts/:id/analysis', async (req, reply) => {
    const roast = await prisma.roastSession.findUnique({
      where: { id: req.params.id },
      select: { id: true, aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!roast) return reply.code(404).send({ error: 'Roast not found', code: 'NOT_FOUND' });
    const a = roast.aiAnalyses[0];
    if (!a) return reply.code(404).send({ error: 'No analysis yet', code: 'NO_ANALYSIS' });
    return {
      id: a.id,
      provider: a.provider,
      modelName: a.modelName,
      summaryText: a.summaryText,
      analysis: JSON.parse(a.analysisJson),
      createdAt: a.createdAt,
    };
  });

  // ----------------------------------------------------------
  // Live capture (v0.2)
  // ----------------------------------------------------------

  /** Helper: find or create a default green lot for live sessions. */
  async function findOrCreateLiveGreenLot(tenantId: string, label: string) {
    const code = `LIVE-${label.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40)}-${Date.now()}`;
    return prisma.greenLot.upsert({
      where: { code },
      update: {},
      create: {
        tenantId,
        code,
        name: label,
        initialStockKg: 0,
        currentStockKg: 0,
        status: 'active',
      },
    });
  }

  app.get('/api/live/source', async () => ({
    kind: liveSource.kind,
    connected: liveSource.isConnected(),
  }));

  app.get('/api/live/devices', async (_req, reply) => {
    try {
      const devices = await liveSource.listDevices();
      return { devices };
    } catch (err) {
      return reply.code(503).send({
        error: `Device scan failed: ${(err as Error).message}`,
        code: 'DEVICE_SCAN_FAILED',
      });
    }
  });

  app.post<{ Body: { deviceId: string } }>('/api/live/connect', async (req, reply) => {
    const { deviceId } = req.body ?? ({} as { deviceId?: string });
    if (!deviceId) {
      return reply.code(400).send({ error: 'deviceId required', code: 'MISSING_DEVICE_ID' });
    }
    try {
      await liveSource.connect(deviceId);
      return { kind: liveSource.kind, connected: true, deviceId };
    } catch (err) {
      return reply.code(503).send({
        error: `Connect failed: ${(err as Error).message}`,
        code: 'CONNECT_FAILED',
      });
    }
  });

  app.post('/api/live/disconnect', async () => {
    await liveSource.disconnect();
    return { connected: false };
  });

  app.post<{ Body: { greenLotId?: string; greenLotName?: string; operatorUserId?: string } }>(
    '/api/live/sessions/start',
    async (req, reply) => {
      if (liveSession.isActive()) {
        return reply.code(409).send({ error: 'A live session is already active', code: 'SESSION_ACTIVE' });
      }
      const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-roastery' } });
      const location = await prisma.location.findFirst({ where: { tenantId: tenant?.id } });
      const machine = await prisma.machine.findFirst({ where: { tenantId: tenant?.id } });
      if (!tenant || !location || !machine) {
        return reply.code(500).send({ error: 'Demo tenant/location/machine missing — run seed', code: 'NO_TENANT' });
      }
      const lot = req.body?.greenLotId
        ? await prisma.greenLot.findUnique({ where: { id: req.body.greenLotId } })
        : await findOrCreateLiveGreenLot(tenant.id, req.body?.greenLotName ?? 'Live roast');

      if (!lot) {
        return reply.code(400).send({ error: 'greenLotId not found', code: 'LOT_NOT_FOUND' });
      }

      const session = liveSession.start({
        tenantId: tenant.id,
        machineId: machine.id,
        locationId: location.id,
        greenLotId: lot.id,
      });

      return {
        sessionId: session.id,
        startedAt: session.startedAt,
        greenLot: { id: lot.id, name: lot.name, code: lot.code },
      };
    },
  );

  app.post<{ Body: { type: string; value?: string } }>(
    '/api/live/sessions/event',
    async (req, reply) => {
      if (!liveSession.isActive()) {
        return reply.code(409).send({ error: 'No active live session', code: 'NO_SESSION' });
      }
      const valid = ['charge', 'tp', 'dry_end', 'fc_start', 'fc_end', 'sc_start', 'sc_end', 'drop', 'cool', 'note'];
      const type = req.body?.type;
      if (!type || !valid.includes(type)) {
        return reply.code(400).send({ error: `type must be one of: ${valid.join(', ')}`, code: 'INVALID_EVENT' });
      }
      const result = liveSession.addEvent(type as RoastEventType, req.body.value);
      return result;
    },
  );

  app.post('/api/live/sessions/stop', async (_req, reply) => {
    if (!liveSession.isActive()) {
      return reply.code(409).send({ error: 'No active live session', code: 'NO_SESSION' });
    }
    try {
      const roastId = await liveSession.stop();
      return { roastId };
    } catch (err) {
      return reply.code(500).send({ error: `Stop failed: ${(err as Error).message}`, code: 'STOP_FAILED' });
    }
  });

  // ----------------------------------------------------------
  // WebSocket: /ws/live
  // Streams samples + events to the UI; client can also send {type:'ping'}
  // ----------------------------------------------------------

  app.get('/ws/live', { websocket: true }, (socket) => {
    wsClients.add(socket);
    app.log.info({ clients: wsClients.size }, 'ws/live client connected');

    // Send an immediate hello so the UI can confirm the channel is open
    socket.send(
      JSON.stringify({
        type: 'hello',
        source: liveSource.kind,
        connected: liveSource.isConnected(),
        sessionId: liveSession.get()?.id ?? null,
      }),
    );

    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        } else if (msg?.type === 'event' && liveSession.isActive()) {
          const valid = ['charge', 'tp', 'dry_end', 'fc_start', 'fc_end', 'sc_start', 'sc_end', 'drop', 'cool', 'note'];
          if (valid.includes(msg.eventType)) {
            liveSession.addEvent(msg.eventType as RoastEventType, msg.value);
          }
        }
      } catch {
        // ignore malformed
      }
    });

    socket.on('close', () => {
      wsClients.delete(socket);
      app.log.info({ clients: wsClients.size }, 'ws/live client disconnected');
    });
  });

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`local-node API ready on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error({ err }, 'failed to start');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
