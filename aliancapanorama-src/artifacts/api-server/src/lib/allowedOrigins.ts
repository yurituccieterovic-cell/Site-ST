const replitDomains = process.env["REPLIT_DOMAINS"]
  ? process.env["REPLIT_DOMAINS"].split(",").map((d) => `https://${d.trim()}`)
  : [];

const extraAllowedOrigins = process.env["ALLOWED_ORIGINS"]
  ? process.env["ALLOWED_ORIGINS"]
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : [];

export const allowedOrigins = new Set<string>([
  ...replitDomains,
  ...extraAllowedOrigins,
  "http://localhost",
  "http://localhost:80",
  "http://localhost:3000",
  "http://localhost:18434",
  "https://pap-tan-seven.vercel.app",
  "https://projetoaliancapanoramapap.replit.app",
  "https://pap.sociedadetucci.com.br",
  "https://sociedadetucci.com.br",
  "https://www.sociedadetucci.com.br",
]);

const allowedOriginPatterns: RegExp[] = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+\.replit\.app$/i,
  /^https:\/\/[a-z0-9-]+\.replit\.dev$/i,
];

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return allowedOriginPatterns.some((re) => re.test(origin));
}
