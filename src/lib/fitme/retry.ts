export async function withLimitedRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 450,
): Promise<T> {
  let lastError: unknown;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (index < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (index + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("La tentative a échoué.");
}
