import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ID, Permission, Role } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const MAX_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {}

function hasValidSignature(buffer: Buffer, mime: string) {
  const hex = buffer.subarray(0, 12).toString("hex").toLowerCase();
  if (mime === "image/jpeg") return hex.startsWith("ffd8ff");
  if (mime === "image/png") return hex.startsWith("89504e470d0a1a0a");
  if (mime === "image/webp") return hex.startsWith("52494646") && hex.slice(16, 20) === "57454250";
  if (mime === "image/avif") return hex.slice(8, 12) === "66747970" && hex.slice(16, 24).includes("61766966");
  return false;
}

export function getUploadDir() {
  return process.env.VERCEL
    ? path.join(os.tmpdir(), "aurelia-uploads")
    : path.join(process.cwd(), ".data", "uploads");
}

export async function saveImage(file: File): Promise<{ url: string; name: string }> {
  const extension = ALLOWED.get(file.type);
  if (!extension) throw new UploadError("Only JPG, PNG, WebP and AVIF images are allowed.");
  if (file.size === 0 || file.size > MAX_BYTES) {
    throw new UploadError("Images must be between 1 byte and 5 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, file.type)) {
    throw new UploadError("The file does not appear to be a valid image.");
  }

  const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || "product_images";
  if (isAppwriteConfigured && process.env.APPWRITE_STORAGE_BUCKET_ID) {
    try {
      const { storage } = createAdminClient();
      const uploaded = await storage.createFile(
        bucketId,
        ID.unique(),
        new File([buffer], file.name || `upload.${extension}`, { type: file.type }),
        [Permission.read(Role.any())],
      );
      const url = `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${appwriteConfig.projectId}`;
      return { url, name: uploaded.$id };
    } catch (error) {
      throw new UploadError(error instanceof Error ? error.message : "Storage upload failed.");
    }
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  await fs.mkdir(getUploadDir(), { recursive: true });
  await fs.writeFile(path.join(getUploadDir(), name), buffer);
  return { url: `/api/uploads/${name}`, name };
}

export async function readUpload(name: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  try {
    return await fs.readFile(path.join(getUploadDir(), name));
  } catch {
    return null;
  }
}
