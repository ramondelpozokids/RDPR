import { NextResponse } from "next/server";
import { pingAllProviders, summarizePingResults, PROVIDER_META } from "@/lib/ai/providerPing";

function isPingAuthorized(req: Request): boolean {
  const secret = process.env.AI_PING_SECRET?.trim();
  if (secret) {
    const url = new URL(req.url);
    const header = req.headers.get("x-ai-ping-secret");
    const query = url.searchParams.get("secret");
    if (header === secret || query === secret) return true;
  }
  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) return true;
  return false;
}

export async function GET(req: Request) {
  if (!isPingAuthorized(req)) {
    return NextResponse.json(
      { error: "No autorizado. Usa ?secret= con AI_PING_SECRET." },
      { status: 401 }
    );
  }

  const started = Date.now();
  const providers = await pingAllProviders();
  const summary = summarizePingResults(providers);

  return NextResponse.json({
    project: process.env.AUTH_URL || "rdpr",
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    roles: PROVIDER_META,
    summary,
    providers,
  });
}
