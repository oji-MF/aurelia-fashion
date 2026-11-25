"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function ImageUploader({ onUploaded }: { onUploaded: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      list.forEach((file) => form.append("files", file));
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      const urls: string[] = (data.images || []).map((image: { url: string }) => image.url);
      onUploaded(urls);
      toast(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files); }}
      className={`mb-2 flex items-center justify-between gap-3 border border-dashed px-4 py-3 transition-colors ${dragging ? "border-accent bg-accent/5" : "border-line/25"}`}
    >
      <div className="flex items-center gap-3">
        <ImagePlus className="h-4 w-4 text-accent" />
        <p className="text-xs text-stone">Drop images here or choose files (JPG, PNG, WebP · max 5 MB each)</p>
      </div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="shrink-0 border border-line/20 px-3 py-1.5 text-[11px] hover:border-accent disabled:opacity-50">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Choose files"}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
    </div>
  );
}
