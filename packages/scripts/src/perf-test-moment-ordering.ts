/**
 * Performance test: Timestamp sort vs Separate array for moment ordering
 * Run with: bun run src/perf-test-moment-ordering.ts
 */

interface MomentWithTimestamp {
  id: string;
  status: "available" | "lived" | "passed" | "hidden" | "locked";
  livedAt?: number;
}

// Generate test data
function generateMoments(
  count: number,
  livedRatio: number = 0.1
): {
  momentsRecord: Record<string, MomentWithTimestamp>;
  historyArray: string[];
} {
  const momentsRecord: Record<string, MomentWithTimestamp> = {};
  const historyArray: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = `moment_${i}`;
    const isLived = Math.random() < livedRatio;

    momentsRecord[id] = {
      id,
      status: isLived ? "lived" : "available",
      livedAt: isLived ? Date.now() - Math.random() * 1000000 : undefined,
    };

    if (isLived) {
      historyArray.push(id);
    }
  }

  // Shuffle history array to simulate real insertion order
  for (let i = historyArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [historyArray[i], historyArray[j]] = [historyArray[j], historyArray[i]];
  }

  return { momentsRecord, historyArray };
}

// Approach A: Filter + Sort by timestamp
function getHistoryByTimestamp(
  moments: Record<string, MomentWithTimestamp>
): MomentWithTimestamp[] {
  return Object.values(moments)
    .filter((m) => m.status === "lived")
    .sort((a, b) => (a.livedAt ?? 0) - (b.livedAt ?? 0));
}

// Approach B: Map from array
function getHistoryByArray(
  moments: Record<string, MomentWithTimestamp>,
  historyArray: string[]
): MomentWithTimestamp[] {
  return historyArray.map((id) => moments[id]!);
}

// Benchmark function
function benchmark(fn: () => void, iterations: number = 1000): number {
  // Warmup
  for (let i = 0; i < 10; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  return (end - start) / iterations;
}

// Run tests
console.log("Performance Test: Moment Ordering\n");
console.log("Assumptions:");
console.log('- 10% of moments are "lived" (rest are available/locked/etc)');
console.log("- 1000 iterations per test\n");
console.log("=".repeat(70));

const testSizes = [50, 100, 2000, 10000, 100000];

for (const size of testSizes) {
  const { momentsRecord, historyArray } = generateMoments(size);
  const livedCount = historyArray.length;

  console.log(
    `\nTotal moments: ${size.toLocaleString()} | Lived moments: ${livedCount.toLocaleString()}`
  );
  console.log("-".repeat(70));

  const timestampTime = benchmark(() => getHistoryByTimestamp(momentsRecord));

  const arrayTime = benchmark(() =>
    getHistoryByArray(momentsRecord, historyArray)
  );

  console.log(`Timestamp + Sort:  ${timestampTime.toFixed(4)} ms per call`);
  console.log(`Separate Array:    ${arrayTime.toFixed(4)} ms per call`);
  console.log(
    `Winner:            ${timestampTime < arrayTime ? "Timestamp" : "Array"} (${Math.abs(timestampTime - arrayTime).toFixed(4)} ms faster)`
  );
  console.log(
    `Ratio:             Array is ${(timestampTime / arrayTime).toFixed(1)}x ${timestampTime > arrayTime ? "faster" : "slower"}`
  );
}

console.log("\n" + "=".repeat(70));
console.log("\nConclusion:");
console.log(
  "- For typical game (50-500 moments): Both are <0.1ms, negligible difference"
);
console.log("- For extreme cases (10k+): Array approach scales better");
console.log("- Recommendation: Choose based on code simplicity, not performance");
