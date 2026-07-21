"use client";

import { apiRequest } from "./api";

export type SupportVideoLanguage = "hindi" | "english";

export type SupportVideo = {
  language: SupportVideoLanguage;
  url: string;
  title?: string;
  durationSeconds?: number;
  updatedAt?: string;
};

export type SupportVideoMap = Record<SupportVideoLanguage, SupportVideo | null>;

type CloudinaryUploadTicket = {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: string;
  folder: string;
  signature: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  format?: string;
  duration?: number;
  bytes?: number;
};

export async function getSupportVideos(): Promise<SupportVideoMap> {
  return apiRequest<SupportVideoMap>("/api/support-videos", { method: "GET", auth: false });
}

/**
 * Push the file straight to Cloudinary using short-lived signed params.
 *
 * The API host caps request bodies well below video size, so the file never
 * travels through our backend — only the resulting URL is saved afterwards.
 */
function uploadToCloudinary(
  file: File,
  ticket: CloudinaryUploadTicket,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", ticket.apiKey);
    body.append("timestamp", ticket.timestamp);
    body.append("folder", ticket.folder);
    body.append("signature", ticket.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", ticket.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let payload: CloudinaryUploadResponse & { error?: { message?: string } };
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Unexpected response from Cloudinary"));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(payload?.error?.message || `Cloudinary upload failed (${xhr.status})`));
        return;
      }
      resolve(payload);
    };

    xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.send(body);
  });
}

export async function uploadSupportVideo(input: {
  language: SupportVideoLanguage;
  file: File;
  title?: string;
  onProgress?: (percent: number) => void;
}): Promise<SupportVideo> {
  const ticket = await apiRequest<CloudinaryUploadTicket>("/api/support-videos/upload-ticket", {
    method: "POST",
  });

  const uploaded = await uploadToCloudinary(input.file, ticket, input.onProgress);
  const url = uploaded.secure_url || uploaded.url;
  if (!url) throw new Error("Cloudinary did not return a video URL");

  return apiRequest<SupportVideo>(`/api/support-videos/${input.language}`, {
    method: "PUT",
    body: JSON.stringify({
      url,
      publicId: uploaded.public_id,
      format: uploaded.format,
      durationSeconds: uploaded.duration,
      bytes: uploaded.bytes,
      originalFileName: input.file.name,
      title: input.title,
    }),
  });
}

export async function deleteSupportVideo(language: SupportVideoLanguage) {
  return apiRequest<{ language: string; removed: boolean }>(`/api/support-videos/${language}`, {
    method: "DELETE",
  });
}
