// @arcana/local-node — live session store (singleton).
//
// Holds the currently-active live roast session in memory. When the
// operator stops the session, the buffered samples + events are
// persisted to Prisma as a new RoastSession with source='live'.
//
// The store is a singleton because there is only one live roast at
// a time per roastery (one machine, one operator, one drum).

import { EventEmitter } from 'node:events';
import { prisma } from '@arcana/db-local';
import type { RoastEventType, LiveSample } from '../phidget/types.js';

export interface LiveSession {
  id: string;
  tenantId: string;
  machineId: string;
  locationId: string;
  greenLotId: string;
  startedAt: Date;
  /** Samples so far, in order. t is seconds from session start. */
  samples: LiveSample[];
  /** Events fired so far. t is seconds from session start. */
  events: Array<{ type: RoastEventType; t: number; value?: string }>;
  /** Last sample at the time of the most recent event (for diagnostics). */
  lastSample?: LiveSample;
}

class LiveSessionStore extends EventEmitter {
  private current: LiveSession | null = null;

  isActive(): boolean {
    return this.current !== null;
  }

  get(): LiveSession | null {
    return this.current;
  }

  start(input: {
    tenantId: string;
    machineId: string;
    locationId: string;
    greenLotId: string;
  }): LiveSession {
    if (this.current) {
      throw new Error('A live session is already active. Stop it before starting a new one.');
    }
    const session: LiveSession = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      machineId: input.machineId,
      locationId: input.locationId,
      greenLotId: input.greenLotId,
      startedAt: new Date(),
      samples: [],
      events: [],
    };
    this.current = session;
    this.emit('started', session);
    return session;
  }

  addSample(sample: LiveSample): void {
    if (!this.current) return;
    this.current.samples.push(sample);
    this.current.lastSample = sample;
    this.emit('sample', { sessionId: this.current.id, sample });
  }

  addEvent(type: RoastEventType, value?: string): { sessionId: string; t: number } | null {
    if (!this.current) return null;
    const t = this.current.lastSample?.t ?? 0;
    const ev = { type, t, value };
    this.current.events.push(ev);
    this.emit('event', { sessionId: this.current.id, event: ev });
    return { sessionId: this.current.id, t };
  }

  /**
   * Stop the live session and persist it to Prisma as a RoastSession
   * with source='live'. Returns the new RoastSession's id.
   */
  async stop(): Promise<string> {
    if (!this.current) {
      throw new Error('No active live session to stop.');
    }
    const s = this.current;
    this.current = null;
    this.emit('stopped', s);

    // Persist
    const created = await prisma.$transaction(async (tx) => {
      const session = await tx.roastSession.create({
        data: {
          tenantId: s.tenantId,
          machineId: s.machineId,
          locationId: s.locationId,
          greenLotId: s.greenLotId,
          roastDate: s.startedAt,
          source: 'live',
        },
      });

      // Bulk insert samples in chunks of 500 (same as the import path)
      const sampleRows = s.samples.map((sm) => ({
        roastSessionId: session.id,
        timestampMs: Math.round(sm.t * 1000),
        beanTempC: sm.bt,
        exhaustTempC: sm.et,
      }));
      for (let i = 0; i < sampleRows.length; i += 500) {
        await tx.roastSamplePoint.createMany({ data: sampleRows.slice(i, i + 500) });
      }

      if (s.events.length > 0) {
        await tx.roastEvent.createMany({
          data: s.events.map((e) => ({
            roastSessionId: session.id,
            eventType: e.type,
            timestampMs: Math.round(e.t * 1000),
            value: e.value ?? null,
          })),
        });
      }

      return session;
    });

    return created.id;
  }

  /** Force-cancel without persisting. */
  cancel(): void {
    if (!this.current) return;
    const s = this.current;
    this.current = null;
    this.emit('cancelled', s);
  }
}

export const liveSession = new LiveSessionStore();
