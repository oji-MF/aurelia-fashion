import { NextResponse } from "next/server";
import { readUpload } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const buffer = await readUpload(name);
  if (!buffer) return new NextResponse("Not found", { status: 404 });
  const type = TYPES[name.split(".").pop() || ""] || "application/octet-stream";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
