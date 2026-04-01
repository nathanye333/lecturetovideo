const stageLatencyMs = new Map<string, number[]>();

export function recordStageLatency(stage: string, latencyMs: number): void {
  const current = stageLatencyMs.get(stage) ?? [];
  current.push(latencyMs);
  stageLatencyMs.set(stage, current);
}

export function getMetricSnapshot(): Record<string, { count: number; avgMs: number }> {
  const result: Record<string, { count: number; avgMs: number }> = {};
  for (const [stage, values] of stageLatencyMs.entries()) {
    const total = values.reduce((acc, value) => acc + value, 0);
    result[stage] = {
      count: values.length,
      avgMs: Math.round(total / values.length),
    };
  }
  return result;
}
