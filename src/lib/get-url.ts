export function getUrl(path?: string) {
  const baseUrl = process.env.EXPO_PUBLIC_APP_URL || "";
  const normalizedPath =
    path && !path.startsWith("/") ? `/${path}` : path || "";
  return `${baseUrl}${normalizedPath}`;
}
