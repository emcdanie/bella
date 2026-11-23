import { useEffect, useState } from 'react';

/** 161000 ms -> "2:41"; an hour or more -> "1:02:03". Never negative. */
export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Time since `since` (an ISO string or epoch ms), ticking every second while `live`. Missing `since`: null. */
export function useElapsed(since: string | number | null | undefined, live = true): string | null {
  const start = since == null ? null : typeof since === 'number' ? since : Date.parse(since);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (start == null || !live) return undefined;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start, live]);
  return start == null || Number.isNaN(start) ? null : formatElapsed(now - start);
}

/** 12000 ms -> "12 s ago"; under an hour "3 min ago"; then "2 h ago". */
export function formatAgo(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}\u00a0s\u00a0ago`;
  if (s < 3600) return `${Math.floor(s / 60)}\u00a0min\u00a0ago`;
  return `${Math.floor(s / 3600)}\u00a0h\u00a0ago`;
}

/** How long ago `at` was (an ISO string or epoch ms), refreshed every 5 s while `live`. Missing `at`: null. */
export function useAgo(at: string | number | null | undefined, live = true): string | null {
  const t = at == null ? null : typeof at === 'number' ? at : Date.parse(at);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (t == null || !live) return undefined;
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(i);
  }, [t, live]);
  return t == null || Number.isNaN(t) ? null : formatAgo(now - t);
}
