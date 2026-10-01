let parsed: string[] = [];

try {
  parsed = JSON.parse(process.env.EXPO_PUBLIC_IDS || "[]");
} catch {
  parsed = [];
}

export const userIds = parsed;
