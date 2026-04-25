import { Redis } from "@upstash/redis";

export type SongRequest = {
  id: string;
  song: string;
  note?: string;
  createdAt: number;
};

const REQUESTS_KEY = "requests:v2";
const hasUpstash = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

// Fallback em memória para desenvolvimento local sem Upstash configurado.
const memoryStore = new Map<string, SongRequest>();

function parseItem(raw: unknown): SongRequest | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as SongRequest;
    } catch {
      return null;
    }
  }
  return raw as SongRequest;
}

async function readAll(): Promise<SongRequest[]> {
  if (!redis) return Array.from(memoryStore.values());
  const values = (await redis.hvals(REQUESTS_KEY)) as unknown[];
  return (values ?? []).map(parseItem).filter((item): item is SongRequest => item !== null);
}

export async function listRequests(): Promise<SongRequest[]> {
  const all = await readAll();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createRequest(input: { song: string; note?: string }): Promise<SongRequest> {
  const record: SongRequest = {
    id: crypto.randomUUID(),
    song: input.song.trim(),
    note: input.note?.trim() || undefined,
    createdAt: Date.now(),
  };
  if (!redis) {
    memoryStore.set(record.id, record);
    return record;
  }
  await redis.hset(REQUESTS_KEY, { [record.id]: JSON.stringify(record) });
  return record;
}

export async function deleteRequest(id: string): Promise<boolean> {
  if (!redis) return memoryStore.delete(id);
  const removed = await redis.hdel(REQUESTS_KEY, id);
  return removed > 0;
}
