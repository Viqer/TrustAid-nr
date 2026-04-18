import type { NGO } from '@/types';

/** Resolve owning user id from an NGO returned by the API (userId may be populated). */
export function getNgoUserId(ngo: Pick<NGO, 'userId'>): string | undefined {
  const u = ngo.userId;
  if (u == null) return undefined;
  if (typeof u === 'object' && u !== null && '_id' in u) {
    return String((u as { _id: string })._id);
  }
  return String(u);
}
