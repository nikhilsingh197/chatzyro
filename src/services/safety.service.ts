export function safetyFilter(message: string) {
  const blockedPatterns = ["http://spam", "free money", "click here"];

  const lower = message.toLowerCase();

  for (const pattern of blockedPatterns) {
    if (lower.includes(pattern)) {
      return {
        safe: false,
        reason: "Blocked pattern detected",
      };
    }
  }

  return { safe: true };
}
