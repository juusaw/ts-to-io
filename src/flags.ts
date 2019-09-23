const MAX_FLAG_COUNT = 28;

const values = new Array(MAX_FLAG_COUNT)
  .fill(undefined)
  .map((_, i) => Math.max(1, 2 << (i - 1)));

export function extractFlags(input: number) {
  const flags = [];
  for (let i = MAX_FLAG_COUNT; i >= 0; i--) {
    if (input >= values[i]) {
      input -= values[i];
      flags.push(values[i]);
    }
    if (input === 0) return flags;
  }
  return flags;
}
