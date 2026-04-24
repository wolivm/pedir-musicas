import { Redis } from "@upstash/redis";

export type SongRequest = {
  id: string;
  song: string;
  note?: string;
  played: boolean;
  createdAt: number;
};

const REQUESTS_KEY = "requests";
const hasUpstash = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

// Fallback em memória para desenvolvimento local sem Upstash configurado.
const memoryStore: SongRequest[] = [];

async function readAll(): Promise<SongRequest[]> {
  if (!redis) return [...memoryStore];
  const raw = await redis.lrange<SongRequest | string>(REQUESTS_KEY, 0, -1);
  return raw.map((item) => (typeof item === "string" ? (JSON.parse(item) as SongRequest) : item));
}

async function writeAll(list: SongRequest[]): Promise<void> {
  if (!redis) {
    memoryStore.splice(0, memoryStore.length, ...list);
    return;
  }
  const pipeline = redis.multi();
  pipeline.del(REQUESTS_KEY);
  if (list.length > 0) {
    pipeline.rpush(REQUESTS_KEY, ...list.map((item) => JSON.stringify(item)));
  }
  await pipeline.exec();
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
    played: false,
    createdAt: Date.now(),
  };
  if (!redis) {
    memoryStore.push(record);
    return record;
  }
  await redis.rpush(REQUESTS_KEY, JSON.stringify(record));
  return record;
}

export async function updateRequest(id: string, patch: Partial<Pick<SongRequest, "played">>): Promise<SongRequest | null> {
  const all = await readAll();
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  await writeAll(all);
  return all[idx];
}

export async function deleteRequest(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((item) => item.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export async function clearPlayed(): Promise<number> {
  const all = await readAll();
  const next = all.filter((item) => !item.played);
  const removed = all.length - next.length;
  if (removed > 0) await writeAll(next);
  return removed;
}
