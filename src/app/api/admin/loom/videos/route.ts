import { NextResponse } from "next/server";
import { getProfile } from "@/lib/session";

export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.LOOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LOOM_API_KEY not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() ?? "";

  const res = await fetch("https://api.loom.com/v1/videos", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Loom videos" },
      { status: res.status },
    );
  }

  const body = await res.json();
  const videos = (body.videos ?? body.data ?? body ?? []) as Array<{
    id: string;
    title?: string;
    name?: string;
    duration?: number;
    thumbnail_url?: string;
    urls?: { share_url?: string };
  }>;

  const filtered = videos
    .filter((v) => {
      const title = (v.title ?? v.name ?? "").toLowerCase();
      return !query || title.includes(query);
    })
    .slice(0, 50)
    .map((v) => ({
      id: v.id,
      title: v.title ?? v.name ?? "Untitled",
      duration: v.duration,
      thumbnailUrl: v.thumbnail_url,
      shareUrl: v.urls?.share_url,
    }));

  return NextResponse.json({ videos: filtered });
}
