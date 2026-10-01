/** Current month plus the next eleven months, preserving the existing window. */
export function getYear12Months(now = new Date()): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

/** Add saved historical months to the current/future window in calendar order. */
export function getMonthKeysWithHistory(
  savedKeys: Iterable<string>,
  rollingKeys = getYear12Months(),
): string[] {
  const validMonthKey = /^\d{4}-(0[1-9]|1[0-2])$/;
  return [...new Set([...rollingKeys, ...savedKeys].filter(key => validMonthKey.test(key)))].sort();
}
