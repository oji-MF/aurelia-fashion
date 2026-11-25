import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/security/rate-limit";
import { saveImage, UploadError } from "@/lib/storage";

export async function POST(request: Request) {
  const limited = rateLimit(request, "upload", 20, 60_000);
  if (limited) return limited;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ error: "No files provided." }, { status: 400 });
    const results = [];
    for (const file of files) {
      results.push(await saveImage(file));
    }
    return NextResponse.json({ images: results });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
