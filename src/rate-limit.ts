export type RateLimitDecision = { allowed: boolean; retryAfterSeconds: number };

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, { count: number; resetsAt: number }>();

  constructor(
    private readonly maxRequests = 60,
    private readonly windowMs = 60_000,
    private readonly now: () => number = Date.now
  ) {
    if (!Number.isSafeInteger(maxRequests) || maxRequests < 1) throw new Error("Invalid maxRequests");
    if (!Number.isSafeInteger(windowMs) || windowMs < 1) throw new Error("Invalid windowMs");
  }

  check(key: string): RateLimitDecision {
    const time = this.now();
    const previous = this.entries.get(key);
    if (!previous || time >= previous.resetsAt) {
      this.entries.set(key, { count: 1, resetsAt: time + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (previous.count >= this.maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((previous.resetsAt - time) / 1000)) };
    }
    previous.count++;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  prune(): void {
    const time = this.now();
    for (const [key, entry] of this.entries) {
      if (time >= entry.resetsAt) this.entries.delete(key);
    }
  }
}
