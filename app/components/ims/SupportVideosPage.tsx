"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "./ui";
import {
  deleteSupportVideo,
  getSupportVideos,
  uploadSupportVideo,
  type SupportVideo,
  type SupportVideoLanguage,
  type SupportVideoMap,
} from "../../lib/supportVideosApi";

const LANGUAGES: Array<{ id: SupportVideoLanguage; label: string; hint: string }> = [
  { id: "hindi", label: "Hindi Video", hint: "Shown to customers who pick the Hindi tab." },
  { id: "english", label: "English Video", hint: "Shown to customers who pick the English tab." },
];

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function LanguageCard({
  language,
  label,
  hint,
  video,
  onChanged,
}: {
  language: SupportVideoLanguage;
  label: string;
  hint: string;
  video: SupportVideo | null;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    setNotice("");

    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("Video must be 100 MB or smaller. Please compress it and try again.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      await uploadSupportVideo({ language, file, onProgress: setProgress });
      setNotice("Video uploaded. It is now live on the customer support page.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Remove the ${label.toLowerCase()} from the customer support page?`)) return;
    setError("");
    setNotice("");
    try {
      await deleteSupportVideo(language);
      setNotice("Video removed.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove video.");
    }
  };

  const duration = formatDuration(video?.durationSeconds);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-gray-900">{label}</div>
          <div className="mt-0.5 text-xs text-gray-500">{hint}</div>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            video ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {video ? "Live" : "Not uploaded"}
        </span>
      </div>

      {video ? (
        <div className="mt-4">
          <video
            key={video.url}
            src={video.url}
            controls
            preload="metadata"
            className="w-full rounded-xl border border-gray-200 bg-black"
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {duration && <span>Duration {duration}</span>}
            {video.updatedAt && <span>Updated {new Date(video.updatedAt).toLocaleDateString("en-IN")}</span>}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
          No video uploaded yet
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />

      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs font-semibold text-gray-500">Uploading to Cloudinary… {progress}%</div>
        </div>
      )}

      {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
      {notice && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{notice}</div>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`rounded px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-200 transition ${
            uploading
              ? "cursor-not-allowed bg-gray-300 shadow-none"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
          }`}
        >
          {uploading ? "Uploading…" : video ? "Replace Video" : "Upload Video"}
        </button>
        {video && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function SupportVideosPage() {
  const [videos, setVideos] = useState<SupportVideoMap>({ hindi: null, english: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    getSupportVideos()
      .then((data) => {
        setVideos(data);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Could not load videos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Customer Support Videos"
        sub="Upload the complaint walkthrough videos customers watch beside the support form. Videos stream from Cloudinary for fast playback."
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400 shadow-sm">Loading videos…</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {LANGUAGES.map((entry) => (
            <LanguageCard
              key={entry.id}
              language={entry.id}
              label={entry.label}
              hint={entry.hint}
              video={videos[entry.id]}
              onChanged={load}
            />
          ))}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs leading-5 text-amber-900">
        <div className="font-bold uppercase tracking-wide">Upload tips</div>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>MP4 (H.264) gives the widest device support and the smallest file.</li>
          <li>Keep each video under 100 MB — long videos cost customers mobile data.</li>
          <li>Uploading a new file automatically replaces the previous one.</li>
        </ul>
      </div>
    </div>
  );
}
